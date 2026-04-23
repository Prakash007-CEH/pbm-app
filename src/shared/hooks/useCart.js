// src/shared/hooks/useCart.js
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pbm_cart') || '[]');
    } catch { return []; }
  });
  const [transport, setTransport] = useState(() => {
    return localStorage.getItem('pbm_transport') || '';
  });

  useEffect(() => {
    localStorage.setItem('pbm_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('pbm_transport', transport);
  }, [transport]);

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...product, qty }];
    });
  };

  const updateQty = (productId, qty) => {
    const parsed = parseInt(qty);
    if (isNaN(parsed) || parsed <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, qty: parsed } : i));
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setTransport('');
  };

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, transport, setTransport,
      addItem, updateQty, removeItem, clearCart,
      totalAmount, itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
