// src/customer/pages/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { useCart } from '../../shared/hooks/useCart';
import { fetchLiveProducts, ORDER_STATUSES } from '../../utils/products';
import BottomNav from '../components/BottomNav';
import { ArrowLeft, Truck, MessageCircle, Printer, RefreshCw, Check } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  const s = ORDER_STATUSES.find(o => o.id === status) || ORDER_STATUSES[0];
  return <span className="badge" style={{ background: s.color + '22', color: s.color, fontSize: 13, padding: '5px 12px' }}>{s.label}</span>;
}

const STATUS_ORDER = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, setTransport } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const waNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '919999999999';

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'orders', id), snap => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [id]);

  const handleReorder = async () => {
    if (!order) return;
    const liveProducts = await fetchLiveProducts();
    order.items.forEach(item => {
      const product = liveProducts.find(p => p.id === item.id);
      if (product) addItem(product, item.qty);
    });
    if (order.transport?.type) setTransport(order.transport.type);
    toast.success('Items added to cart!');
    navigate('/cart');
  };

  const handleWhatsApp = () => {
    if (!order) return;
    const msg = `Hello! I have a query about my order *${order.orderNumber}*. Current status: ${order.status}`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrint = () => window.print();

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!order) return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1>Order Not Found</h1>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">❓</div>
        <div className="empty-state-title">Order not found</div>
        <button className="btn btn-primary" style={{ margin: '0 16px' }} onClick={() => navigate('/orders')}>My Orders</button>
      </div>
      <BottomNav />
    </div>
  );

  const currentStatusIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1>Order #{order.orderNumber}</h1>
      </div>

      {/* Status Banner */}
      <div style={{ background: 'linear-gradient(135deg, #fef3eb, #fff7ed)', padding: '14px 16px', borderBottom: '1px solid #fed7aa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#7c4a1e', fontWeight: 600 }}>Order Status</span>
          <StatusBadge status={order.status} />
        </div>
        {order.status !== 'cancelled' && (
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {STATUS_ORDER.map((s, idx) => {
              const st = ORDER_STATUSES.find(o => o.id === s);
              const done = idx <= currentStatusIdx;
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: done ? '#e8640a' : '#e4e4e7', flexShrink: 0 }} />
                  {idx < STATUS_ORDER.length - 1 && <div style={{ flex: 1, height: 2, background: done && idx < currentStatusIdx ? '#e8640a' : '#e4e4e7' }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="section-title">Items Ordered</div>
      <div style={{ margin: '0 16px', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 12 }}>
        {order.items?.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: i < order.items.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: '#71717a' }}>{item.qty} {item.unit} × ₹{item.price}</div>
            </div>
            <span style={{ fontWeight: 700 }}>₹{item.subtotal?.toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#fafafa', borderTop: '1px solid #f4f4f5' }}>
          <span style={{ fontWeight: 700 }}>Product Total</span>
          <span style={{ fontWeight: 800, color: '#e8640a', fontSize: 16 }}>₹{order.productTotal?.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Transport */}
      <div className="section-title">Transport</div>
      <div style={{ margin: '0 16px 12px', background: 'white', borderRadius: 12, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <Truck size={16} color="#7c4a1e" />
          <span style={{ fontWeight: 700 }}>{order.transport?.name}</span>
        </div>
        <div style={{ background: '#fff7ed', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#7c4a1e' }}>
          <strong>Transport charges:</strong> {order.transportPayment?.amount != null ? `₹${order.transportPayment.amount.toLocaleString('en-IN')}` : 'To be confirmed by shop'}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="section-title">Payment Details</div>
      <div style={{ margin: '0 16px 12px', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {/* Product Payment */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #f4f4f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Product Payment</div>
              <div style={{ fontSize: 12, color: '#71717a' }}>₹{order.productTotal?.toLocaleString('en-IN')}</div>
            </div>
            <span className={`badge ${order.productPayment?.status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
              {order.productPayment?.status === 'paid' ? '✓ Paid' : 'Pending'}
            </span>
          </div>
        </div>
        {/* Transport Payment */}
        <div style={{ padding: '12px 14px', background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Transport Payment</div>
              <div style={{ fontSize: 12, color: '#71717a' }}>
                {order.transportPayment?.amount != null ? `₹${order.transportPayment.amount.toLocaleString('en-IN')}` : 'Amount TBD'}
                {order.transportPayment?.mode ? ` • ${order.transportPayment.mode}` : ''}
              </div>
              {order.transportPayment?.note && <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>{order.transportPayment.note}</div>}
            </div>
            <span className={`badge ${order.transportPayment?.status === 'paid' ? 'badge-green' : order.transportPayment?.status === 'partial' ? 'badge-blue' : 'badge-gray'}`}>
              {order.transportPayment?.status === 'paid' ? '✓ Paid' : order.transportPayment?.status === 'partial' ? 'Partial' : 'Unpaid'}
            </span>
          </div>
          {order.transportPayment?.status !== 'paid' && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#e8640a', fontWeight: 600 }}>
              🚛 Transport charges paid separately at delivery
            </div>
          )}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="section-title">Delivery Address</div>
      <div style={{ margin: '0 16px 12px', background: 'white', borderRadius: 12, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{order.customerName}</div>
        <div style={{ fontSize: 13, color: '#71717a' }}>{order.customerMobile}</div>
        <div style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>
          {order.deliveryAddress?.address}
          {order.deliveryAddress?.landmark ? `, Near ${order.deliveryAddress.landmark}` : ''}
          {', '}{order.deliveryAddress?.city}
        </div>
        {order.note && <div style={{ marginTop: 6, fontSize: 12, color: '#71717a', fontStyle: 'italic' }}>Note: {order.note}</div>}
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
        <button className="btn btn-secondary" onClick={handleReorder}>
          <RefreshCw size={16} /> Reorder
        </button>
        <button onClick={handleWhatsApp} style={{ background: '#25d366', color: 'white', border: 'none', borderRadius: 12, padding: '14px', cursor: 'pointer', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <MessageCircle size={18} /> WhatsApp Support
        </button>
        <button className="btn btn-ghost" onClick={handlePrint}>
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
