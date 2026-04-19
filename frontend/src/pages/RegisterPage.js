import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', phone: '', address: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to MediRush, ${user.name.split(' ')[0]}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1527 100%)' }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-rose-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Medi<span className="gradient-text">Rush</span></span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
          <p className="text-slate-500 text-sm">Join MediRush and get medicines delivered fast</p>
        </div>

        <div className="glass rounded-3xl p-8">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-slate-400 text-sm font-medium mb-2 block">Full Name</label>
                <input name="name" value={form.name} onChange={handle} placeholder="Raj Kumar" required className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 text-sm font-medium mb-2 block">Email</label>
                <input name="email" type="email" value={form.email} onChange={handle} placeholder="your@email.com" required className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 text-sm font-medium mb-2 block">Phone</label>
                <input name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="text-slate-400 text-sm font-medium mb-2 block">Role</label>
                <select name="role" value={form.role} onChange={handle} className="input-field">
                  <option value="user" style={{ background: '#1a2035' }}>Patient / Customer</option>
                  <option value="delivery" style={{ background: '#1a2035' }}>Delivery Partner</option>
                </select>
              </div>
              {form.role === 'user' && (
                <div className="col-span-2">
                  <label className="text-slate-400 text-sm font-medium mb-2 block">Delivery Address</label>
                  <input name="address" value={form.address} onChange={handle} placeholder="House No., Street, City" className="input-field" />
                </div>
              )}
              <div className="col-span-2">
                <label className="text-slate-400 text-sm font-medium mb-2 block">Password</label>
                <div className="relative">
                  <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="Min 6 characters" required className="input-field pr-12" />
                  <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-sky-500/25 flex items-center justify-center gap-2 mt-6">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
