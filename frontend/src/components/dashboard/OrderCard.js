import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, User, ChevronRight, Image } from 'lucide-react';
import { StatusBadge, UrgencyBadge, PriorityBar } from '../shared/Badges';

const OrderCard = ({ order, showUser = false, actions }) => {
  const time = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="glass rounded-2xl p-5 card-hover group animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={order.status} />
            <UrgencyBadge level={order.urgencyLevel} />
            {order.isManualPriority && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Manual Priority</span>
            )}
          </div>
          <p className="text-white font-semibold text-sm mt-2 line-clamp-2">{order.medicines}</p>
        </div>
        <div className="flex items-center gap-2">
          {order.prescriptionImage && (
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Image className="w-3.5 h-3.5 text-sky-400" />
            </div>
          )}
          <Link to={`/orders/${order._id}`}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group-hover:border-sky-500/30">
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Priority bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-600">Priority Score</span>
        </div>
        <PriorityBar score={order.priorityScore} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />{time}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-3 h-3" />
            <span className="max-w-[140px] truncate">{order.deliveryAddress}</span>
          </span>
        </div>
        {showUser && order.user && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <User className="w-3 h-3" />
            {order.user.name}
          </span>
        )}
      </div>

      {order.deliveryPartner && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <User className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-xs text-slate-500">Partner: <span className="text-emerald-400 font-medium">{order.deliveryPartner.name}</span></span>
        </div>
      )}

      {actions && <div className="mt-3 pt-3 border-t border-white/5">{actions}</div>}
    </div>
  );
};

export default OrderCard;
