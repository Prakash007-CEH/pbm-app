// src/customer/pages/Orders.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ORDER_STATUSES } from '../../utils/products';
import BottomNav from '../components/BottomNav';
import { ArrowLeft, ChevronRight, Truck } from 'lucide-react';
import { format } from 'date-fns';

function StatusBadge({ status }) {
  const s = ORDER_STATUSES.find(o => o.id === status) || ORDER_STATUSES[0];
  return <span className="badge" style={{ background: s.color + '22', color: s.color }}>{s.label}</span>;
}

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
       setLoading(false);
       setOrders([]);
       return;
    }
   const q = query(collection(db, 'orders'), where('customerId', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
      setOrders(data);
      setLoading(false);
    }, (err) => {
      console.error('Orders query error:', err);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1>My Orders / मेरे ऑर्डर</h1>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">No orders yet</div>
          <div className="empty-state-text">Place your first order from our products</div>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px', marginTop: 8 }} onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div style={{ padding: '8px 0' }}>
          {orders.map(order => (
            <div key={order.id} className="order-card" onClick={() => navigate(`/orders/${order.id}`)}>
              <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f4f4f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e8640a' }}>{order.orderNumber}</div>
                    <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                      {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd MMM yyyy, hh:mm a') : 'Just now'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <StatusBadge status={order.status} />
                    <ChevronRight size={14} color="#71717a" />
                  </div>
                </div>
              </div>
              <div style={{ padding: '10px 14px' }}>
                <div style={{ fontSize: 12, color: '#71717a', marginBottom: 6 }}>
                  {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} • {order.items?.map(i => i.name).join(', ').slice(0, 40)}{(order.items?.map(i => i.name).join(', ').length || 0) > 40 ? '...' : ''}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Truck size={12} color="#7c4a1e" />
                    <span style={{ fontSize: 12, color: '#7c4a1e' }}>{order.transport?.name}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#e8640a' }}>
                    ₹{order.productTotal?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}