// src/customer/pages/Home.jsx
import logo from '../../assets/logo.png';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useCart } from '../../shared/hooks/useCart';
import { CATEGORIES, fetchLiveProducts } from '../../utils/products';
import BottomNav from '../components/BottomNav';
import { Package, ShoppingCart, ClipboardList, MessageCircle, ChevronRight, Truck } from 'lucide-react';

export default function Home() {
  const { userData } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const waNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '919999999999';
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
  fetchLiveProducts().then(all =>
    setFeatured(all.filter(p => p.available).slice(0, 4))
  );
  }, []);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #e8640a 0%, #7c4a1e 100%)', padding: '20px 16px 80px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <img src={logo} alt="PBM" style={{ width: 28, height: 28, objectFit: 'contain' }} />
              <div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Welcome back,</div>
                <div style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>{userData?.name || 'Customer'}</div>
              </div>
            </div>
          </div>
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
            style={{ background: '#25d366', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginTop: 16, lineHeight: 1.2 }}>
          Quality Building<br />Materials, Delivered
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 6 }}>उच्च गुणवत्ता की निर्माण सामग्री</p>
      </div>

      {/* Quick Actions Card */}
      <div style={{ margin: '0 16px', marginTop: -40, position: 'relative', zIndex: 10 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <button onClick={() => navigate('/products')} style={{ background: '#fef3eb', borderRadius: 12, padding: '14px 8px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Package size={22} color="#e8640a" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#7c4a1e' }}>Products</span>
            </button>
            <button onClick={() => navigate('/cart')} style={{ background: '#fef3eb', borderRadius: 12, padding: '14px 8px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
              <ShoppingCart size={22} color="#e8640a" />
              {itemCount > 0 && <span style={{ position: 'absolute', top: 8, right: 20, background: '#e8640a', color: 'white', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{itemCount}</span>}
              <span style={{ fontSize: 11, fontWeight: 600, color: '#7c4a1e' }}>Cart</span>
            </button>
            <button onClick={() => navigate('/orders')} style={{ background: '#fef3eb', borderRadius: 12, padding: '14px 8px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <ClipboardList size={22} color="#e8640a" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#7c4a1e' }}>Orders</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transport Notice */}
      <div className="transport-notice" style={{ margin: '16px 16px 0' }}>
        <div className="transport-notice-title"><Truck size={14} /> Transport Charges Info</div>
        <div className="transport-notice-text">Transport charges depend on distance and are paid separately at delivery. ट्रांसपोर्ट चार्ज अलग से देय।</div>
      </div>

      {/* Categories */}
      <div className="section-title">Categories / श्रेणियाँ</div>
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
          <button key={cat.id} onClick={() => navigate(`/products?cat=${cat.id}`)}
            style={{ flexShrink: 0, background: 'white', border: '1.5px solid #e4e4e7', borderRadius: 12, padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#3f3f46', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Products */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px' }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>Featured Products</span>
        <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: '#e8640a', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>All <ChevronRight size={14} /></button>
      </div>

      {featured.map(p => (
        <div key={p.id} className="product-card" onClick={() => navigate(`/products/${p.id}`)}>
          <div style={{ width: 52, height: 52, background: '#fef3eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            {p.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
            <div style={{ fontSize: 12, color: '#71717a' }}>{p.hindiName}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#e8640a' }}>₹{p.price}</div>
            <div style={{ fontSize: 11, color: '#71717a' }}>per {p.unit}</div>
          </div>
        </div>
      ))}

      <div style={{ height: 16 }} />
      <BottomNav />
    </div>
  );
}
