import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Bell, Sun, Moon, LogOut, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { notifications, markRead } = useSocket();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unread = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleColor = { user: 'sky', admin: 'rose', delivery: 'emerald' }[user?.role] || 'sky';
  const roleLabel = { user: 'Patient', admin: 'Admin', delivery: 'Delivery' }[user?.role] || '';

  const navLinks = {
    user: [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Orders', to: '/dashboard' }],
    admin: [{ label: 'Admin Panel', to: '/admin' }],
    delivery: [{ label: 'My Deliveries', to: '/delivery' }],
  }[user?.role] || [];

  return (
    <nav className={`sticky top-0 z-50 ${dark ? 'glass border-b border-white/5' : 'glass-light border-b border-black/5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-rose-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className={`text-lg font-black ${dark ? 'text-white' : 'text-slate-800'}`}>
              Medi<span className="gradient-text">Rush</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className={`text-sm font-medium transition-colors ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggle}
              className={`p-2 rounded-xl transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-black/5'}`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifs(s => !s)}
                className={`relative p-2 rounded-xl transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-black/5'}`}>
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full pulse-dot" />
                )}
              </button>

              {showNotifs && (
                <div className={`absolute right-0 mt-2 w-80 ${dark ? 'glass' : 'glass-light'} rounded-2xl shadow-2xl overflow-hidden`}>
                  <div className={`px-4 py-3 border-b ${dark ? 'border-white/5' : 'border-black/5'} flex items-center justify-between`}>
                    <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-slate-800'}`}>Notifications</span>
                    {unread > 0 && <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">{unread} new</span>}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">No notifications yet</div>
                    ) : notifications.slice(0, 10).map(n => (
                      <div key={n.id} onClick={() => markRead(n.id)}
                        className={`px-4 py-3 cursor-pointer transition-colors ${dark ? 'hover:bg-white/5' : 'hover:bg-black/5'} ${!n.read ? (dark ? 'bg-sky-500/5' : 'bg-sky-50') : ''}`}>
                        <p className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{n.message}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(n.id).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setShowMenu(s => !s)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${dark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                <div className={`w-7 h-7 rounded-lg bg-${roleColor}-500/20 border border-${roleColor}-500/30 flex items-center justify-center`}>
                  <User className={`w-3.5 h-3.5 text-${roleColor}-400`} />
                </div>
                <span className={`text-sm font-medium hidden sm:block ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3 h-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
              </button>

              {showMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${dark ? 'glass' : 'glass-light'} rounded-2xl shadow-2xl overflow-hidden`}>
                  <div className={`px-4 py-3 border-b ${dark ? 'border-white/5' : 'border-black/5'}`}>
                    <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-slate-800'}`}>{user?.name}</p>
                    <span className={`text-xs bg-${roleColor}-500/20 text-${roleColor}-400 px-2 py-0.5 rounded-full`}>{roleLabel}</span>
                  </div>
                  <button onClick={handleLogout}
                    className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors`}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(s => !s)}
              className={`md:hidden p-2 rounded-xl ${dark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-black/5'}`}>
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className={`md:hidden border-t ${dark ? 'border-white/5' : 'border-black/5'} py-3`}>
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2 text-sm font-medium rounded-xl transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-black/5'}`}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
