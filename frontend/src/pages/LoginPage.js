import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DEMO_CREDENTIALS = [
  { label: 'User',     email: 'raj@example.com',     password: 'user123',     color: 'sky',     emoji: '👤' },
  { label: 'Admin',    email: 'admin@medirush.com',   password: 'admin123',    color: 'rose',    emoji: '🛡️' },
  { label: 'Delivery', email: 'arjun@medirush.com',   password: 'delivery123', color: 'emerald', emoji: '🚴' },
];

const LoginPage = () => {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const redirectByRole = (role) => {
    if (role === 'admin')    return navigate('/admin');
    if (role === 'delivery') return navigate('/delivery');
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      redirectByRole(user.role);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleDemoLogin = async (cred) => {
    if (loading || activeDemo) return;
    setActiveDemo(cred.label);
    setForm({ email: cred.email, password: cred.password });
    try {
      const user = await login(cred.email, cred.password);
      toast.success(`Logged in as ${cred.label} — ${user.name}`);
      redirectByRole(user.role);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Make sure backend is running and seeded.');
      setActiveDemo(null);
    }
  };

  const isLoading = loading || activeDemo !== null;

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1527 100%)' }}>

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(14,165,233,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.4) 1px,transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)' }} />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-rose-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Medi<span className="gradient-text">Rush</span></span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white mb-3 leading-tight">
            Deliver medicines<br />
            <span className="gradient-text">faster than ever</span>
          </h2>
          <p className="text-slate-500 text-lg mb-10">Smart priority. Real-time tracking. Zero delays.</p>

          <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest mb-4">Quick Login</p>
          <div className="space-y-3">
            {DEMO_CREDENTIALS.map(cred => (
              <button key={cred.label} onClick={() => handleDemoLogin(cred)} disabled={isLoading}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-${cred.color}-500/20 bg-${cred.color}-500/5 hover:bg-${cred.color}-500/12 active:scale-[0.99] transition-all group disabled:opacity-50 disabled:cursor-not-allowed`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cred.emoji}</span>
                  <div className="text-left">
                    <p className={`text-${cred.color}-400 font-bold text-sm`}>{cred.label}</p>
                    <p className="text-slate-600 text-xs font-mono">{cred.email}</p>
                  </div>
                </div>
                {activeDemo === cred.label
                  ? <Loader className="w-4 h-4 text-slate-400 animate-spin" />
                  : <ArrowRight className={`w-4 h-4 text-${cred.color}-500/40 group-hover:text-${cred.color}-400 group-hover:translate-x-0.5 transition-all`} />
                }
              </button>
            ))}
          </div>
          <p className="text-slate-700 text-xs mt-4">* Run <code className="text-slate-600">npm run seed</code> in backend/ first</p>
        </div>

        <p className="text-slate-700 text-sm relative z-10">© 2024 MediRush</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="glass rounded-3xl p-8">

            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-rose-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Medi<span className="gradient-text">Rush</span></span>
            </div>

            <div className="text-center mb-7">
              <h1 className="text-3xl font-black text-white mb-1">Welcome back</h1>
              <p className="text-slate-500 text-sm">Sign in with your account</p>
            </div>

            {/* Mobile quick login */}
            <div className="lg:hidden space-y-2 mb-5">
              {DEMO_CREDENTIALS.map(cred => (
                <button key={cred.label} onClick={() => handleDemoLogin(cred)} disabled={isLoading}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-${cred.color}-500/20 bg-${cred.color}-500/8 hover:bg-${cred.color}-500/15 transition-all disabled:opacity-50`}>
                  <div className="flex items-center gap-2">
                    <span>{cred.emoji}</span>
                    <span className={`text-${cred.color}-400 font-semibold text-sm`}>{cred.label}</span>
                    <span className="text-slate-600 text-xs font-mono hidden sm:inline">{cred.email}</span>
                  </div>
                  {activeDemo === cred.label
                    ? <Loader className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                    : <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  }
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-600 text-xs whitespace-nowrap">or enter manually</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="text-slate-400 text-sm font-medium mb-1.5 block">Email</label>
                <input name="email" type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com" autoComplete="email" disabled={isLoading}
                  className="input-field disabled:opacity-60" required />
              </div>
              <div>
                <label className="text-slate-400 text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <input name="password" type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••" autoComplete="current-password" disabled={isLoading}
                    className="input-field pr-12 disabled:opacity-60" required />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-sky-500/25 flex items-center justify-center gap-2 mt-1">
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              No account?{' '}
              <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
