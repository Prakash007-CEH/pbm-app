// src/admin/pages/AdminOrders.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ORDER_STATUSES } from '../../utils/products';
import AdminLayout from '../components/AdminLayout';
import { Search, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';

function StatusBadge({ status }) {
  const s = ORDER_STATUSES.find(o => o.id === status) || ORDER_STATUSES[0];
  return <span className="badge" style={{ background: s.color + '22', color: s.color, fontSize: 11 }}>{s.label}</span>;
}

function TransportBadge({ status }) {
  const map = { unpaid: ['badge-yellow', 'Transport Unpaid'], partial: ['badge-blue', 'Transport Partial'], paid: ['badge-green', 'Transport Paid'] };
  const [cls, label] = map[status] || ['badge-gray', 'Unknown'];
  return <span className={`badge ${cls}`} style={{ fontSize: 10 }}>{label}</span>;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') === 'transport_unpaid' ? 'transport_unpaid' : 'all');
  const customerFilter = searchParams.get('customer');

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

const filtered = orders.filter(o => {
  const q = search.toLowerCase();

  const matchSearch =
    !q ||
    o.orderNumber?.toLowerCase().includes(q) ||
    o.customerName?.toLowerCase().includes(q) ||
    o.customerMobile?.includes(q);

  const matchCustomer = !customerFilter || o.customerId === customerFilter;

  let matchStatus = true;
  if (statusFilter === 'transport_unpaid') {
    matchStatus = o.transportPayment?.status === 'unpaid' && o.status !== 'cancelled';
  } else if (statusFilter !== 'all') {
    matchStatus = o.status === statusFilter;
  }

  return matchSearch && matchCustomer && matchStatus;
});

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'placed', label: 'Placed' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'transport_unpaid', label: '🚛 Transport Unpaid' },
  ];

  return (
    <AdminLayout title="All Orders">
      <div style={{ padding: '12px 16px 0' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={15} color="#71717a" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search order, customer, mobile..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, paddingRight: search ? 34 : 12 }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }}>
          {filterOptions.map(f => (
            <button key={f.id} onClick={() => setStatusFilter(f.id)}
              style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: statusFilter === f.id ? '#7c4a1e' : 'white', color: statusFilter === f.id ? 'white' : '#3f3f46', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#71717a', marginBottom: 10 }}>{filtered.length} order{filtered.length !== 1 ? 's' : ''}</div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No orders found</div>
          </div>
        ) : (
          filtered.map(order => (
            <div key={order.id} className="order-card" style={{ margin: '0 0 10px', cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${order.id}`)}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e8640a' }}>{order.orderNumber}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>{order.customerName}</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>{order.customerMobile}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <StatusBadge status={order.status} />
                    <TransportBadge status={order.transportPayment?.status} />
                    <ChevronRight size={14} color="#71717a" />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#71717a', borderTop: '1px solid #f4f4f5', paddingTop: 8 }}>
                  <span>{order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd MMM yyyy, hh:mm a') : 'Just now'}</span>
                  <span style={{ fontWeight: 700, color: '#18181b', fontSize: 13 }}>₹{order.productTotal?.toLocaleString('en-IN')}</span>
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
