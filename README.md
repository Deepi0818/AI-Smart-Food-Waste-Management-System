# AI Smart Food Waste Analysis & Redistribution System

A full-stack platform that predicts food waste before it happens, verifies food freshness from a
photo using computer vision, and routes surplus food to nearby NGOs — with an enterprise-grade
analytics dashboard, PDF/CSV/Excel reporting, and an AI chatbot.

## Project Structure

```
foodwaste-platform/
├── backend/            Flask REST API, SQLite database, ML models
│   ├── app.py          Main entry point
│   ├── database.py     Schema + seed data
│   ├── models/          waste_predictor.py, freshness_classifier.py
│   ├── routes/          11 blueprint modules (one per feature)
│   ├── utils/            auth, PDF report generator, tracking-code generator
│   └── requirements.txt
└── frontend/            React 18 + Vite + Tailwind CSS + Recharts
    ├── src/pages/        13 feature pages
    ├── src/components/
    └── package.json
```

## Quick Start

### 1. Backend (Flask API)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 app.py
```

The API runs at `http://localhost:5000`. On first run it auto-creates `data/foodwaste.db`,
trains both ML models (a few seconds), and seeds 6 demo NGOs plus a demo login:

```
Email:    demo@foodwaste.ai
Password: Demo@1234
```

**Optional — live AI chatbot:** set `ANTHROPIC_API_KEY` in your environment before starting the
server to have the chatbot answer via a real Claude call instead of the offline rule-based fallback:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
pip install anthropic
python3 app.py
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api/*` requests to the Flask backend
(see `vite.config.js`), so no CORS configuration is needed in development.

### 3. Production Build

```bash
cd frontend
npm run build      # outputs static files to frontend/dist
```
Serve `dist/` with any static host, and point `VITE_API_URL` (see `.env.example`) at your
deployed backend URL.

## Honest Technical Notes (documented, not hidden)

This project was built in an environment without internet/package-registry access, which shaped
two real (and defensible) architecture choices — both documented in-app on the **About** page:

1. **Food Image AI** uses engineered computer-vision features (color histograms, browning/dark-spot/
   mold-pattern detection, texture energy) feeding a trained `RandomForestClassifier`, rather than a
   deep CNN — this mirrors real low-latency, explainable, edge-deployable production systems.
   Swapping in a transfer-learned CNN is a documented future step.
2. **Donation tracking code** is a deterministic, hash-derived visual (styled like a QR code) rather
   than a standards-compliant scannable QR, since no QR library could be installed offline. Swapping
   in `qrcode`/`segno` is a one-line change (`pip install qrcode` + a few lines in
   `backend/utils/qr_generator.py`).

Everything else — the ML prediction model, the Flask API, the database, the PDF/CSV/Excel exports,
and the full React frontend — is genuinely implemented and was tested end-to-end during development.

## Tech Stack

**Backend:** Python, Flask, SQLite, PyJWT, scikit-learn, Pillow, ReportLab, Matplotlib, OpenPyXL
**Frontend:** React 18, React Router, Tailwind CSS, Recharts, Axios, Lucide Icons, Vite

## License

Built for academic and hackathon demonstration purposes.
