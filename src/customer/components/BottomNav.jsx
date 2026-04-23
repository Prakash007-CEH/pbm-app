// src/customer/components/BottomNav.jsx
import { NavLink } from 'react-router-dom';
import { Home, Package, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useCart } from '../../shared/hooks/useCart';

export default function BottomNav() {
  const { itemCount } = useCart();

  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/products" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
        <Package size={20} />
        <span>Products</span>
      </NavLink>
      <NavLink to="/cart" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
        <ShoppingCart size={20} />
        <span>Cart</span>
        {itemCount > 0 && <span className="nav-badge">{itemCount > 99 ? '99+' : itemCount}</span>}
      </NavLink>
      <NavLink to="/orders" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
        <ClipboardList size={20} />
        <span>Orders</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
