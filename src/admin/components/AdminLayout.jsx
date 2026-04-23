// src/admin/components/AdminLayout.jsx
import logo from '../../assets/logo.png';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { Menu, X, LayoutDashboard, ClipboardList, Users, Package, LogOut, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/orders', icon: ClipboardList, label: 'All Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/products', icon: Package, label: 'Products' },
];

export default function AdminLayout({ children, title }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out');
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f5' }}>
      {/* Top Header */}
      <div style={{ background: '#3f1a08', color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', gap: 8 }}>

        {title !== 'Dashboard' && (
        <button
        onClick={() => navigate(-1)}
        style={{
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: 'white',
        padding: 10,
        borderRadius: 10,
        cursor: 'pointer'
        }}
        >
        ←
        </button>
        )}

        <button
        onClick={() => setMenuOpen(true)}
        style={{
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: 'white',
        padding: 10,
        borderRadius: 10,
        cursor: 'pointer'
        }}
        >
        <Menu size={20} />
        </button>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 72, height: 72, background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          <img src={logo} alt="Prakash Building Material" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
        </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{title || 'Admin Panel'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Prakash Building Material</div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300 }} onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, background: '#3f1a08', zIndex: 400, transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ width: 44, height: 44, background: '#e8640a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>PBM</span>
            </div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Admin Panel</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Prakash Building Material</div>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px', borderRadius: 10, marginBottom: 4,
                textDecoration: 'none', color: isActive ? '#e8640a' : 'rgba(255,255,255,0.75)',
                background: isActive ? 'rgba(232,100,10,0.15)' : 'transparent',
                fontWeight: isActive ? 700 : 500, fontSize: 14
              })}>
              <Icon size={18} />
              {label}
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px', borderRadius: 10, width: '100%', background: 'rgba(220,38,38,0.15)', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}
