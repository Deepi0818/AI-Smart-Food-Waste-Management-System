import { Info, Cpu, Layers, Rocket, Github } from "lucide-react";
import { PageHeader } from "../components/Common";

const STACK = [
  { group: "Frontend", items: ["React 18", "React Router", "Tailwind CSS", "Recharts", "Axios", "Vite"] },
  { group: "Backend", items: ["Python", "Flask", "SQLite", "JWT Auth", "ReportLab (PDF)", "OpenPyXL"] },
  { group: "AI / ML", items: ["scikit-learn RandomForest", "Engineered CV features (PIL/NumPy)", "Explainable feature importance", "Optional live LLM chatbot"] },
];

const FEATURES = [
  "Secure JWT authentication with session management",
  "ML-based food waste prediction with confidence scoring",
  "Computer-vision food freshness detection",
  "Donation logging with tracking codes",
  "NGO discovery with real-time distance sorting",
  "Enterprise analytics dashboard with live charts",
  "Searchable prediction history with CSV/Excel export",
  "Branded PDF impact reports",
  "AI chatbot for food safety and donation guidance",
  "Live notifications system",
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader icon={Info} title="About This Platform" subtitle="AI Smart Food Waste Analysis & Redistribution System" />

      <div className="glass-card p-6">
        <p className="text-slate-600 leading-relaxed">
          This platform combines machine learning, computer vision, and NGO logistics to tackle food
          waste at the source. It predicts likely surplus before an event happens, verifies the freshness
          of food from a photo, and routes eligible surplus to nearby NGOs — while giving organizers a
          full analytics view of their environmental and social impact.
        </p>
      </div>

      <div className="glass-card p-6">
        <p className="font-display font-bold text-slate-900 mb-4 flex items-center gap-2"><Cpu size={16} className="text-emerald-500" /> Technology Stack</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {STACK.map((s) => (
            <div key={s.group}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">{s.group}</p>
              <ul className="space-y-1.5">
                {s.items.map((i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <p className="font-display font-bold text-slate-900 mb-4 flex items-center gap-2"><Layers size={16} className="text-royal-500" /> Feature Modules</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {FEATURES.map((f) => (
            <div key={f} className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{f}</div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <p className="font-display font-bold text-slate-900 mb-2 flex items-center gap-2"><Rocket size={16} className="text-orange-400" /> Future Scope & Honest Notes</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Food Image AI currently uses engineered computer-vision features (color, texture, spot detection) feeding a trained classifier, rather than a deep CNN — a deliberate, explainable, edge-deployable design choice. Swapping in a transfer-learned CNN (e.g. on a labelled fresh/rotten produce dataset) is a documented next step once GPU/cloud access is available.</li>
          <li>• The donation tracking visual is a deterministic, hash-derived code image styled like a QR code for the demo; integrating a standards-compliant scannable QR library is a one-line change.</li>
          <li>• The AI chatbot can run on a live LLM (Anthropic Claude) when an API key is configured, with an offline rule-based fallback so the feature always works.</li>
          <li>• NGO data is demo/seed data for illustration; a production deployment would integrate a verified NGO registry.</li>
        </ul>
      </div>

      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Github size={13} /> Version 1.0.0 — Built for hackathon & academic demonstration
      </div>
    </div>
  );
}
