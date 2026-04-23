// src/utils/products.js
// ADD THIS — Merges Firestore prices into static product list

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
export const PRODUCTS = [
  {
    id: 'chambal-bajarfoot',
    name: 'Chambal (Bajarfoot)',
    hindiName: 'चंबल (बजरफुट)',
    category: 'sand',
    categoryLabel: 'Sand & Dust',
    description: 'High quality Chambal river sand, ideal for construction and plastering.',
    price: 48,
    unit: 'foot',
    unitLabel: 'फुट',
    available: true,
    emoji: '🏖️'
  },
  {
    id: 'cresher-dust',
    name: 'Cresher (Dust)',
    hindiName: 'क्रेशर (डस्ट)',
    category: 'sand',
    categoryLabel: 'Sand & Dust',
    description: 'Fine crusher dust, perfect for filling and leveling work.',
    price: 44,
    unit: 'foot',
    unitLabel: 'फुट',
    available: true,
    emoji: '🟤'
  },
  {
    id: 'gravel-0inch',
    name: 'Gravel (Rori) 0 inch',
    hindiName: 'गिट्टी (रोड़ी) 0 इंच',
    category: 'gravel',
    categoryLabel: 'Gravel',
    description: 'Fine 0 inch gravel (rori), suitable for concrete mixing.',
    price: 38,
    unit: 'foot',
    unitLabel: 'फुट',
    available: true,
    emoji: '⚫'
  },
  {
    id: 'gravel-half-inch',
    name: 'Gravel (Rori) 1/2 inch',
    hindiName: 'गिट्टी (रोड़ी) आधा इंच',
    category: 'gravel',
    categoryLabel: 'Gravel',
    description: '1/2 inch gravel (rori), ideal for RCC and structural work.',
    price: 50,
    unit: 'foot',
    unitLabel: 'फुट',
    available: true,
    emoji: '🪨'
  },
  {
    id: 'bangur-cement-normal',
    name: 'Bangur Cement Normal',
    hindiName: 'बांगर सीमेंट नॉर्मल',
    category: 'cement',
    categoryLabel: 'Cement',
    description: 'Bangur OPC Normal cement. Trusted brand for all construction needs.',
    price: 350,
    unit: 'bag',
    unitLabel: 'बैग',
    available: true,
    emoji: '🏗️'
  },
  {
    id: 'bangur-cement-43',
    name: 'Bangur Cement 43 Grade',
    hindiName: 'बांगर सीमेंट 43 ग्रेड',
    category: 'cement',
    categoryLabel: 'Cement',
    description: 'Bangur 43 Grade cement, premium quality for heavy-duty construction.',
    price: 370,
    unit: 'bag',
    unitLabel: 'बैग',
    available: true,
    emoji: '🏗️'
  },
  {
    id: 'saria-rebar',
    name: 'Saria (Rebar)',
    hindiName: 'सरिया (रिबार)',
    category: 'steel',
    categoryLabel: 'Steel',
    description: 'High tensile steel rebar (saria) for RCC construction.',
    price: 58,
    unit: 'kg',
    unitLabel: 'किलो',
    available: true,
    emoji: '🔩'
  },
  {
    id: 'pillor-ring',
    name: 'Pillor Ring',
    hindiName: 'पिलर रिंग',
    category: 'steel',
    categoryLabel: 'Steel',
    description: 'Steel pillor rings for column and beam construction.',
    price: 16,
    unit: 'piece',
    unitLabel: 'पीस',
    available: true,
    emoji: '⭕'
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All', hindiLabel: 'सभी' },
  { id: 'sand', label: 'Sand & Dust', hindiLabel: 'रेत & डस्ट' },
  { id: 'gravel', label: 'Gravel', hindiLabel: 'गिट्टी' },
  { id: 'cement', label: 'Cement', hindiLabel: 'सीमेंट' },
  { id: 'steel', label: 'Steel', hindiLabel: 'स्टील' }
];

export const TRANSPORT_OPTIONS = [
  { id: 'bellgadi', name: 'Bellgadi (Buggi)', hindiName: 'बेलगाड़ी (बग्गी)', description: 'Small cart for short distances' },
  { id: 'chhota-tractor', name: 'Chhota Tractor', hindiName: 'छोटा ट्रैक्टर', description: 'Small tractor for medium loads' },
  { id: 'bada-tractor', name: 'Bada Tractor', hindiName: 'बड़ा ट्रैक्टर', description: 'Large tractor for heavy loads' }
];

export const ORDER_STATUSES = [
  { id: 'placed', label: 'Placed', hindiLabel: 'रखा गया', color: '#f59e0b' },
  { id: 'confirmed', label: 'Confirmed', hindiLabel: 'पुष्टि हुई', color: '#3b82f6' },
  { id: 'preparing', label: 'Preparing', hindiLabel: 'तैयारी हो रही है', color: '#8b5cf6' },
  { id: 'out_for_delivery', label: 'Out for Delivery', hindiLabel: 'डिलीवरी पर निकला', color: '#06b6d4' },
  { id: 'delivered', label: 'Delivered', hindiLabel: 'डिलीवर हुआ', color: '#10b981' },
  { id: 'cancelled', label: 'Cancelled', hindiLabel: 'रद्द किया', color: '#ef4444' }
];

export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

export const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `PBM${dateStr}${random}`;
};

export async function fetchLiveProducts() {
  try {
    const snap = await getDocs(collection(db, 'products'));
    const dbMap = {};
    snap.docs.forEach(d => { dbMap[d.id] = d.data(); });
    return PRODUCTS.map(p => ({
      ...p,
      ...(dbMap[p.id] ? {
        price: dbMap[p.id].price ?? p.price,
        available: dbMap[p.id].available ?? p.available,
      } : {})
    }));
  } catch (error) {
    console.error('fetchLiveProducts failed:', error);
    return PRODUCTS; // Fallback to static if Firestore fails
  }
}