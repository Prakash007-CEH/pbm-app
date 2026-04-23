// src/customer/pages/Profile.jsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import BottomNav from '../components/BottomNav';
import { ArrowLeft, User, Phone, Mail, LogOut, ShieldCheck, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

export default function Profile() {
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    mobile: ''
  });

  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || '',
        mobile: userData.mobile || ''
      });
    }
  }, [userData]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('pbm_cart');
      localStorage.removeItem('pbm_transport');
      await logout();
      navigate('/login');
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  };
  const handleSave = async () => {
  if (!user?.uid) return toast.error('User not found');

  if (!form.name.trim())
    return toast.error('Enter full name');

  if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
    return toast.error('Enter valid Indian mobile number');
  }

  try {
    setSaving(true);

    await updateDoc(doc(db, 'users', user.uid), {
      name: form.name.trim(),
      mobile: form.mobile.trim()
    });

    toast.success('Profile updated successfully');
    setForm({
      name: form.name.trim(),
      mobile: form.mobile.trim()
    });

    window.location.reload(); // quick sync fix

    setEditMode(false);

  } catch (err) {

    toast.error('Failed to update profile');

  } finally {

    setSaving(false);

  }
};

  return (
  <div className="page">
    <div className="page-header">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
      </button>
      <h1>Profile / प्रोफाइल</h1>
    </div>

    {/* Avatar */}
    <div
      style={{
        background: 'linear-gradient(135deg, #e8640a, #7c4a1e)',
        padding: '28px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: 'rgba(255,255,255,0.25)',
          borderRadius: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <User size={32} color="white" />
      </div>

      <div>
        <div style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>
          {userData?.name || 'Customer'}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
          {userData?.role === 'admin' ? 'Admin Account' : 'Customer Account'}
        </div>
      </div>
    </div>

    {/* Info Cards */}
    <div style={{ padding: '16px 16px 0' }}>
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          marginBottom: 12,
          padding: 16
        }}
      >
        {!editMode ? (
          <>
            {[
              { icon: User, label: 'Full Name', value: userData?.name },
              { icon: Phone, label: 'Mobile', value: userData?.mobile },
              { icon: Mail, label: 'Email', value: user?.email },
              {
                icon: ShieldCheck,
                label: 'Role',
                value: userData?.role === 'admin' ? 'Admin' : 'Customer'
              }
            ].map(({ icon: Icon, label, value }, i, arr) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #f4f4f5' : 'none'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    background: '#fef3eb',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={16} color="#e8640a" />
                </div>

                <div>
                  <div style={{ fontSize: 11, color: '#71717a', fontWeight: 500 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>
                    {value || '-'}
                  </div>
                </div>
              </div>
            ))}

            <button
              className="btn btn-secondary"
              onClick={() => setEditMode(true)}
              style={{ marginTop: 12, width: '100%' }}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Full Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value
                  }))
                }
                placeholder="Enter full name"
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">Mobile Number</label>
              <input
                className="input"
                type="tel"
                value={form.mobile}
                maxLength={10}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mobile: e.target.value.replace(/\D/g, '').slice(0, 10)
                  }))
                }
                placeholder="Enter 10-digit mobile number"
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">Email</label>
              <input className="input" value={user?.email || ''} disabled />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">Role</label>
              <input
                className="input"
                value={userData?.role === 'admin' ? 'Admin' : 'Customer'}
                disabled
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setEditMode(false)}
                style={{ flex: 1 }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSave}
                style={{ flex: 1 }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>

      <button
        className="btn btn-secondary"
        onClick={() => navigate('/orders')}
        style={{ marginBottom: 12 }}
      >
        <Package size={16} /> My Orders
      </button>

      <button className="btn btn-danger" onClick={handleLogout}>
        <LogOut size={16} /> Logout
      </button>
    </div>

   <BottomNav />
</div>
);
}