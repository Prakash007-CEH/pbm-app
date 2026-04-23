// src/customer/pages/ProductList.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES, formatPrice, fetchLiveProducts } from '../../utils/products';
import BottomNav from '../components/BottomNav';
import { Search, X, ChevronRight } from 'lucide-react';

export default function ProductList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  useEffect(() => {
  fetchLiveProducts().then(setProducts);
}, []);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.hindiName.includes(q) || p.category.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'white' }}>PBM</span>
        </div>
        <h1>Products / उत्पाद</h1>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#71717a" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, paddingRight: search ? 36 : 12 }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} color="#71717a" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: activeCategory === cat.id ? '#e8640a' : 'white',
              color: activeCategory === cat.id ? 'white' : '#3f3f46',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No products found</div>
          <div className="empty-state-text">Try a different search or category</div>
        </div>
      ) : (
        filtered.map(p => (
          <div key={p.id} className="product-card" onClick={() => navigate(`/products/${p.id}`)}>
            <div style={{ width: 56, height: 56, background: '#fef3eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
              {p.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>{p.hindiName}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className={`badge ${p.available ? 'badge-green' : 'badge-red'}`}>
                  {p.available ? 'Available' : 'Not Available'}
                </span>
                <span className="badge badge-orange">{p.categoryLabel}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#e8640a' }}>₹{p.price}</div>
              <div style={{ fontSize: 11, color: '#71717a' }}>per {p.unit}</div>
              <ChevronRight size={14} color="#e8640a" />
            </div>
          </div>
        ))
      )}

      <BottomNav />
    </div>
  );
}
