// src/admin/pages/AdminOrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ORDER_STATUSES } from '../../utils/products';
import AdminLayout from '../components/AdminLayout';
import { ArrowLeft, Truck, Check, Save } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [orderStatus, setOrderStatus] = useState('');
  const [productPaymentStatus, setProductPaymentStatus] = useState('');
  const [transportAmount, setTransportAmount] = useState('');
  const [transportPaymentStatus, setTransportPaymentStatus] = useState('');
  const [transportPaymentMode, setTransportPaymentMode] = useState('');
  const [transportNote, setTransportNote] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'orders', id), snap => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setOrder(data);
        setOrderStatus(data.status || 'placed');
        setProductPaymentStatus(data.productPayment?.status || 'pending');
        setTransportAmount(data.transportPayment?.amount != null ? String(data.transportPayment.amount) : '');
        setTransportPaymentStatus(data.transportPayment?.status || 'unpaid');
        setTransportPaymentMode(data.transportPayment?.mode || '');
        setTransportNote(data.transportPayment?.note || '');
      }
      setLoading(false);
    });
    return unsub;
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', id), {
        status: orderStatus,
        'productPayment.status': productPaymentStatus,
        'transportPayment.amount': transportAmount !== '' ? Number(transportAmount) : null,
        'transportPayment.status': transportPaymentStatus,
        'transportPayment.mode': transportPaymentMode,
        'transportPayment.note': transportNote,
        updatedAt: serverTimestamp()
      });
      toast.success('Order updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Update failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const markTransportPaid = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', id), {
        'transportPayment.status': 'paid',
        updatedAt: serverTimestamp()
      });
      setTransportPaymentStatus('paid');
      toast.success('Transport marked as Paid!');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout title="Order Detail"><div className="loading"><div className="spinner" /></div></AdminLayout>;
  if (!order) return <AdminLayout title="Order Detail"><div className="empty-state"><div className="empty-state-icon">❓</div><div className="empty-state-title">Order not found</div></div></AdminLayout>;

  return (
    <AdminLayout title={`Order ${order.orderNumber}`}>
      <div style={{ padding: '12px 16px 0' }}>
        {/* Back */}
        <button onClick={() => navigate('/admin/orders')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#e8640a', fontWeight: 600, fontSize: 14, padding: '0 0 12px 0' }}>
          <ArrowLeft size={16} /> Back to Orders
        </button>

        {/* Order Info */}
        <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#e8640a' }}>{order.orderNumber}</div>
              <div style={{ fontSize: 13, color: '#71717a' }}>{order.createdAt?.toDate ? format(order.createdAt.toDate(), 'dd MMM yyyy, hh:mm a') : ''}</div>
            </div>
            <span className="badge" style={{ background: ORDER_STATUSES.find(s => s.id === order.status)?.color + '22', color: ORDER_STATUSES.find(s => s.id === order.status)?.color }}>
              {ORDER_STATUSES.find(s => s.id === order.status)?.label}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{order.customerName}</div>
          <div style={{ fontSize: 13, color: '#71717a' }}>{order.customerMobile} • {order.customerEmail}</div>
          <div style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>
            {order.deliveryAddress?.address}{order.deliveryAddress?.landmark ? `, Near ${order.deliveryAddress.landmark}` : ''}, {order.deliveryAddress?.city}
          </div>
          {order.note && <div style={{ marginTop: 6, fontSize: 12, color: '#71717a', fontStyle: 'italic' }}>Note: {order.note}</div>}
        </div>

        {/* Order Items */}
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f4f4f5', fontSize: 14, fontWeight: 700 }}>Order Items</div>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < order.items.length - 1 ? '1px solid #f4f4f5' : 'none', fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: '#71717a' }}>{item.qty} {item.unit} × ₹{item.price}</div>
              </div>
              <span style={{ fontWeight: 700 }}>₹{item.subtotal?.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#fafafa', borderTop: '1px solid #f4f4f5' }}>
            <span style={{ fontWeight: 700 }}>Product Total</span>
            <span style={{ fontWeight: 800, color: '#e8640a', fontSize: 15 }}>₹{order.productTotal?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Transport Info */}
        <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700, fontSize: 14 }}>
            <Truck size={16} color="#7c4a1e" /> Transport: {order.transport?.name}
          </div>
          <div style={{ fontSize: 12, color: '#71717a' }}>{order.transport?.hindiName}</div>
        </div>

        {/* === ADMIN CONTROLS === */}
        <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '2px solid #e8640a' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e8640a', marginBottom: 14 }}>⚙️ Admin Controls</div>

          {/* Order Status */}
          <div className="form-group">
            <label className="label">Order Status</label>
            <select className="input" value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>
              {ORDER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* === SECTION 1: Product Payment === */}
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 12, marginBottom: 14, border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 10 }}>💰 Section 1: Product Payment</div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">Product Payment Status</label>
              <select className="input" value={productPaymentStatus} onChange={e => setProductPaymentStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#15803d' }}>Product Total: <strong>₹{order.productTotal?.toLocaleString('en-IN')}</strong></div>
          </div>

          {/* === SECTION 2: Transport Payment === */}
          <div style={{ background: '#fff7ed', borderRadius: 10, padding: 12, border: '1px solid #fed7aa' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#7c4a1e', marginBottom: 10 }}>🚛 Section 2: Transport Payment</div>

            <div className="form-group">
              <label className="label">Transport Amount (₹)</label>
              <input className="input" type="number" placeholder="Enter transport amount" value={transportAmount} onChange={e => setTransportAmount(e.target.value)} />
              {!transportAmount && <div style={{ fontSize: 11, color: '#9a6534', marginTop: 4 }}>Leave blank = "To be confirmed"</div>}
            </div>

            <div className="form-group">
              <label className="label">Transport Payment Status</label>
              <select className="input" value={transportPaymentStatus} onChange={e => setTransportPaymentStatus(e.target.value)}>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Payment Mode</label>
              <select className="input" value={transportPaymentMode} onChange={e => setTransportPaymentMode(e.target.value)}>
                <option value="">Select mode...</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="label">Payment Note</label>
              <input className="input" placeholder="Optional note..." value={transportNote} onChange={e => setTransportNote(e.target.value)} />
            </div>

            {transportPaymentStatus !== 'paid' && (
              <button onClick={markTransportPaid} disabled={saving}
                style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, padding: '12px', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Check size={16} /> Mark Transport Payment Received
              </button>
            )}
          </div>

          {/* Save All */}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: 14, fontSize: 15 }}>
            {saving ? 'Saving...' : <><Save size={16} /> Save All Changes</>}
          </button>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </AdminLayout>
  );
}
