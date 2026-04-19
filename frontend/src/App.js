import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import UserDashboard     from './pages/UserDashboard';
import AdminPanel        from './pages/AdminPanel';
import DeliveryDashboard from './pages/DeliveryDashboard';
import OrderDetail       from './pages/OrderDetail';
import LandingPage       from './pages/LandingPage';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
    <div className="text-center">
      <div className="w-14 h-14 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-400 text-sm font-mono">Loading MediRush...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')    return <Navigate to="/admin" replace />;
  if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a2035',
                  color: '#f1f5f9',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: '#1a2035' }, duration: 3000 },
                error:   { iconTheme: { primary: '#f43f5e', secondary: '#1a2035' }, duration: 4000 },
              }}
            />
            <Routes>
              <Route path="/"         element={<LandingPage />} />
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/redirect" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

              <Route path="/dashboard" element={
                <ProtectedRoute roles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/delivery" element={
                <ProtectedRoute roles={['delivery']}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              } />
              <Route path="/orders/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
