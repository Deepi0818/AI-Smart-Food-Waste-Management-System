import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Sparkles, Camera, HandHeart, MapPin,
  History, MessageCircle, Settings, Info, Leaf, X,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/app/home", label: "Home", icon: LayoutDashboard },
  { to: "/app/predict", label: "AI Prediction", icon: Sparkles },
  { to: "/app/image-ai", label: "Food Image AI", icon: Camera },
  { to: "/app/donate", label: "Donate Food", icon: HandHeart },
  { to: "/app/ngo-finder", label: "NGO Finder", icon: MapPin },
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/chatbot", label: "AI Chatbot", icon: MessageCircle },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/about", label: "About", icon: Info },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 z-40 flex flex-col
        bg-white/80 backdrop-blur-xl border-r border-slate-200/70 shadow-glass
        transition-transform duration-300 lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-royal-600 flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display font-extrabold text-slate-900 leading-tight">FoodWaste AI</p>
              <p className="text-[11px] text-slate-400 font-medium">Smart Redistribution</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-slate-200/70">
          <div className="glass-card p-3 flex items-center gap-2 !bg-emerald-50/80 !border-emerald-100">
            <Leaf size={16} className="text-emerald-600 shrink-0" />
            <p className="text-[11px] text-emerald-700 font-medium leading-snug">
              Every donation logged helps feed people and cut CO₂ emissions.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
