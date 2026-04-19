import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Clock, MapPin, ChevronRight, Activity, Truck, Star } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1527 50%, #0a0f1e 100%)' }}>
      {/* Hero noise overlay */}
      <div className="fixed inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")` }} />

      {/* Grid pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-rose-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Medi<span className="gradient-text">Rush</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
          <Link to="/register" className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-sky-500/25">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-8 pt-20 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-sky-400 rounded-full pulse-dot inline-block" />
          AI-Powered Emergency Medicine Delivery
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-none tracking-tight animate-slide-up">
          Medicine at the
          <br />
          <span className="gradient-text">Speed of Life</span>
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in">
          Smart priority-based delivery system that ensures critical medicines reach patients first.
          Real-time tracking, AI urgency detection, zero delays.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-up">
          <Link to="/register" className="group flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-2xl hover:shadow-sky-500/30 hover:-translate-y-0.5">
            Order Now
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:-translate-y-0.5">
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-20">
          {[
            { val: '< 30m', label: 'Emergency Delivery' },
            { val: '99.2%', label: 'Success Rate' },
            { val: '24/7', label: 'Available' },
          ].map(({ val, label }) => (
            <div key={label} className="glass rounded-2xl p-6">
              <div className="text-3xl font-black gradient-text mb-1">{val}</div>
              <div className="text-slate-500 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 pb-32 max-w-7xl mx-auto">
        <h2 className="text-4xl font-black text-white text-center mb-4">Why <span className="gradient-text">MediRush?</span></h2>
        <p className="text-slate-500 text-center mb-16">Built for speed. Designed for life.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, color: 'from-yellow-500 to-orange-500', title: 'Smart Priority', desc: 'AI auto-detects emergency keywords like ICU, critical, urgent and bumps priority instantly.' },
            { icon: MapPin, color: 'from-sky-500 to-blue-600', title: 'Live Tracking', desc: 'Real-time GPS tracking of your delivery partner. Always know where your medicine is.' },
            { icon: Shield, color: 'from-green-500 to-emerald-600', title: 'Verified Partners', desc: 'All delivery partners are background-checked and trained for medical deliveries.' },
            { icon: Clock, color: 'from-rose-500 to-pink-600', title: '24/7 Operations', desc: 'Round-the-clock service because emergencies don\'t wait for business hours.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 card-hover group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-8 pb-32 max-w-4xl mx-auto">
        <h2 className="text-4xl font-black text-white text-center mb-4">How It <span className="gradient-text">Works</span></h2>
        <p className="text-slate-500 text-center mb-16">From request to delivery in minutes</p>

        <div className="space-y-6">
          {[
            { step: '01', icon: Activity, title: 'Submit Request', desc: 'Upload prescription and describe your medicine needs. AI detects urgency automatically.' },
            { step: '02', icon: Zap, title: 'Priority Assigned', desc: 'Smart algorithm scores your order. Emergency cases jump the queue instantly.' },
            { step: '03', icon: Truck, title: 'Partner Dispatched', desc: 'Nearest verified delivery partner accepts and heads to the pharmacy.' },
            { step: '04', icon: Star, title: 'Delivered Fast', desc: 'Track in real-time. Get notified at every step until delivery.' },
          ].map(({ step, icon: Icon, title, desc }, i) => (
            <div key={step} className="flex items-start gap-6 glass rounded-2xl p-6 card-hover">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sky-400 font-black text-sm font-mono">{step}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
              <Icon className="w-6 h-6 text-sky-500/40 flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-8 pb-32 text-center">
        <div className="glass rounded-3xl p-16 max-w-3xl mx-auto neon-blue">
          <h2 className="text-4xl font-black text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-400 mb-8">Join thousands who trust MediRush for their emergency medicine needs.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-rose-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity hover:-translate-y-0.5 hover:shadow-2xl">
            Start Free — Order Now
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-8 text-center text-slate-600 text-sm">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Activity className="w-4 h-4 text-sky-500/50" />
          <span className="text-white/30 font-bold">MediRush</span>
        </div>
        <p>© 2024 MediRush. Smart Medicine Delivery System.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
