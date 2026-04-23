// src/customer/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useCart } from '../../shared/hooks/useCart';
import { TRANSPORT_OPTIONS, generateOrderNumber } from '../../utils/products';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import TransportNotice from '../components/TransportNotice';
import { ArrowLeft, Truck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { items, transport, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    name: userData?.name || '',
    mobile: userData?.mobile || '',
    address: '',
    landmark: '',
    city: '',
    note: ''
  });
  useEffect(() => {
  if (userData) {
    setForm(prev => ({
      ...prev,
      name: prev.name || userData.name || '',
      mobile: prev.mobile || userData.mobile || '',
    }));
  }
  }, [userData]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const selectedTransport = TRANSPORT_OPTIONS.find(t => t.id === transport);
  const canPlace =
  !!user &&
  !!selectedTransport &&
  !!form.name.trim() &&
  /^[6-9]\d{9}$/.test(form.mobile.trim()) &&
  !!form.address.trim() &&
  !!form.city.trim() &&
  !!transport &&
  agreed &&
  items.length > 0;
  const placeOrder = async () => {
   if (!canPlace) return;
   if (!user) {
     toast.error('Please login first');
     setLoading(false);
     return;
   }
   if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
     toast.error('Enter valid Indian mobile number');
     return;
   }
   setLoading(true);
    try {
      const orderData = {
        orderNumber: generateOrderNumber(),
        customerId: user.uid,
        customerName: form.name,
        customerMobile: form.mobile,
        customerEmail: user.email,
        deliveryAddress: {
          address: form.address,
          landmark: form.landmark,
          city: form.city
        },
        note: form.note,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          hindiName: i.hindiName,
          price: i.price,
          unit: i.unit,
          qty: i.qty,
          subtotal: i.price * i.qty
        })),
        productTotal: totalAmount,
        transport: {
          type: transport,
          name: selectedTransport?.name,
          hindiName: selectedTransport?.hindiName
        },
        status: 'placed',
        productPayment: {
          status: 'pending',
          amount: totalAmount
        },
        transportPayment: {
          amount: null,
          status: 'unpaid',
          mode: null,
          note: ''
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${docRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
  return <Navigate to="/cart" replace />;
  }

  return (
    <div className="page" style={{ paddingBottom: 180 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1>Checkout / चेकआउट</h1>
      </div>

      {/* Order Summary */}
      <div className="section-title">Order Summary</div>
      <div style={{ margin: '0 16px', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #f4f4f5' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>{item.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#71717a' }}>{item.qty} {item.unit} × ₹{item.price}</div>
              </div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #f4f4f5' }}>
          <span style={{ fontWeight: 700 }}>Product Total</span>
          <span style={{ fontWeight: 800, color: '#e8640a', fontSize: 17 }}>₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>

        {/* Transport */}
        <div style={{ padding: '12px 14px', background: '#fff7ed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Truck size={14} color="#7c4a1e" />
            <span style={{ fontWeight: 600, fontSize: 13, color: '#7c4a1e' }}>Transport: {selectedTransport?.name}</span>
          </div>
          <div style={{ fontSize: 12, color: '#9a6534' }}>Transport charges will be confirmed and paid at delivery.</div>
        </div>
      </div>

      {/* Transport Notice */}
      <TransportNotice />

      {/* Delivery Address */}
      <div className="section-title">Delivery Address / डिलीवरी पता</div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="label">Full Name / पूरा नाम *</label>
          <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Mobile Number / मोबाइल *</label>
          <input
            className="input"
            type="tel"
            placeholder="10-digit mobile"
            value={form.mobile}
            onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            maxLength={10}
          />
        </div>
        <div>
          <label className="label">Address / पता *</label>
          <textarea className="input" placeholder="Full delivery address" value={form.address} onChange={set('address')} rows={2} style={{ resize: 'none' }} />
        </div>
        <div>
          <label className="label">Landmark / लैंडमार्क</label>
          <input className="input" placeholder="Nearby landmark (optional)" value={form.landmark} onChange={set('landmark')} />
        </div>
        <div>
          <label className="label">Village / Area / City *</label>
          <input className="input" placeholder="Village or city name" value={form.city} onChange={set('city')} />
        </div>
        <div>
          <label className="label">Note for Delivery (Optional)</label>
          <textarea className="input" placeholder="Any special instructions..." value={form.note} onChange={set('note')} rows={2} style={{ resize: 'none' }} />
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div style={{ margin: '16px 16px 0' }}>
        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', background: '#fff7ed', borderRadius: 12, padding: 14, border: '1.5px solid #fed7aa' }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#e8640a', marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: '#7c4a1e', lineHeight: 1.5 }}>
            <strong>I understand that transport charges are separate and will be paid at the time of delivery.</strong>
            {' '}मैं समझता/समझती हूं कि ट्रांसपोर्ट चार्ज अलग से डिलीवरी पर देय हैं।
          </div>
        </label>
      </div>

      {/* Sticky Place Order Button */}
      <div className="sticky-bottom">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#71717a' }}>Product Total</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#e8640a' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: 16, padding: '16px' }}
          disabled={!canPlace || loading}
          onClick={placeOrder}
        >
          {loading ? 'Placing Order...' : canPlace ? (
            <><Check size={18} /> Place Order / ऑर्डर दें</>
          ) : !agreed ? (
            'Accept terms to continue'
          ) : !form.name || !form.mobile || !form.address || !form.city ? (
            'Fill all required fields'
          ) : (
            'Complete form to order'
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
