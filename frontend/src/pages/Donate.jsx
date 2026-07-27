import { useState } from "react";
import { HandHeart, Loader2, CheckCircle2, QrCode, Camera } from "lucide-react";
import api from "../api/client";
import { PageHeader } from "../components/Common";

const CATEGORIES = ["Cooked Meal", "Bakery Items", "Fruits & Vegetables", "Packaged Food", "Dairy Products", "Grains & Cereals"];

export default function Donate() {
  const [form, setForm] = useState({
    food_name: "", category: CATEGORIES[0], quantity_kg: "", cooking_time: "",
    expiry_time: "", location: "", contact_number: "", notes: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [freshness, setFreshness] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [donation, setDonation] = useState(null);

  const handleImage = async (f) => {
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setFreshness(null);
    setAnalyzingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", f);
      const { data } = await api.post("/image/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFreshness(data);
    } catch {
      setError("Could not analyze uploaded image, but you can still submit the donation.");
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        quantity_kg: Number(form.quantity_kg),
        stored_filename: freshness?.stored_filename,
        freshness_label: freshness?.label,
        freshness_confidence: freshness?.confidence,
        donation_eligible: freshness?.donation_eligible ?? true,
      };
      const { data } = await api.post("/donation", payload);
      setDonation(data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit donation.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setDonation(null);
    setForm({ food_name: "", category: CATEGORIES[0], quantity_kg: "", cooking_time: "", expiry_time: "", location: "", contact_number: "", notes: "" });
    setImageFile(null);
    setImagePreview(null);
    setFreshness(null);
  };

  if (donation) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="glass-card p-8 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={30} className="text-emerald-500" />
          </div>
          <h2 className="page-title">Donation Submitted!</h2>
          <p className="page-subtitle">Your food is pending pickup coordination.</p>

          <div className="mt-6 bg-slate-50 rounded-2xl p-5 flex flex-col items-center">
            <img src={`${api.defaults.baseURL}/donation/${donation.donation_code}/qr`}
              alt="Tracking code" className="w-40 h-auto rounded-lg border border-slate-200" />
            <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
              <QrCode size={13} /> Tracking Code (demo visual)
            </p>
            <p className="font-mono font-bold text-emerald-700 mt-1">{donation.donation_code}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 text-left text-sm">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400">Food</p>
              <p className="font-semibold text-slate-700">{donation.food_name}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400">Quantity</p>
              <p className="font-semibold text-slate-700">{donation.quantity_kg} kg</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-slate-400">Status</p>
              <span className="badge bg-orange-100 text-orange-700 mt-1">{donation.status}</span>
            </div>
          </div>

          <button onClick={resetForm} className="btn-primary w-full !py-3 mt-6">Submit Another Donation</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader icon={HandHeart} title="Donate Food" subtitle="Log surplus food for NGO pickup, verified by AI freshness detection" />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Food Name</label>
              <input required className="input-field" placeholder="e.g. Veg Biryani"
                value={form.food_name} onChange={(e) => setForm({ ...form, food_name: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Quantity (kg)</label>
              <input type="number" step="0.1" min="0.1" required className="input-field" placeholder="e.g. 12"
                value={form.quantity_kg} onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Cooking Time</label>
              <input type="time" className="input-field" value={form.cooking_time}
                onChange={(e) => setForm({ ...form, cooking_time: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Expiry Time</label>
              <input type="time" className="input-field" value={form.expiry_time}
                onChange={(e) => setForm({ ...form, expiry_time: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Contact Number</label>
              <input required className="input-field" placeholder="10-digit number"
                value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-text">Pickup Location</label>
            <input required className="input-field" placeholder="Full address"
              value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Additional Notes</label>
            <textarea rows={3} className="input-field resize-none" placeholder="Allergens, packaging info, etc."
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
            {submitting ? <><Loader2 size={17} className="animate-spin" /> Submitting...</> : <><HandHeart size={17} /> Submit Donation</>}
          </button>
        </div>

        <div className="glass-card p-6 h-fit">
          <label className="label-text">Food Photo (optional AI check)</label>
          <label className="border-2 border-dashed border-emerald-200 rounded-2xl h-44 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors overflow-hidden relative">
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <Camera size={26} className="text-emerald-400 mb-2" />
                <p className="text-xs text-slate-400 text-center px-4">Upload a photo for instant freshness verification</p>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files[0])} />
          </label>

          {analyzingImage && (
            <p className="flex items-center gap-2 text-xs text-slate-400 mt-3">
              <Loader2 size={13} className="animate-spin" /> Analyzing freshness...
            </p>
          )}
          {freshness && (
            <div className={`mt-3 rounded-xl p-3 border text-sm ${freshness.donation_eligible ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"}`}>
              <p className="font-semibold">{freshness.label} · {freshness.confidence}%</p>
              <p className="text-xs mt-0.5 opacity-80">{freshness.donation_eligible ? "Eligible for donation" : "May not be suitable for donation"}</p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
