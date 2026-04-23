// src/admin/pages/AdminCustomers.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import AdminLayout from '../components/AdminLayout';
import { Search, X, ChevronRight, Phone, Mail } from 'lucide-react';

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubCustomers = onSnapshot(collection(db, 'users'), snap => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role !== 'admin'));
      setLoading(false);
    });
    const unsubOrders = onSnapshot(collection(db, 'orders'), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubCustomers(); unsubOrders(); };
  }, []);

  const enriched = customers.map(c => {
    const customerOrders = orders.filter(o => o.customerId === c.id);
    const spend = customerOrders.reduce((s, o) => s + (o.productTotal || 0), 0);
    return { ...c, orderCount: customerOrders.length, totalSpend: spend };
  }).sort((a, b) => b.orderCount - a.orderCount);

  const filtered = enriched.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.mobile?.includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout title="Customers">
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={15} color="#71717a" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search name, mobile, email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>}
        </div>

        <div style={{ fontSize: 13, color: '#71717a', marginBottom: 10 }}>{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-title">No customers yet</div></div>
        ) : (
          filtered.map(c => (
            <div key={c.id} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }}
              onClick={() => navigate(`/admin/orders?customer=${c.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, background: '#fef3eb', borderRadius: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    👤
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>Joined {c.createdAt?.toDate ? new Date(c.createdAt.toDate()).getFullYear() : '—'}</div>
                  </div>
                </div>
                <ChevronRight size={14} color="#71717a" />
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> {c.mobile}
                </span>
                <span style={{ fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={11} /> {c.email}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, background: '#f4f4f5', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#e8640a' }}>{c.orderCount}</div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>Orders</div>
                </div>
                <div style={{ flex: 1, background: '#f4f4f5', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#16a34a' }}>₹{c.totalSpend.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 11, color: '#71717a' }}>Total Spend</div>
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
