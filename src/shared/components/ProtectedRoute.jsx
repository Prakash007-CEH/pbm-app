// src/shared/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function CustomerRoute({ children }) {
  const { user, userData, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (userData?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, userData, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  // userData may still be loading — wait for it
  if (userData?.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (user && userData?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user) return <Navigate to="/home" replace />;

  return children;
}
