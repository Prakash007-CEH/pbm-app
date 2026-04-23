// src/admin/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { ORDER_STATUSES } from '../../utils/products';
import AdminLayout from '../components/AdminLayout';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

function StatusBadge({ status }) {
  const s = ORDER_STATUSES.find(o => o.id === status) || ORDER_STATUSES[0];
  return <span className="badge" style={{ background: s.color + '22', color: s.color, fontSize: 11 }}>{s.label}</span>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsubCustomers = onSnapshot(collection(db, 'users'), snap => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role !== 'admin'));
    });
    return () => { unsubOrders(); unsubCustomers(); };
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['placed', 'confirmed', 'preparing'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.productPayment?.status === 'paid').reduce((s, o) => s + (o.productTotal || 0), 0),
    transportUnpaid: orders.filter(o => o.transportPayment?.status === 'unpaid' && o.status !== 'cancelled').length,
  };

  const recent = orders.slice(0, 8);

  return (
    <AdminLayout title="Dashboard">
      <div style={{ padding: '16px 16px 0' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total Orders', value: stats.total, color: '#e8640a' },
            { label: 'Pending Orders', value: stats.pending, color: '#d97706' },
            { label: 'Delivered', value: stats.delivered, color: '#16a34a' },
            { label: 'Customers', value: customers.length, color: '#2563eb' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div style={{ fontSize: 26, fontWeight: 800, color }}>{loading ? '...' : value}</div>
              <div style={{ fontSize: 12, color: '#71717a', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div style={{ background: 'linear-gradient(135deg, #e8640a, #7c4a1e)', borderRadius: 14, padding: '16px', marginBottom: 16, color: 'white' }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>Paid Revenue (Products)</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>₹{stats.revenue.toLocaleString('en-IN')}</div>
          {stats.transportUnpaid > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 10px' }}>
              ⚠️ {stats.transportUnpaid} order{stats.transportUnpaid > 1 ? 's' : ''} with transport unpaid
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'All Orders', path: '/admin/orders', emoji: '📋' },
            { label: 'Customers', path: '/admin/customers', emoji: '👥' },
            { label: 'Products', path: '/admin/products', emoji: '📦' },
            { label: 'Transport Unpaid', path: '/admin/orders?filter=transport_unpaid', emoji: '🚛' },
          ].map(({ label, path, emoji }) => (
            <button key={label} onClick={() => navigate(path)}
              style={{ background: 'white', border: '1.5px solid #e4e4e7', borderRadius: 12, padding: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Recent Orders</span>
          <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', color: '#e8640a', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
            All <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#71717a' }}>No orders yet</div>
        ) : (
          recent.map(order => (
            <div key={order.id} className="order-card" style={{ margin: '0 0 10px' }} onClick={() => navigate(`/admin/orders/${order.id}`)}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e8640a' }}>{order.orderNumber}</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>{order.customerName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end' }}>
                    <StatusBadge status={order.status} />
                    {order.transportPayment?.status === 'unpaid' && <span className="badge badge-yellow" style={{ fontSize: 10 }}>Transport Unpaid</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#71717a' }}>
                  <span>{order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd MMM, hh:mm a') : 'Just now'}</span>
                  <span style={{ fontWeight: 700, color: '#18181b' }}>₹{order.productTotal?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))
        )}
        <div style={{ height: 20 }} />
      </div>
    </AdminLayout>
  );
}
