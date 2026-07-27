import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Camera, HandHeart, MapPin, BarChart3, MessageCircle,
  ArrowRight, Utensils, Leaf, Users, TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import KPICard from "../components/KPICard";
import { LoadingSpinner } from "../components/Common";

const QUICK_LINKS = [
  { to: "/app/predict", label: "AI Prediction", desc: "Estimate surplus for your next event", icon: Sparkles, color: "from-emerald-500 to-emerald-600" },
  { to: "/app/image-ai", label: "Food Image AI", desc: "Check freshness from a photo", icon: Camera, color: "from-royal-500 to-royal-700" },
  { to: "/app/donate", label: "Donate Food", desc: "Log surplus for pickup", icon: HandHeart, color: "from-sky-400 to-sky-600" },
  { to: "/app/ngo-finder", label: "NGO Finder", desc: "Find nearby partner NGOs", icon: MapPin, color: "from-orange-400 to-orange-500" },
  { to: "/app/dashboard", label: "Dashboard", desc: "View your full impact analytics", icon: BarChart3, color: "from-emerald-600 to-royal-600" },
  { to: "/app/chatbot", label: "AI Chatbot", desc: "Ask about safety, storage & more", icon: MessageCircle, color: "from-royal-600 to-sky-500" },
];

export default function Home() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/dashboard/summary");
        setSummary(data);
      } catch { /* silent */ }
    };
    load();
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative glass-card !bg-gradient-to-br !from-emerald-600 !via-emerald-600 !to-royal-700 p-8 md:p-12 overflow-hidden animate-fade-in">
        <Utensils size={140} className="absolute -bottom-8 -right-4 text-white/10 rotate-12" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> AI Engine Live
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-extrabold text-white leading-tight">
              {greeting}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-emerald-50 mt-2 max-w-lg">
              Predict surplus, verify freshness, and route food to those who need it — all in one platform.
            </p>
          </div>
          <div className="text-right text-white shrink-0">
            <p className="text-3xl font-display font-extrabold tabular-nums">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
            <p className="text-emerald-50 text-sm mt-1">
              {now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <KPICard icon={TrendingUp} label="Prediction Accuracy" value={summary.avg_prediction_confidence || 0} suffix="%" decimals={1} color="emerald" />
          <KPICard icon={Utensils} label="Food Donated" value={summary.total_food_donated_kg || 0} suffix="kg" decimals={1} color="royal" />
          <KPICard icon={Users} label="People Feedable" value={summary.total_people_feedable || 0} color="sky" />
          <KPICard icon={Leaf} label="CO₂ Reduced" value={summary.total_co2_saved_kg || 0} suffix="kg" decimals={1} color="orange" />
        </div>
      ) : (
        <LoadingSpinner label="Loading your impact stats..." />
      )}

      {/* Quick Nav */}
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map((q) => (
            <Link key={q.to} to={q.to}
              className="glass-card p-5 flex items-start gap-4 hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${q.color} flex items-center justify-center shadow-md shrink-0`}>
                <q.icon size={19} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-slate-900">{q.label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{q.desc}</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all mt-1" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
