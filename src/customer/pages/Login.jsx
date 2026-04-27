// src/customer/pages/Login.jsx
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import logo from '../../assets/logo.png';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email || !password) return toast.error('Please fill all fields');
  const cleanEmail = email.toLowerCase().trim();
  const attemptRef = doc(db, "loginAttempts", cleanEmail);
  let attemptSnap = await getDoc(attemptRef);

  if (attemptSnap.exists()) {
    const data = attemptSnap.data();

    if (data.blockedUntil && Date.now() < data.blockedUntil) {
      const remaining = Math.ceil((data.blockedUntil - Date.now()) / 60000);
      return toast.error(`Account locked. Try again in ${remaining} min`);
    }
  }

  
  setLoading(true);
  try {
    await login(cleanEmail, password);
    await setDoc(attemptRef, {
    attempts: 0,
    blockedUntil: 0,
  });
  
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../../firebase/config');
    const { auth } = await import('../../firebase/config');
    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast.error('Login failed');
      return;
    }
      const snap = await getDoc(doc(db, 'users', uid));
      const role = snap.data()?.role;
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'customer') {
      navigate('/home');
    } else {
      toast.error('Account role not found');
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../../firebase/config');
      await signOut(auth);
    }
  } catch (err) {
    let newAttempts = 1;

   if (attemptSnap.exists()) {
     newAttempts = (attemptSnap.data().attempts || 0) + 1;
   }

   if (newAttempts >= 3) {
     await setDoc(attemptRef, {
       attempts: 0,
       blockedUntil: Date.now() + 10 * 60 * 1000,
     });

     toast.error('Too many failed attempts. Account locked for 10 minutes.');
   } else {
     await setDoc(attemptRef, {
       attempts: newAttempts,
       blockedUntil: 0,
     });

     toast.error(`Invalid email or password. ${3 - newAttempts} attempts left.`);
   }


  } finally {
    setLoading(false);
  }
};
  const handleForgotPassword = async () => {
  if (!email) {
    return toast.error('Enter your email first');
  }

  try {
    await sendPasswordResetEmail(auth, email);
    toast.success('Password reset email sent');
  } catch (err) {
    toast.error('Failed to send reset email');
  }
};

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8640a 0%, #7c4a1e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        <img src={logo} alt="Prakash Building Material" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
      </div>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Prakash Building Material</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>प्रकाश बिल्डिंग मटेरियल</p>
      </div>

      {/* Card */}
      <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 400, boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'right', marginTop: -6, marginBottom: 16 }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: 'none', border: 'none', color: '#e8640a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
          </div>

          <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Logging in...' : 'Login'}
          </button>
          
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#71717a' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#e8640a', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
