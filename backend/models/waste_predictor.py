"""
waste_predictor.py
------------------
Trains and serves a RandomForestRegressor that predicts food waste (kg)
for an event, based on event type, guest count, food type, and meal type.

Training data is synthetically generated using domain-informed rules
(per-guest consumption baselines + category multipliers + noise) since
no proprietary catering dataset is available offline. This keeps the
model genuinely learned (not hardcoded if/else), reproducible, and
explainable -- appropriate for a hackathon-grade prototype where the
architecture (feature engineering -> ensemble model -> confidence
+ explanation) is the deliverable, with real catering data as the
documented "future scope" swap-in.
"""

import os
import json
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, "waste_model.joblib")
META_PATH = os.path.join(MODEL_DIR, "waste_model_meta.json")

EVENT_TYPES = ["Wedding", "Birthday Party", "Corporate Event", "College Fest",
               "Religious Function", "Conference", "Family Gathering"]
FOOD_TYPES = ["Veg Buffet", "Non-Veg Buffet", "Mixed Buffet", "Snacks Only", "Full Course Meal"]
MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"]

# Baseline kg of food prepared per guest, by food type (domain heuristic)
FOOD_TYPE_BASE = {
    "Veg Buffet": 0.55, "Non-Veg Buffet": 0.65, "Mixed Buffet": 0.60,
    "Snacks Only": 0.25, "Full Course Meal": 0.75,
}
# Waste fraction tendency by event type (weddings/functions over-order more)
EVENT_WASTE_FACTOR = {
    "Wedding": 0.22, "Birthday Party": 0.15, "Corporate Event": 0.10,
    "College Fest": 0.13, "Religious Function": 0.18, "Conference": 0.09,
    "Family Gathering": 0.12,
}
MEAL_FACTOR = {"Breakfast": 0.9, "Lunch": 1.05, "Dinner": 1.1, "Snacks": 0.6}


def _encode(event_type, food_type, meal_type, guests):
    return [
        EVENT_TYPES.index(event_type),
        FOOD_TYPES.index(food_type),
        MEAL_TYPES.index(meal_type),
        guests,
    ]


def _generate_synthetic_dataset(n=6000, seed=42):
    rng = np.random.default_rng(seed)
    X, y = [], []
    for _ in range(n):
        event_type = rng.choice(EVENT_TYPES)
        food_type = rng.choice(FOOD_TYPES)
        meal_type = rng.choice(MEAL_TYPES)
        guests = int(rng.integers(20, 1500))

        base_per_guest = FOOD_TYPE_BASE[food_type]
        waste_factor = EVENT_WASTE_FACTOR[event_type]
        meal_mult = MEAL_FACTOR[meal_type]

        # Larger events over-order proportionally more (bulk misjudgment)
        scale_bump = 1 + min(guests / 3000, 0.18)
        expected_waste = guests * base_per_guest * waste_factor * meal_mult * scale_bump

        # Realistic noise
        noise = rng.normal(0, expected_waste * 0.12 + 0.5)
        waste_kg = max(0.5, expected_waste + noise)

        X.append(_encode(event_type, food_type, meal_type, guests))
        y.append(waste_kg)
    return np.array(X), np.array(y)


def train_and_save():
    X, y = _generate_synthetic_dataset()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    model = RandomForestRegressor(
        n_estimators=250, max_depth=14, min_samples_leaf=3,
        random_state=42, n_jobs=-1,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, preds))
    r2 = float(r2_score(y_test, preds))

    joblib.dump(model, MODEL_PATH)
    with open(META_PATH, "w") as f:
        json.dump({"mae_kg": round(mae, 3), "r2_score": round(r2, 4),
                    "n_train": len(X_train), "n_test": len(X_test)}, f, indent=2)

    return model, {"mae_kg": mae, "r2_score": r2}


def load_model():
    if not os.path.exists(MODEL_PATH):
        model, _ = train_and_save()
        return model
    return joblib.load(MODEL_PATH)


_model = None


def get_model():
    global _model
    if _model is None:
        _model = load_model()
    return _model


def get_model_metrics():
    if os.path.exists(META_PATH):
        with open(META_PATH) as f:
            return json.load(f)
    return {"mae_kg": None, "r2_score": None}


def _recommendation_for(waste_kg, food_type):
    """Rule-based explainable recommendation layered on top of the ML estimate."""
    if waste_kg < 5:
        return ("Composting", "Waste volume is low -- composting is the most practical option.")
    elif waste_kg < 25:
        return ("Animal Feed Distribution", "Moderate surplus suitable for verified animal feed partners.")
    else:
        return ("NGO Donation", "Large surplus detected -- immediate donation to a nearby NGO is recommended to maximize impact within the food safety window.")


def predict_waste(event_type, guests, food_type, meal_type):
    if event_type not in EVENT_TYPES:
        event_type = "Family Gathering"
    if food_type not in FOOD_TYPES:
        food_type = "Mixed Buffet"
    if meal_type not in MEAL_TYPES:
        meal_type = "Lunch"

    model = get_model()
    features = np.array([_encode(event_type, food_type, meal_type, guests)])
    predicted_kg = float(model.predict(features)[0])
    predicted_kg = round(max(0.3, predicted_kg), 2)

    # Confidence derived from agreement across the forest's individual trees
    tree_preds = np.array([t.predict(features)[0] for t in model.estimators_])
    spread = float(np.std(tree_preds))
    relative_spread = spread / max(predicted_kg, 1e-6)
    confidence = round(max(55.0, min(97.5, 97.5 - relative_spread * 120)), 1)

    action, reason = _recommendation_for(predicted_kg, food_type)

    # Environmental impact: ~2.5 kg CO2e avoided per kg of food saved from landfill
    co2_saved = round(predicted_kg * 2.5, 2)
    # ~0.4 kg of food feeds one person a meal (rough NGO benchmark)
    people_feedable = int(predicted_kg / 0.4)

    return {
        "predicted_waste_kg": predicted_kg,
        "confidence": confidence,
        "recommendation": action,
        "recommendation_reason": reason,
        "co2_saved_kg": co2_saved,
        "people_feedable": people_feedable,
        "feature_importance": {
            "event_type": round(float(model.feature_importances_[0]), 3),
            "food_type": round(float(model.feature_importances_[1]), 3),
            "meal_type": round(float(model.feature_importances_[2]), 3),
            "guests": round(float(model.feature_importances_[3]), 3),
        },
    }


if __name__ == "__main__":
    m, metrics = train_and_save()
    print("Trained model metrics:", metrics)
    print(predict_waste("Wedding", 500, "Non-Veg Buffet", "Dinner"))
