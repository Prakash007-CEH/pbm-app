// src/admin/pages/AdminProducts.jsx
import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { PRODUCTS } from '../../utils/products';
import AdminLayout from '../components/AdminLayout';
import { Edit2, Check, X, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [dbProducts, setDbProducts] = useState({});
  const [editing, setEditing] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Seed products to Firestore if not present
  const seedProducts = async () => {
  setSaving(true);
  try {
    let created = 0;
    let skipped = 0;
    for (const p of PRODUCTS) {
      const ref = doc(db, 'products', p.id);
      const existing = await getDoc(ref);
      if (!existing.exists()) {
        // Product missing from Firestore — create from static seed
        await setDoc(ref, { ...p, updatedAt: serverTimestamp() });
        created++;
      } else {
        // Product already exists — skip entirely, preserve all Firestore values
        skipped++;
      }
    }
    toast.success(`Done! ${created} added, ${skipped} already exist (preserved).`);
  } catch (err) {
    toast.error('Sync failed');
  } finally {
    setSaving(false);
  }
};


  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), snap => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = d.data(); });
      setDbProducts(map);
      setLoading(false);
    });
    return unsub;
  }, []);

  const mergedProducts = PRODUCTS.map(p => ({
    ...p,
    ...(dbProducts[p.id] || {}),
  }));

  const startEdit = (product) => {
    setEditing(product.id);
    setEditPrice(String(product.price));
  };

  const cancelEdit = () => { setEditing(null); setEditPrice(''); };

  const savePrice = async (productId) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) return toast.error('Enter valid price');
    setSaving(true);
    try {
      await setDoc(doc(db, 'products', productId), { price, updatedAt: serverTimestamp() }, { merge: true });
      toast.success('Price updated!');
      setEditing(null);
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (productId, current) => {
  try {
    await setDoc(
      doc(db, 'products', productId),
      { available: !current, updatedAt: serverTimestamp() },
      { merge: true }
    );
    toast.success(`Product ${!current ? 'enabled' : 'disabled'}`);
  } catch {
    toast.error('Update failed');
  }
};
  

  return (
    <AdminLayout title="Products">
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#71717a' }}>{mergedProducts.length} products</span>
          <button onClick={seedProducts} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef3eb', border: '1px solid #e8640a', color: '#e8640a', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            <RefreshCw size={14} /> Sync to DB
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          mergedProducts.map(product => (
            <div key={product.id} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, background: '#fef3eb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {product.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>{product.hindiName} • per {product.unit}</div>

                  {/* Price Edit */}
                  {editing === product.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                        <span style={{ fontSize: 18, fontWeight: 700 }}>₹</span>
                        <input
                          className="input"
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          style={{ padding: '8px 10px', fontSize: 15 }}
                          autoFocus
                        />
                      </div>
                      <button onClick={() => savePrice(product.id)} disabled={saving}
                        style={{ width: 36, height: 36, background: '#dcfce7', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={16} color="#16a34a" />
                      </button>
                      <button onClick={cancelEdit}
                        style={{ width: 36, height: 36, background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={16} color="#dc2626" />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#e8640a' }}>₹{product.price}</span>
                      <span style={{ fontSize: 12, color: '#71717a' }}>per {product.unit}</span>
                      <button onClick={() => startEdit(product)}
                        style={{ background: '#fef3eb', border: '1px solid #fed7aa', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#e8640a', fontWeight: 600 }}>
                        <Edit2 size={12} /> Edit
                      </button>
                    </div>
                  )}

                  {/* Availability Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => toggleAvailability(product.id, product.available)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: product.available ? '#dcfce7' : '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: product.available ? '#16a34a' : '#dc2626' }}>
                      {product.available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {product.available ? 'Available' : 'Disabled'}
                    </button>
                    <span className={`badge ${product.available ? 'badge-green' : 'badge-red'}`}>
                      {product.available ? '✓ Live' : '✗ Hidden'}
                    </span>
                  </div>
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
