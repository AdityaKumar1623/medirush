import React from 'react';
import { AlertCircle, Clock, CheckCircle, Package, Truck, XCircle, Zap, TrendingUp, Minus } from 'lucide-react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = {
    pending:    { icon: Clock,        label: 'Pending',    cls: 'status-pending' },
    accepted:   { icon: CheckCircle,  label: 'Accepted',   cls: 'status-accepted' },
    picked:     { icon: Package,      label: 'Picked Up',  cls: 'status-picked' },
    in_transit: { icon: Truck,        label: 'In Transit', cls: 'status-in_transit' },
    delivered:  { icon: CheckCircle,  label: 'Delivered',  cls: 'status-delivered' },
    cancelled:  { icon: XCircle,      label: 'Cancelled',  cls: 'status-cancelled' },
  }[status] || { icon: Clock, label: status, cls: 'status-pending' };

  const Icon = cfg.icon;
  const px = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${px} rounded-full font-medium ${cfg.cls}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {cfg.label}
    </span>
  );
};

export const UrgencyBadge = ({ level, size = 'sm' }) => {
  const cfg = {
    critical: { icon: AlertCircle, label: 'Critical', cls: 'badge-critical' },
    high:     { icon: Zap,         label: 'High',     cls: 'badge-high' },
    medium:   { icon: TrendingUp,  label: 'Medium',   cls: 'badge-medium' },
    low:      { icon: Minus,       label: 'Low',      cls: 'badge-low' },
  }[level] || { icon: Minus, label: level, cls: 'badge-low' };

  const Icon = cfg.icon;
  const px = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${px} rounded-full font-medium ${cfg.cls}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {cfg.label}
    </span>
  );
};

export const PriorityBar = ({ score }) => {
  const color = score >= 80 ? 'bg-red-500' : score >= 50 ? 'bg-orange-500' : score >= 25 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-400 w-8 text-right">{score}</span>
    </div>
  );
};

export const StatCard = ({ icon: Icon, label, value, sub, color = 'sky', trend }) => (
  <div className="glass rounded-2xl p-6 card-hover">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl bg-${color}-500/15 border border-${color}-500/20 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-3xl font-black text-white mb-1">{value}</div>
    <div className="text-slate-400 text-sm font-medium">{label}</div>
    {sub && <div className="text-slate-600 text-xs mt-1">{sub}</div>}
  </div>
);

export const LoadingSkeleton = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="glass rounded-2xl p-5 skeleton h-24" />
    ))}
  </div>
);

export const EmptyState = ({ icon: Icon, title, desc, action }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-slate-600" />
    </div>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    <p className="text-slate-500 text-sm mb-6">{desc}</p>
    {action}
  </div>
);
