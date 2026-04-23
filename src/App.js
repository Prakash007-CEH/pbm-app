// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './shared/hooks/useAuth';
import { CartProvider } from './shared/hooks/useCart';
import { CustomerRoute, AdminRoute, GuestRoute } from './shared/components/ProtectedRoute';

// Customer Pages
import Login from './customer/pages/Login';
import Signup from './customer/pages/Signup';
import Home from './customer/pages/Home';
import ProductList from './customer/pages/ProductList';
import ProductDetail from './customer/pages/ProductDetail';
import Cart from './customer/pages/Cart';
import Checkout from './customer/pages/Checkout';
import Orders from './customer/pages/Orders';
import OrderDetail from './customer/pages/OrderDetail';
import Profile from './customer/pages/Profile';

// Admin Pages
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminOrders from './admin/pages/AdminOrders';
import AdminOrderDetail from './admin/pages/AdminOrderDetail';
import AdminCustomers from './admin/pages/AdminCustomers';
import AdminProducts from './admin/pages/AdminProducts';

import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: 'Poppins, sans-serif', fontSize: 14, maxWidth: 380 },
              success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
              error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
            }}
          />
          <Routes>
            {/* Root redirect */}
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            {/* Customer Auth */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

            {/* Customer App */}
            <Route path="/home" element={<CustomerRoute><Home /></CustomerRoute>} />
            <Route path="/products" element={<CustomerRoute><ProductList /></CustomerRoute>} />
            <Route path="/products/:id" element={<CustomerRoute><ProductDetail /></CustomerRoute>} />
            <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
            <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
            <Route path="/orders" element={<CustomerRoute><Orders /></CustomerRoute>} />
            <Route path="/orders/:id" element={<CustomerRoute><OrderDetail /></CustomerRoute>} />
            <Route path="/profile" element={<CustomerRoute><Profile /></CustomerRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} /> 
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
