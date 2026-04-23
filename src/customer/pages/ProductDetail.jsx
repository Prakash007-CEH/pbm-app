// src/customer/pages/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLiveProducts, formatPrice } from '../../utils/products';
import { useCart } from '../../shared/hooks/useCart';
import BottomNav from '../components/BottomNav';
import { ArrowLeft, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchLiveProducts().then(all => {
      setProduct(all.find(p => p.id === id) || null);
    });
  }, [id]);

  if (!product) {
    return (
      <div className="page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
          <h1>Product Not Found</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <div className="empty-state-title">Product not found</div>
          <button className="btn btn-primary" style={{ margin: '0 16px' }} onClick={() => navigate('/products')}>Back to Products</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleQtyChange = (val) => {
    const n = parseInt(val);
    if (val === '' || val === '0') { setQty(''); return; }
    if (!isNaN(n) && n > 0) setQty(n);
  };

  const handleAdd = () => {
    const q = parseInt(qty) || 1;
    if (q <= 0) return toast.error('Enter valid quantity');
    addItem(product, q);
    setAdded(true);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  const inCart = items.find(i => i.id === product.id);
  const subtotal = (parseInt(qty) || 0) * product.price;

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <h1>Product Detail</h1>
        <button onClick={() => navigate('/cart')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
          <ShoppingCart size={16} /> Cart
        </button>
      </div>

      {/* Product Image Area */}
      <div style={{ background: '#fef3eb', padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 80 }}>{product.emoji}</div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Name & Category */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-orange">{product.categoryLabel}</span>
          <span className={`badge ${product.available ? 'badge-green' : 'badge-red'}`}>
            {product.available ? '✓ Available' : '✗ Not Available'}
          </span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{product.name}</h2>
        <div style={{ fontSize: 16, color: '#7c4a1e', fontWeight: 600, marginBottom: 12 }}>{product.hindiName}</div>
        <div style={{ fontSize: 14, color: '#71717a', lineHeight: 1.6, marginBottom: 20 }}>{product.description}</div>

        {/* Price */}
        <div style={{ background: '#fef3eb', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#7c4a1e', fontWeight: 600 }}>Unit Price</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#e8640a' }}>₹{product.price}</div>
            <div style={{ fontSize: 13, color: '#7c4a1e' }}>per {product.unit} ({product.unitLabel})</div>
          </div>
          {subtotal > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#7c4a1e', fontWeight: 600 }}>Subtotal</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#7c4a1e' }}>₹{subtotal.toLocaleString('en-IN')}</div>
            </div>
          )}
        </div>

        {/* Quantity Section */}
        <div style={{ marginBottom: 20 }}>
          <label className="label" style={{ fontSize: 15 }}>Quantity / मात्रा</label>
          <p style={{ fontSize: 12, color: '#71717a', marginBottom: 10 }}>
            Type quantity directly or use +/- buttons. Example: 100 {product.unit}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="qty-control" style={{ flex: 1 }}>
              <button className="qty-btn" onClick={() => handleQtyChange(Math.max(1, (parseInt(qty) || 1) - 1))}>
                <Minus size={16} />
              </button>
              <input
                className="qty-input"
                style={{ flex: 1, width: 'auto' }}
                type="number"
                min="1"
                value={qty}
                onChange={e => handleQtyChange(e.target.value)}
                onBlur={() => { if (!qty || parseInt(qty) <= 0) setQty(1); }}
              />
              <button className="qty-btn" onClick={() => handleQtyChange((parseInt(qty) || 0) + 1)}>
                <Plus size={16} />
              </button>
            </div>
            <div style={{ fontSize: 14, color: '#71717a', fontWeight: 600, minWidth: 40 }}>
              {product.unitLabel}
            </div>
          </div>

          {/* Quick quantity buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {[10, 25, 50, 100, 200].map(q => (
              <button key={q} onClick={() => setQty(q)}
                style={{ padding: '6px 12px', background: qty === q ? '#e8640a' : '#f4f4f5', color: qty === q ? 'white' : '#3f3f46', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {q}
              </button>
            ))}
          </div>
        </div>

        {inCart && (
          <div style={{ background: '#dcfce7', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={14} /> Already in cart ({inCart.qty} {product.unit})
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={!product.available || !qty || parseInt(qty) <= 0}
          style={{ fontSize: 16, padding: '16px' }}
        >
          {added ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart / कार्ट में जोड़ें</>}
        </button>

        {inCart && (
          <button className="btn btn-secondary" onClick={() => navigate('/cart')} style={{ marginTop: 10 }}>
            View Cart <ShoppingCart size={16} />
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
