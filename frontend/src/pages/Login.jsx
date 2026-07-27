import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "demo@foodwaste.ai", password: "Demo@1234" });
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form.email, form.password);
    if (res.success) navigate("/app/home");
    else setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-royal-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative glass-card w-full max-w-md p-8 md:p-10 animate-slide-up">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-royal-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-4">
            <Leaf size={26} className="text-white" />
          </div>
          <h1 className="page-title">Welcome back</h1>
          <p className="page-subtitle">Sign in to your FoodWaste AI account</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-11" placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-text !mb-0">Password</label>
              <button type="button" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPw ? "text" : "password"} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-11 pr-11" placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
            Remember me on this device
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-base mt-2">
            {loading ? "Signing in..." : "Sign In"} <ArrowRight size={17} />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5 bg-slate-50 rounded-lg py-2">
          Demo login prefilled — just hit Sign In
        </p>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">Create one</Link>
        </p>
      </div>
    </div>
  );
}
