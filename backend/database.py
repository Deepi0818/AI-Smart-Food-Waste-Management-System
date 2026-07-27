"""
database.py
Handles SQLite database connection, schema creation, and seed data
for the AI Smart Food Waste Analysis & Redistribution System.
"""

import sqlite3
import os
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash


def now_iso():
    return datetime.now(timezone.utc).isoformat()

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "foodwaste.db")


def get_connection():
    """Return a SQLite connection with foreign keys enabled and Row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    guests INTEGER NOT NULL,
    food_type TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    event_date TEXT NOT NULL,
    predicted_waste_kg REAL NOT NULL,
    confidence REAL NOT NULL,
    recommendation TEXT NOT NULL,
    co2_saved_kg REAL NOT NULL,
    people_feedable INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    donation_code TEXT NOT NULL UNIQUE,
    food_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity_kg REAL NOT NULL,
    cooking_time TEXT,
    expiry_time TEXT,
    location TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    image_path TEXT,
    freshness_label TEXT,
    freshness_confidence REAL,
    donation_eligible INTEGER,
    notes TEXT,
    status TEXT DEFAULT 'Pending',
    ngo_id INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES ngos (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ngos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL,
    availability TEXT DEFAULT 'Available',
    capacity_kg_per_day REAL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_user ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
"""

DEMO_NGOS = [
    ("Annam Trust Community Kitchen", "T. Nagar, Chennai", 13.0418, 80.2341, "+91-9840011223", "Community Kitchen", "Available", 80),
    ("Green Plate Foundation", "Anna Nagar, Chennai", 13.0850, 80.2101, "+91-9840033445", "NGO", "Available", 60),
    ("Sahaya Food Bank", "Velachery, Chennai", 12.9791, 80.2212, "+91-9840055667", "Food Bank", "Busy", 100),
    ("Care & Share Shelter", "Adyar, Chennai", 13.0067, 80.2570, "+91-9840077889", "Shelter Home", "Available", 40),
    ("Bright Future Orphanage Support", "Mylapore, Chennai", 13.0339, 80.2691, "+91-9840099001", "Orphanage", "Available", 35),
    ("Helping Hands Relief Network", "Guindy, Chennai", 13.0067, 80.2206, "+91-9840012121", "NGO", "Available", 70),
]


def seed_ngos(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM ngos")
    if cur.fetchone()[0] == 0:
        cur.executemany(
            """INSERT INTO ngos (name, address, latitude, longitude, phone, category, availability, capacity_kg_per_day)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            DEMO_NGOS,
        )
        conn.commit()


def seed_demo_user(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] == 0:
        cur.execute(
            """INSERT INTO users (name, email, password_hash, role, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (
                "Demo Admin",
                "demo@foodwaste.ai",
                generate_password_hash("Demo@1234"),
                "admin",
                now_iso(),
            ),
        )
        conn.commit()


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_connection()
    conn.executescript(SCHEMA)
    conn.commit()
    seed_ngos(conn)
    seed_demo_user(conn)
    conn.close()


if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
