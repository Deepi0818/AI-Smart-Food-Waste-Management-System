import { Leaf } from "lucide-react";

export function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <Leaf size={16} className="absolute inset-0 m-auto text-emerald-600" />
      </div>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-royal-600 flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
            <Icon size={20} className="text-white" />
          </div>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && <Icon size={36} className="text-slate-300 mb-3" />}
      <p className="font-semibold text-slate-600">{title}</p>
      {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-sm">{subtitle}</p>}
    </div>
  );
}
