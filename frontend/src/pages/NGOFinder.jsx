import { useEffect, useState } from "react";
import { MapPin, Phone, Navigation2, Loader2, Building2 } from "lucide-react";
import api from "../api/client";
import { PageHeader, LoadingSpinner, EmptyState } from "../components/Common";

const AVAILABILITY_STYLE = {
  Available: "bg-emerald-100 text-emerald-700",
  Busy: "bg-orange-100 text-orange-700",
};

export default function NGOFinder() {
  const [ngos, setNgos] = useState(null);
  const [locating, setLocating] = useState(false);

  const loadNgos = (lat, lng) => {
    const params = lat && lng ? { lat, lng } : {};
    api.get("/ngo", { params }).then(({ data }) => setNgos(data));
  };

  useEffect(() => { loadNgos(); }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) return loadNgos();
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { loadNgos(pos.coords.latitude, pos.coords.longitude); setLocating(false); },
      () => { loadNgos(13.05, 80.25); setLocating(false); } // Chennai fallback
    );
  };

  return (
    <div>
      <PageHeader
        icon={MapPin}
        title="NGO Finder"
        subtitle="Discover nearby verified NGOs, shelters, and food banks for donation pickup"
        action={
          <button onClick={useMyLocation} disabled={locating} className="btn-secondary">
            {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation2 size={16} />}
            Use My Location
          </button>
        }
      />

      {!ngos && <LoadingSpinner label="Finding nearby NGOs..." />}
      {ngos && ngos.length === 0 && <EmptyState icon={Building2} title="No NGOs found" />}

      {ngos && ngos.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {ngos.map((n) => (
            <div key={n.id} className="glass-card p-5 flex flex-col animate-slide-up">
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-royal-500 to-emerald-500 flex items-center justify-center shrink-0">
                  <Building2 size={19} className="text-white" />
                </div>
                <span className={`badge ${AVAILABILITY_STYLE[n.availability] || "bg-slate-100 text-slate-600"}`}>
                  {n.availability}
                </span>
              </div>
              <p className="font-display font-bold text-slate-900 mt-3">{n.name}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{n.category}</p>
              <p className="text-sm text-slate-500 mt-2 flex items-start gap-1.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" /> {n.address}
              </p>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" /> {n.phone}
              </p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                {n.distance_km != null ? (
                  <span className="text-sm font-bold text-emerald-600">{n.distance_km} km away</span>
                ) : <span />}
                <a href={n.maps_url} target="_blank" rel="noreferrer"
                  className="text-sm font-semibold text-royal-600 hover:text-royal-700 flex items-center gap-1">
                  Directions <Navigation2 size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
