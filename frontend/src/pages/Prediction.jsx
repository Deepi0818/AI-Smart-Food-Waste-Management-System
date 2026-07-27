import { useEffect, useState } from "react";
import { Sparkles, Loader2, Leaf, Users, Gauge, HandHeart } from "lucide-react";
import api from "../api/client";
import { PageHeader } from "../components/Common";

export default function Prediction() {
  const [options, setOptions] = useState({ event_types: [], food_types: [], meal_types: [] });
  const [form, setForm] = useState({ event_type: "", guests: "", food_type: "", meal_type: "", event_date: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/prediction/options").then(({ data }) => {
      setOptions(data);
      setForm((f) => ({
        ...f,
        event_type: data.event_types[0],
        food_type: data.food_types[0],
        meal_type: data.meal_types[0],
      }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/prediction/predict", { ...form, guests: Number(form.guests) });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const recColor = {
    "NGO Donation": "from-emerald-500 to-emerald-600",
    "Animal Feed Distribution": "from-royal-500 to-royal-700",
    "Composting": "from-orange-400 to-orange-500",
  };

  return (
    <div>
      <PageHeader
        icon={Sparkles}
        title="AI Food Waste Prediction"
        subtitle="Machine learning estimate of surplus food, with explainable confidence and recommendations"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 glass-card p-6 space-y-4 h-fit">
          <div>
            <label className="label-text">Event Type</label>
            <select className="input-field" value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
              {options.event_types.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Number of Guests</label>
            <input type="number" min="1" required className="input-field" placeholder="e.g. 250"
              value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Food Type</label>
            <select className="input-field" value={form.food_type}
              onChange={(e) => setForm({ ...form, food_type: e.target.value })}>
              {options.food_types.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Meal Type</label>
            <select className="input-field" value={form.meal_type}
              onChange={(e) => setForm({ ...form, meal_type: e.target.value })}>
              {options.meal_types.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Event Date</label>
            <input type="date" className="input-field" value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? <><Loader2 size={17} className="animate-spin" /> Analyzing...</> : <><Sparkles size={17} /> Run AI Prediction</>}
          </button>
        </form>

        {/* Result */}
        <div className="lg:col-span-3">
          {!result && !loading && (
            <div className="glass-card h-full min-h-[420px] flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                <Sparkles size={26} className="text-emerald-400" />
              </div>
              <p className="font-semibold text-slate-600">No prediction yet</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">Fill in event details and run the AI model to see your waste estimate.</p>
            </div>
          )}

          {loading && (
            <div className="glass-card h-full min-h-[420px] flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
              <p className="text-sm text-slate-400">Running RandomForest inference across {form.guests || "N"} guests...</p>
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-slide-up">
              <div className={`glass-card !bg-gradient-to-br ${recColor[result.recommendation] || "from-emerald-500 to-emerald-600"} p-8 text-white`}>
                <p className="text-emerald-50 text-sm font-medium">Predicted Food Waste</p>
                <p className="font-display text-5xl font-extrabold mt-1">{result.predicted_waste_kg} <span className="text-2xl">kg</span></p>
                <div className="flex items-center gap-2 mt-4">
                  <Gauge size={16} />
                  <span className="text-sm font-semibold">Confidence: {result.confidence}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <HandHeart size={18} /> <span className="font-bold text-slate-900">{result.recommendation}</span>
                  </div>
                  <p className="text-sm text-slate-500">{result.recommendation_reason}</p>
                </div>
                <div className="glass-card p-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><Leaf size={15} className="text-emerald-500" /> CO₂ Saved</span>
                    <span className="font-bold text-slate-900">{result.co2_saved_kg} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><Users size={15} className="text-royal-500" /> People Feedable</span>
                    <span className="font-bold text-slate-900">{result.people_feedable}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Feature Importance (Explainable AI)</p>
                <div className="space-y-2.5">
                  {Object.entries(result.feature_importance || {}).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize text-slate-600 font-medium">{k.replace("_", " ")}</span>
                        <span className="text-slate-400">{Math.round(v * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-emerald-500 to-royal-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${v * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
