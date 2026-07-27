import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Globe, User, CheckCircle2 } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/Common";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
];

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/settings").then(({ data }) => setSettings(data));
  }, []);

  const save = async (updates) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    await api.put("/settings", updates);
    if (updates.theme) {
      document.documentElement.classList.toggle("dark", updates.theme === "dark");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  if (!settings) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Manage your profile, appearance, and notification preferences" />

      <div className="glass-card p-6">
        <p className="font-display font-bold text-slate-900 mb-4 flex items-center gap-2"><User size={16} className="text-emerald-500" /> Profile</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Full Name</label>
            <input className="input-field" value={settings.name || ""}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              onBlur={() => save({ name: settings.name })} />
          </div>
          <div>
            <label className="label-text">Email Address</label>
            <input className="input-field bg-slate-50" value={settings.email || ""} disabled />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <p className="font-display font-bold text-slate-900 mb-4">Appearance</p>
        <div className="flex gap-3">
          {[{ key: "light", icon: Sun, label: "Light" }, { key: "dark", icon: Moon, label: "Dark" }].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => save({ theme: key })}
              className={`flex-1 flex flex-col items-center gap-2 py-5 rounded-xl border-2 transition-colors ${
                settings.theme === key ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
              }`}>
              <Icon size={20} className={settings.theme === key ? "text-emerald-600" : "text-slate-400"} />
              <span className={`text-sm font-semibold ${settings.theme === key ? "text-emerald-700" : "text-slate-500"}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <p className="font-display font-bold text-slate-900 mb-4 flex items-center gap-2"><Globe size={16} className="text-royal-500" /> Language</p>
        <select className="input-field" value={settings.language} onChange={(e) => save({ language: e.target.value })}>
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </div>

      {saved && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-slide-up">
          <CheckCircle2 size={16} /> Settings saved
        </div>
      )}
    </div>
  );
}
