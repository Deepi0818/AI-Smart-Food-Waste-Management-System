import { useEffect, useState } from "react";
import {
  BarChart3, TrendingUp, Utensils, Users, Leaf, Award,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../api/client";
import KPICard from "../components/KPICard";
import { PageHeader, LoadingSpinner, EmptyState } from "../components/Common";

const PIE_COLORS = ["#059669", "#2563eb", "#0ea5e9", "#f97316", "#a855f7", "#ef4444"];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [topNgos, setTopNgos] = useState([]);

  useEffect(() => {
    api.get("/dashboard/summary").then(({ data }) => setSummary(data));
    api.get("/dashboard/trends").then(({ data }) => setTrends(data));
    api.get("/dashboard/top-ngos").then(({ data }) => setTopNgos(data));
  }, []);

  if (!summary || !trends) return <LoadingSpinner label="Crunching your analytics..." />;

  const hasData = summary.total_predictions > 0 || summary.total_donations > 0;

  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title="Enterprise Dashboard" subtitle="Real-time analytics across predictions, donations, and environmental impact" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <KPICard icon={TrendingUp} label="Avg Confidence" value={summary.avg_prediction_confidence} suffix="%" decimals={1} color="emerald" />
        <KPICard icon={Utensils} label="Total Food Donated" value={summary.total_food_donated_kg} suffix="kg" decimals={1} color="royal" />
        <KPICard icon={Users} label="People Feedable" value={summary.total_people_feedable} color="sky" />
        <KPICard icon={Leaf} label="CO₂ Saved" value={summary.total_co2_saved_kg} suffix="kg" decimals={1} color="orange" />
      </div>

      {!hasData && (
        <EmptyState icon={BarChart3} title="No analytics data yet"
          subtitle="Run an AI Prediction or submit a Donation to start populating your dashboard." />
      )}

      {hasData && (
        <>
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-card p-6">
              <p className="font-display font-bold text-slate-900 mb-1">Predicted Waste Over Time</p>
              <p className="text-xs text-slate-400 mb-4">Daily aggregate from AI predictions</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trends.waste_over_time}>
                  <defs>
                    <linearGradient id="waste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="waste_kg" stroke="#059669" strokeWidth={2.5} fill="url(#waste)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <p className="font-display font-bold text-slate-900 mb-1">Donations by Status</p>
              <p className="text-xs text-slate-400 mb-4">Live pipeline breakdown</p>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={trends.donations_by_status} dataKey="count" nameKey="status" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {trends.donations_by_status.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="glass-card p-6">
              <p className="font-display font-bold text-slate-900 mb-1">Waste by Event Type</p>
              <p className="text-xs text-slate-400 mb-4">Which events generate the most surplus</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trends.waste_by_event_type}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="event_type" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="waste_kg" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <p className="font-display font-bold text-slate-900 mb-1">Donations by Category</p>
              <p className="text-xs text-slate-400 mb-4">Volume in kg per food category</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trends.donations_by_category} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={110} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="quantity_kg" fill="#059669" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="font-display font-bold text-slate-900 mb-1 flex items-center gap-2"><Award size={16} className="text-orange-400" /> Top Receiving NGOs</p>
            <p className="text-xs text-slate-400 mb-4">Ranked by total kg received</p>
            <div className="space-y-3">
              {topNgos.map((n, i) => (
                <div key={n.name} className="flex items-center gap-4">
                  <span className="w-6 text-xs font-bold text-slate-300">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{n.name}</span>
                      <span className="text-slate-400">{n.total_kg} kg</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-emerald-500 to-royal-500 h-1.5 rounded-full"
                        style={{ width: `${topNgos[0]?.total_kg ? (n.total_kg / topNgos[0].total_kg) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
