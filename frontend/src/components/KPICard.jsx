import { useEffect, useState, useRef } from "react";

const COLOR_MAP = {
  emerald: "from-emerald-500 to-emerald-600 shadow-emerald-600/25",
  royal: "from-royal-500 to-royal-700 shadow-royal-600/25",
  sky: "from-sky-400 to-sky-600 shadow-sky-500/25",
  orange: "from-orange-400 to-orange-500 shadow-orange-500/25",
};

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    let frame;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    startRef.current = null;
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function KPICard({ icon: Icon, label, value, suffix = "", decimals = 0, color = "emerald", trend }) {
  const animated = useCountUp(Number(value) || 0);

  return (
    <div className="glass-card p-5 group animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 font-display text-2xl md:text-[28px] font-extrabold text-slate-900">
            {animated.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
            <span className="text-base font-bold text-slate-400 ml-1">{suffix}</span>
          </p>
          {trend && (
            <p className="mt-1.5 text-xs font-medium text-emerald-600">{trend}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${COLOR_MAP[color]} flex items-center justify-center shadow-lg
          group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}
