// src/customer/pages/Cart.jsx
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/hooks/useCart';
import { TRANSPORT_OPTIONS } from '../../utils/products';
import BottomNav from '../components/BottomNav';
import TransportNotice from '../components/TransportNotice';
import { ArrowLeft, Trash2, Plus, Minus, Truck, ShoppingBag, ChevronRight } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, transport, setTransport, updateQty, removeItem, totalAmount } = useCart();

  const canCheckout = items.length > 0 && transport;

  return (
    <div className="page" style={{ paddingBottom: 160 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1>Cart / कार्ट</h1>
        {items.length > 0 && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{items.length} item{items.length !== 1 ? 's' : ''}</span>}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <div className="empty-state-title">Cart is Empty</div>
          <div className="empty-state-text">Add products to place an order</div>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 24px', marginTop: 8 }} onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="section-title">Items</div>
          {items.map(item => (
            <div key={item.id} style={{ background: 'white', margin: '0 16px 10px', borderRadius: 12, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, background: '#fef3eb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#71717a' }}>₹{item.price} per {item.unit}</div>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Trash2 size={14} color="#dc2626" />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Quantity Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>
                      <Minus size={14} />
                    </button>
                    <input
                      className="qty-input"
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={e => updateQty(item.id, e.target.value)}
                      onBlur={e => { if (!e.target.value || parseInt(e.target.value) <= 0) updateQty(item.id, 1); }}
                    />
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <span style={{ fontSize: 12, color: '#71717a' }}>{item.unit}</span>
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#e8640a' }}>
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Transport Selection */}
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Truck size={16} color="#e8640a" /> Transport / परिवहन
            <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 400 }}>*Required</span>
          </div>

          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TRANSPORT_OPTIONS.map(t => (
              <label key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, background: 'white', borderRadius: 12, padding: '14px', cursor: 'pointer',
                border: `2px solid ${transport === t.id ? '#e8640a' : '#e4e4e7'}`,
                boxShadow: transport === t.id ? '0 2px 8px rgba(232,100,10,0.15)' : '0 1px 4px rgba(0,0,0,0.04)'
              }}>
                <input type="radio" name="transport" value={t.id} checked={transport === t.id} onChange={() => setTransport(t.id)} style={{ accentColor: '#e8640a', width: 18, height: 18 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#71717a' }}>{t.hindiName} • {t.description}</div>
                </div>
                <Truck size={18} color={transport === t.id ? '#e8640a' : '#d4d4d8'} />
              </label>
            ))}
          </div>

          {!transport && (
            <div style={{ margin: '8px 16px', background: '#fee2e2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
              ⚠️ Please select transport to continue
            </div>
          )}

          {/* Transport Notice */}
          <TransportNotice />

          {/* Order Summary */}
          <div className="section-title">Order Summary</div>
          <div style={{ margin: '0 16px', background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f4f4f5', fontSize: 13 }}>
                <span style={{ color: '#3f3f46' }}>{item.name} × {item.qty} {item.unit}</span>
                <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', fontSize: 15 }}>
              <span style={{ fontWeight: 700 }}>Product Total</span>
              <span style={{ fontWeight: 800, color: '#e8640a', fontSize: 17 }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ background: '#fff7ed', padding: '10px 14px', fontSize: 12, color: '#7c4a1e', borderTop: '1px solid #fed7aa' }}>
              <strong>Transport charges:</strong> To be confirmed — paid at delivery
            </div>
          </div>
        </>
      )}

      {/* Sticky Continue Button */}
      {items.length > 0 && (
        <div className="sticky-bottom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: '#71717a' }}>Product Total</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e8640a' }}>₹{totalAmount.toLocaleString('en-IN')}</div>
          </div>
          <button
            className="btn btn-primary"
            style={{ fontSize: 16, padding: '16px' }}
            disabled={!canCheckout}
            onClick={() => navigate('/checkout')}
          >
            {canCheckout ? (
              <>Continue to Checkout <ChevronRight size={18} /></>
            ) : !transport ? (
              <>Select Transport First 🚛</>
            ) : (
              <>Add items to cart</>
            )}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
