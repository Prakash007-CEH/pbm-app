// src/customer/pages/Signup.jsx
import logo from '../../assets/logo.png';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.email || !form.password) return toast.error('Please fill all fields');
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) return toast.error('Enter valid Indian mobile number');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) {
      return toast.error('Password must include uppercase, lowercase and number');
    }
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created!');
      navigate('/home');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') toast.error('Email already registered');
      else toast.error('Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8640a 0%, #7c4a1e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: 'white', borderRadius: 14, display: 'flex',
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          
          <img
            src={logo}
            alt="Logo"
            style={{ width: '80%', height: '80%', objectFit: 'contain' }}
          />

      </div>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>Prakash Building Material</h1>
      </div>

      <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 400, boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name / पूरा नाम</label>
            <input className="input" placeholder="Your full name" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="label">Mobile Number / मोबाइल</label>
            <input
              className="input"
              type="tel"
              placeholder="10-digit mobile number"
              value={form.mobile}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#71717a' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#e8640a', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
