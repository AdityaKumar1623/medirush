import React, { useState } from 'react';
import { X, Upload, Zap, AlertCircle, Loader, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const CRITICAL_KW = ['icu', 'emergency', 'critical', 'heart attack', 'stroke', 'unconscious'];
const HIGH_KW     = ['urgent', 'immediate', 'asap', 'fever', 'accident', 'severe'];

const detectUrgency = (text) => {
  const t = text.toLowerCase();
  if (CRITICAL_KW.some(k => t.includes(k))) return 'critical';
  if (HIGH_KW.some(k     => t.includes(k))) return 'high';
  return null;
};

const NewOrderModal = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    medicines: '', urgencyLevel: 'medium',
    deliveryAddress: user?.address || '', notes: '',
  });
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoDetected, setAutoDetected] = useState(null);

  const handle = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    if (name === 'medicines' || name === 'notes') {
      const detected = detectUrgency(updated.medicines + ' ' + updated.notes);
      setAutoDetected(detected);
      if (detected) updated.urgencyLevel = detected;
    }
    setForm(updated);
  };

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('File too large — max 5MB'); return; }
    setFile(f);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('prescription', f);
      const res = await api.post('/upload/prescription', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(prev => ({ ...prev, prescriptionImage: res.data.url }));
      toast.success('Prescription uploaded ✓');
    } catch (err) {
      toast.error('Upload failed: ' + (err?.response?.data?.message || err.message));
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.medicines.trim())       { toast.error('Describe the medicines needed'); return; }
    if (!form.deliveryAddress.trim()) { toast.error('Delivery address is required'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/orders', form);
      toast.success('Order placed! ✅');
      onCreated(res.data.order);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const URGENCY_OPTS = [
    { val: 'low',      label: 'Low',      color: 'green',  desc: 'Within a few hours' },
    { val: 'medium',   label: 'Medium',   color: 'yellow', desc: 'Needed soon' },
    { val: 'high',     label: 'High',     color: 'orange', desc: 'Within the hour' },
    { val: 'critical', label: 'Critical', color: 'red',    desc: 'Life-threatening' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">

        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-black text-white">New Medicine Request</h2>
            <p className="text-slate-500 text-sm mt-0.5">Urgency auto-detects from keywords</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {autoDetected && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${autoDetected === 'critical' ? 'bg-red-500/10 border border-red-500/20' : 'bg-orange-500/10 border border-orange-500/20'}`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 ${autoDetected === 'critical' ? 'text-red-400' : 'text-orange-400'}`} />
              <div>
                <p className={`text-sm font-bold ${autoDetected === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                  🚨 Keyword detected — urgency set to {autoDetected.toUpperCase()}
                </p>
                <p className="text-xs text-slate-500">Priority score elevated automatically</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Medicines Required *
            </label>
            <textarea name="medicines" value={form.medicines} onChange={handle} rows={3} required
              placeholder="e.g. Insulin 100 IU × 3 vials, Paracetamol 500mg × 10&#10;Tip: type 'urgent' or 'ICU' to auto-set priority"
              className="input-field resize-none" />
          </div>

          <div>
            <label className="text-slate-400 text-sm font-medium mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Urgency Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {URGENCY_OPTS.map(opt => (
                <button key={opt.val} type="button" onClick={() => setForm(f => ({ ...f, urgencyLevel: opt.val }))}
                  className={`p-3 rounded-xl border text-left transition-all ${form.urgencyLevel === opt.val
                    ? `bg-${opt.color}-500/15 border-${opt.color}-500/40`
                    : 'bg-white/3 border-white/10 hover:bg-white/5'}`}>
                  <div className={`text-sm font-bold ${form.urgencyLevel === opt.val ? `text-${opt.color}-400` : 'text-slate-400'}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Delivery Address *
            </label>
            <input name="deliveryAddress" value={form.deliveryAddress} onChange={handle} required
              placeholder="House No., Street, City, State"
              className="input-field" />
          </div>

          <div>
            <label className="text-slate-400 text-sm font-medium mb-2 block">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handle} rows={2}
              placeholder="Patient condition, landmark, special instructions..."
              className="input-field resize-none" />
          </div>

          <div>
            <label className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Prescription (Optional)
            </label>
            <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-white/10 hover:border-sky-500/40 cursor-pointer transition-colors group bg-white/3">
              <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
              {uploading ? (
                <Loader className="w-6 h-6 text-sky-400 animate-spin" />
              ) : file ? (
                <div className="text-center">
                  <FileText className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-green-400 text-sm font-medium">{file.name}</p>
                  <p className="text-slate-600 text-xs">Click to replace</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-6 h-6 text-slate-600 mx-auto mb-1 group-hover:text-sky-400 transition-colors" />
                  <p className="text-slate-500 text-sm">Click or drop to upload</p>
                  <p className="text-slate-700 text-xs mt-0.5">JPG, PNG, PDF — max 5MB</p>
                </div>
              )}
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white py-3 rounded-xl font-medium transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting || uploading}
              className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-sky-500/25 flex items-center justify-center gap-2">
              {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Placing...</> : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrderModal;
