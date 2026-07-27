import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    const res = await register(form.name, form.email, form.password);
    if (res.success) navigate("/app/home");
    else setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-72 h-72 bg-royal-300/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative glass-card w-full max-w-md p-8 md:p-10 animate-slide-up">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-royal-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-4">
            <Leaf size={26} className="text-white" />
          </div>
          <h1 className="page-title">Create your account</h1>
          <p className="page-subtitle">Start predicting and preventing food waste</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field pl-11" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="label-text">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-11" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-11" placeholder="At least 6 characters" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-base mt-2">
            {loading ? "Creating account..." : "Create Account"} <ArrowRight size={17} />
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
