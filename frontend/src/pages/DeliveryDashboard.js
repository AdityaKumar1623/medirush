import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck, Package, CheckCircle, Clock,
  RefreshCw, MapPin, Navigation,
  Wifi, WifiOff, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

import Navbar from '../components/shared/Navbar';
import {
  StatCard, LoadingSkeleton,
  StatusBadge, UrgencyBadge, PriorityBar
} from '../components/shared/Badges';

import api from '../utils/api';
import { useSocket } from '../context/SocketContext';

const STATUS_FLOW = {
  accepted:   { next: 'picked',     label: '📦 Mark Picked Up',   color: 'purple' },
  picked:     { next: 'in_transit', label: '🚴 Mark In Transit',  color: 'cyan' },
  in_transit: { next: 'delivered',  label: '✅ Mark Delivered',   color: 'green' },
};

const COLOR_MAP = {
  purple: 'bg-purple-500 hover:bg-purple-400',
  cyan: 'bg-cyan-500 hover:bg-cyan-400',
  green: 'bg-green-500 hover:bg-green-400',
};

const DeliveryDashboard = () => {
  const { socket, connected } = useSocket();

  const [available, setAvailable] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available');
  const [accepting, setAccepting] = useState(null);
  const [updating, setUpdating] = useState(null);

  // 🔄 Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [avRes, myRes] = await Promise.all([
        api.get('/delivery/available'),
        api.get('/delivery/my-orders'),
      ]);

      setAvailable(avRes.data.orders || []);
      setMyOrders(myRes.data.orders || []);
    } catch {
      toast.error('Failed to load data');
      setTimeout(fetchData, 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ⚡ SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    const onNewOrder = (order) => {
      setAvailable(prev => {
        if (prev.find(o => o._id === order._id)) return prev;

        if (order.urgencyLevel === 'critical') {
          new Audio('/alert.mp3').play().catch(() => {});
        }

        toast('🚨 New order nearby!', { icon: '📦' });

        return [order, ...prev].sort((a, b) => b.priorityScore - a.priorityScore);
      });
    };

    const onOrderUpdate = ({ orderId, status }) => {
      setMyOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status } : o)
      );
    };

    socket.on('new_order', onNewOrder);
    socket.on('order_update', onOrderUpdate);

    return () => {
      socket.off('new_order', onNewOrder);
      socket.off('order_update', onOrderUpdate);
    };
  }, [socket]);

  // ✅ Accept Order
  const accept = async (orderId) => {
    setAccepting(orderId);
    try {
      const res = await api.post(`/delivery/${orderId}/accept`);

      setAvailable(prev => prev.filter(o => o._id !== orderId));
      setMyOrders(prev => [res.data.order, ...prev]);

      setTab('active');
      toast.success('Order accepted!');
    } catch {
      toast.error('Failed to accept order');
    } finally {
      setAccepting(null);
    }
  };

  // 🔄 Update Status
  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await api.put(`/delivery/${orderId}/status`, {
        status: newStatus,
      });

      setMyOrders(prev =>
        prev.map(o => o._id === orderId ? res.data.order : o)
      );

      toast.success(`Updated: ${newStatus}`);
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  // 📊 Filters
  const activeOrders = myOrders.filter(o =>
    ['accepted', 'picked', 'in_transit'].includes(o.status)
  );

  const completedOrders = myOrders.filter(o => o.status === 'delivered');

  const TABS = [
    { key: 'available', label: `Available (${available.length})` },
    { key: 'active', label: `Active (${activeOrders.length})` },
    { key: 'completed', label: `Completed (${completedOrders.length})` },
  ];

  // 📍 Google Maps Navigation
  const openMap = (address) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] to-[#0d1527]">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Delivery Hub</h1>

            <p className="flex items-center gap-2 text-sm">
              {connected ? (
                <>
                  <Wifi className="text-green-400 w-4" />
                  <span className="text-green-400">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="text-red-400 w-4" />
                  <span className="text-red-400">Offline</span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg"
          >
            <RefreshCw className="w-4" /> Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Package} label="Available" value={available.length} />
          <StatCard icon={Truck} label="Active" value={activeOrders.length} />
          <StatCard icon={CheckCircle} label="Completed" value={completedOrders.length} />
          <StatCard
            icon={Clock}
            label="Critical"
            value={available.filter(o => o.urgencyLevel === 'critical').length}
          />
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg ${
                tab === t.key
                  ? 'bg-sky-500 text-white'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {loading ? (
          <LoadingSkeleton rows={4} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {(tab === 'available'
              ? available
              : tab === 'active'
              ? activeOrders
              : completedOrders
            ).map(order => {

              const flow = STATUS_FLOW[order.status];

              return (
                <div key={order._id} className="bg-white/5 p-4 rounded-xl">

                  <div className="flex gap-2 mb-2">
                    <UrgencyBadge level={order.urgencyLevel} />
                    {flow && <StatusBadge status={order.status} />}
                  </div>

                  <p className="text-white font-semibold mb-2">
                    {order.medicines}
                  </p>

                  <PriorityBar score={order.priorityScore} />

                  <div className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                    <MapPin className="w-3" />
                    {order.deliveryAddress}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 mt-4">

                    {tab === 'available' && (
                      <button
                        onClick={() => accept(order._id)}
                        disabled={accepting === order._id}
                        className="flex-1 bg-sky-500 text-white py-2 rounded"
                      >
                        {accepting === order._id ? (
                          <Loader className="animate-spin w-4 mx-auto" />
                        ) : (
                          'Accept'
                        )}
                      </button>
                    )}

                    {flow && tab === 'active' && (
                      <button
                        onClick={() => updateStatus(order._id, flow.next)}
                        disabled={updating === order._id}
                        className={`flex-1 text-white py-2 rounded ${COLOR_MAP[flow.color]}`}
                      >
                        {updating === order._id ? (
                          <Loader className="animate-spin w-4 mx-auto" />
                        ) : (
                          flow.label
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => openMap(order.deliveryAddress)}
                      className="px-3 bg-white/10 rounded"
                    >
                      <Navigation className="w-4" />
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
