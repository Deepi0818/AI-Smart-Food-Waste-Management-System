import { useEffect, useState } from "react";
import { History as HistoryIcon, Search, Trash2, Download, FileSpreadsheet, FileText, ArrowUpDown } from "lucide-react";
import api from "../api/client";
import { PageHeader, EmptyState, LoadingSpinner } from "../components/Common";

export default function History() {
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");

  const load = async () => {
    const { data } = await api.get("/history/predictions", {
      params: { search, event_type: eventFilter, sort_by: sortBy, order },
    });
    setRows(data);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [sortBy, order]);
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search, eventFilter]);

  const handleDelete = async (id) => {
    await api.delete(`/history/predictions/${id}`);
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const toggleSort = (field) => {
    if (sortBy === field) setOrder(order === "asc" ? "desc" : "asc");
    else { setSortBy(field); setOrder("desc"); }
  };

  const exportFile = (type) => {
    const path = type === "pdf" ? "/report/pdf" : `/history/export/${type}`;
    const url = `${api.defaults.baseURL}${path}`;
    const token = localStorage.getItem("fw_token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = type === "pdf" ? "FoodWaste_Impact_Report.pdf" : `prediction_history.${type === "excel" ? "xlsx" : "csv"}`;
        link.click();
      });
  };

  const eventTypes = [...new Set((rows || []).map((r) => r.event_type))];

  return (
    <div>
      <PageHeader
        icon={HistoryIcon}
        title="Prediction History"
        subtitle="Search, filter, and export your full AI prediction log"
        action={
          <div className="flex gap-2">
            <button onClick={() => exportFile("pdf")} className="btn-secondary !py-2 !px-4 text-sm">
              <FileText size={15} /> PDF Report
            </button>
            <button onClick={() => exportFile("csv")} className="btn-secondary !py-2 !px-4 text-sm">
              <Download size={15} /> CSV
            </button>
            <button onClick={() => exportFile("excel")} className="btn-secondary !py-2 !px-4 text-sm">
              <FileSpreadsheet size={15} /> Excel
            </button>
          </div>
        }
      />

      <div className="glass-card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-11" placeholder="Search by event, food, or meal type..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-56" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="">All Event Types</option>
          {eventTypes.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {rows === null && <LoadingSpinner label="Loading prediction history..." />}
      {rows && rows.length === 0 && <EmptyState icon={HistoryIcon} title="No predictions found" subtitle="Try a different search or run a new AI prediction." />}

      {rows && rows.length > 0 && (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                {[
                  ["created_at", "Date"], ["event_type", "Event"], ["guests", "Guests"],
                  ["predicted_waste_kg", "Waste (kg)"], ["confidence", "Confidence"],
                ].map(([key, label]) => (
                  <th key={key} className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-400 cursor-pointer select-none"
                    onClick={() => toggleSort(key)}>
                    <span className="flex items-center gap-1">{label} <ArrowUpDown size={11} /></span>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-400">Recommendation</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{r.event_type}</td>
                  <td className="px-5 py-3.5 text-slate-500">{r.guests}</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-600">{r.predicted_waste_kg} kg</td>
                  <td className="px-5 py-3.5 text-slate-500">{r.confidence}%</td>
                  <td className="px-5 py-3.5">
                    <span className="badge bg-royal-50 text-royal-700">{r.recommendation}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => handleDelete(r.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
