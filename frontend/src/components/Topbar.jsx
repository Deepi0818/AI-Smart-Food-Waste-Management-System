import { useEffect, useState, useRef } from "react";
import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const { data } = await api.get("/notifications/unread-count");
        setUnread(data.unread_count);
      } catch { /* silent */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openNotifs = async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen) {
      const { data } = await api.get("/notifications");
      setNotifications(data);
      await api.patch("/notifications/read-all");
      setUnread(0);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 md:px-8 py-4
      bg-white/70 backdrop-blur-xl border-b border-slate-200/70">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-slate-500 hover:text-slate-800">
          <Menu size={22} />
        </button>
        <div className="hidden md:flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AI Engine Live
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={openNotifs}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-card !bg-white p-2 animate-fade-in">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">Notifications</p>
              {notifications.length === 0 && (
                <p className="px-3 py-6 text-sm text-slate-400 text-center">No notifications yet</p>
              )}
              {notifications.map((n) => (
                <div key={n.id} className="px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm">
                  <p className="text-slate-700">{n.message}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="hidden md:block text-sm font-semibold text-slate-700">{user?.name}</span>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-card !bg-white p-1.5 animate-fade-in">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
