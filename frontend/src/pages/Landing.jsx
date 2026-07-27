import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Leaf, Sparkles, Camera, HandHeart, MapPin, BarChart3,
  ArrowRight, ShieldCheck, Clock,
} from "lucide-react";

const FEATURES = [
  { icon: Sparkles, title: "AI Waste Prediction", desc: "A trained ML model estimates food surplus for any event before it happens." },
  { icon: Camera, title: "Food Image AI", desc: "Computer-vision freshness detection tells you what's safe to donate, instantly." },
  { icon: HandHeart, title: "One-Tap Donation", desc: "Log surplus food with photos, quantity, and pickup details in seconds." },
  { icon: MapPin, title: "NGO Finder", desc: "Discover and route surplus food to the nearest verified NGO or shelter." },
  { icon: BarChart3, title: "Impact Dashboard", desc: "Track CO₂ saved, meals donated, and people fed with live analytics." },
  { icon: ShieldCheck, title: "Explainable AI", desc: "Every prediction ships with a confidence score and plain-language reasoning." },
];

function AnimatedCounter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1400;
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1);
      setVal(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
}

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-royal-600 flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-slate-900">FoodWaste AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 px-4 py-2">
              Login
            </Link>
            <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
              Get Started <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="absolute -top-20 left-1/4 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-royal-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 animate-fade-in">
          <Sparkles size={13} /> AI-Powered · Enterprise-Grade Platform
        </div>
        <h1 className="relative font-display text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight max-w-4xl mx-auto animate-slide-up">
          Predict Food Waste. <span className="bg-gradient-to-r from-emerald-600 to-royal-600 bg-clip-text text-transparent">Redistribute Smarter.</span>
        </h1>
        <p className="relative mt-5 text-lg text-slate-500 max-w-2xl mx-auto animate-slide-up">
          An AI platform that predicts surplus food before it's wasted, verifies freshness from a photo,
          and connects it to the nearest NGO — turning waste into meals.
        </p>
        <div className="relative mt-9 flex items-center justify-center gap-4 animate-slide-up">
          <Link to="/register" className="btn-primary text-base">
            Start Free <ArrowRight size={17} />
          </Link>
          <Link to="/login" className="btn-secondary text-base">
            Live Demo Login
          </Link>
        </div>

        <div className="relative mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { label: "Prediction Accuracy", value: 95, suffix: "%" },
            { label: "Meals Saved", value: 12400, suffix: "+" },
            { label: "CO₂ Reduced (kg)", value: 8600, suffix: "+" },
            { label: "Partner NGOs", value: 60, suffix: "+" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4">
              <p className="font-display text-2xl font-extrabold text-emerald-600">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="page-title">Everything you need to fight food waste</h2>
          <p className="page-subtitle">Thirteen integrated modules, one seamless platform.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-royal-600 flex items-center justify-center mb-4 shadow-md shadow-emerald-600/20">
                <f.icon size={19} className="text-white" />
              </div>
              <h3 className="font-display font-bold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="glass-card !bg-gradient-to-br !from-emerald-600 !to-royal-700 p-10 md:p-14 text-center relative overflow-hidden">
          <Clock size={100} className="absolute -bottom-6 -right-6 text-white/10" />
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white">Ready to cut food waste with AI?</h2>
          <p className="text-emerald-50 mt-2 max-w-xl mx-auto">Join the platform and turn every prediction into a meal for someone who needs it.</p>
          <Link to="/register" className="inline-flex items-center gap-2 mt-6 bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors">
            Create Free Account <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        © 2026 AI Smart Food Waste Analysis & Redistribution System. Built for social impact.
      </footer>
    </div>
  );
}
