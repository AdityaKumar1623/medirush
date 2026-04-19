import React, { useState, useEffect, useCallback } from 'react';
import { Users, Package, AlertCircle, CheckCircle, TrendingUp, RefreshCw, Sliders, X, Loader, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Navbar from '../components/shared/Navbar';
import OrderCard from '../components/dashboard/OrderCard';
import { StatCard, LoadingSkeleton, StatusBadge } from '../components/shared/Badges';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-400">{label}</p>
      <p className="text-sky-400 font-bold">{payload[0].value} orders</p>
    </div>
  );
};

const PriorityModal = ({ order, onClose, onSaved }) => {
  const [score, setScore]   = useState(order.priorityScore);
  const [urgency, setUrgency] = useState(order.urgencyLevel);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/orders/${order._id}/priority`, { priorityScore: score, urgencyLevel: urgency });
      toast.success('Priority updated ✓');
      onSaved({ ...order, priorityScore: score, urgencyLevel: urgency, isManualPriority: true });
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-2xl p-6 w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Override Priority</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <p className="text-slate-500 text-sm mb-5 line-clamp-2">{order.medicines}</p>
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs mb-2 block">
              Priority Score: <span className="text-white font-bold text-sm">{score}</span>
            </label>
            <input type="range" min="0" max="100" value={score}
              onChange={e => setScore(+e.target.value)} className="w-full accent-sky-500" />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0 — Low</span><span>50 — Medium</span><span>100 — Critical</span>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-2 block">Urgency Level</label>
            <select value={urgency} onChange={e => setUrgency(e.target.value)} className="input-field text-sm">
              {['low', 'medium', 'high', 'critical'].map(v =>
                <option key={v} value={v} style={{ background: '#1a2035' }}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
              )}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
            <button onClick={save} disabled={saving}
              className="flex-1 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              {saving && <Loader className="w-3 h-3 animate-spin" />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { socket, connected } = useSocket();
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter]   = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [priorityModal, setPriorityModal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter)  params.append('status', statusFilter);
      if (urgencyFilter) params.append('urgency', urgencyFilter);
      const [ar, or2] = await Promise.all([
        api.get('/admin/analytics'),
        api.get(`/admin/orders?${params.toString()}`),
      ]);
      setAnalytics(ar.data);
      setOrders(or2.data.orders);
    } catch (err) {
      toast.error('Failed to load: ' + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, urgencyFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time: new orders, status updates
  useEffect(() => {
    if (!socket) return;
    const onNewOrder = (order) => {
      setOrders(prev => [order, ...prev]);
      setAnalytics(prev => prev ? { ...prev, totalOrders: prev.totalOrders + 1, pendingOrders: prev.pendingOrders + 1 } : prev);
      toast('🆕 New order received!', { icon: '📦' });
    };
    const onStatusUpdate = ({ orderId, status }) => {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    };
    socket.on('new_order', onNewOrder);
    socket.on('order_update', onStatusUpdate);
    return () => {
      socket.off('new_order', onNewOrder);
      socket.off('order_update', onStatusUpdate);
    };
  }, [socket]);

  const chartData = analytics?.dailyOrders?.map(d => ({ date: d._id.slice(5), orders: d.count })) || [];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1527 100%)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Panel</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              {connected
                ? <><Wifi className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400 text-xs font-medium">Live</span></>
                : <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400 text-xs font-medium">Reconnecting...</span></>
              }
              <span>Orders update in real-time</span>
            </p>
          </div>
          <button onClick={fetchData}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Package}     label="Total Orders"  value={analytics.totalOrders}    color="sky"    trend={12} />
            <StatCard icon={AlertCircle} label="Critical"       value={analytics.criticalOrders} color="red"    trend={5} />
            <StatCard icon={CheckCircle} label="Delivered"      value={analytics.deliveredOrders} color="green" />
            <StatCard icon={Users}       label="Users"          value={analytics.totalUsers}     color="purple"
              sub={`${analytics.totalDelivery} delivery partners`} />
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" /> Orders — Last 7 Days
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(14,165,233,0.05)' }} />
                  <Bar dataKey="orders" radius={[6,6,0,0]}>
                    {chartData.map((_, i) => <Cell key={i} fill="url(#barGrad)" />)}
                  </Bar>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-slate-600 text-sm">No order data yet</div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {analytics?.statusBreakdown?.length > 0
                ? analytics.statusBreakdown.map(s => (
                  <div key={s._id} className="flex items-center justify-between">
                    <StatusBadge status={s._id} />
                    <span className="text-white font-bold text-sm">{s.count}</span>
                  </div>
                ))
                : <p className="text-slate-600 text-sm">No data yet</p>
              }
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-lg font-black text-white">All Orders ({orders.length})</h2>
            <div className="flex gap-2">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500/50">
                {['','pending','accepted','picked','in_transit','delivered','cancelled'].map(s =>
                  <option key={s} value={s} style={{ background: '#1a2035' }}>{s || 'All Status'}</option>
                )}
              </select>
              <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}
                className="bg-white/5 border border-white/10 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500/50">
                {['','low','medium','high','critical'].map(u =>
                  <option key={u} value={u} style={{ background: '#1a2035' }}>{u || 'All Urgency'}</option>
                )}
              </select>
            </div>
          </div>

          {loading ? <LoadingSkeleton rows={4} /> : orders.length === 0 ? (
            <p className="text-center py-12 text-slate-600">No orders match the filters</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {orders.map(order => (
                <OrderCard key={order._id} order={order} showUser
                  actions={
                    <button onClick={() => setPriorityModal(order)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors font-medium">
                      <Sliders className="w-3.5 h-3.5" /> Override Priority
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {priorityModal && (
        <PriorityModal
          order={priorityModal}
          onClose={() => setPriorityModal(null)}
          onSaved={updated => setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))}
        />
      )}
    </div>
  );
};

export default AdminPanel;
