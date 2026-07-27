import { useState, useRef } from "react";
import { Camera, Upload, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import api from "../api/client";
import { PageHeader } from "../components/Common";

const LABEL_STYLE = {
  "Fresh": { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
  "Moderately Fresh": { color: "text-orange-600", bg: "bg-orange-50 border-orange-100", icon: AlertTriangle },
  "Rotten": { color: "text-red-600", bg: "bg-red-50 border-red-100", icon: XCircle },
};

export default function ImageAI() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/image/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not analyze image.");
    } finally {
      setLoading(false);
    }
  };

  const style = result ? LABEL_STYLE[result.label] : null;

  return (
    <div>
      <PageHeader
        icon={Camera}
        title="Food Image AI"
        subtitle="Computer-vision freshness detection — upload a photo to check donation eligibility"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-emerald-200 rounded-2xl h-72 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors overflow-hidden relative"
          >
            {preview ? (
              <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <Upload size={32} className="text-emerald-400 mb-3" />
                <p className="font-semibold text-slate-600">Click or drag an image here</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG or WEBP</p>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />

          <button onClick={handleAnalyze} disabled={!file || loading} className="btn-primary w-full !py-3 mt-4">
            {loading ? <><Loader2 size={17} className="animate-spin" /> Analyzing...</> : <><Camera size={17} /> Run Freshness Detection</>}
          </button>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">{error}</p>}
        </div>

        <div>
          {!result && (
            <div className="glass-card h-full min-h-[300px] flex flex-col items-center justify-center text-center p-10">
              <p className="font-semibold text-slate-600">No analysis yet</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">Upload a food photo to see the AI freshness result.</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-slide-up">
              <div className={`glass-card p-6 border ${style.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <style.icon size={28} className={style.color} />
                    <div>
                      <p className={`font-display text-xl font-extrabold ${style.color}`}>{result.label}</p>
                      <p className="text-xs text-slate-400">Confidence: {result.confidence}%</p>
                    </div>
                  </div>
                  <span className={`badge ${result.donation_eligible ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {result.donation_eligible ? "Donation Eligible" : "Not Eligible"}
                  </span>
                </div>
              </div>

              <div className="glass-card p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Class Probabilities</p>
                <div className="space-y-2.5">
                  {Object.entries(result.class_probabilities || {}).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">{k}</span>
                        <span className="text-slate-400">{v}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-emerald-500 to-royal-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">AI Explanation</p>
                <ul className="space-y-1.5">
                  {(result.explanation || []).map((e, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" /> {e}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
