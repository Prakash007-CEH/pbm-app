// src/admin/pages/AdminLogin.jsx
import logo from '../../assets/logo.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill all fields');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Check admin role in both users and admins collections
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      const adminDoc = await getDoc(doc(db, 'admins', cred.user.uid));
      const isAdmin = (userDoc.exists() && userDoc.data().role === 'admin') || adminDoc.exists();
      if (!isAdmin) {
        await auth.signOut();
        toast.error('Access denied. Admin only.');
        navigate('/admin/login', { replace: true });
        return;
      }
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.code === 'auth/invalid-credential') toast.error('Invalid email or password');
      else toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #3f1a08 0%, #5a3312 50%, #7c4a1e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: 'white', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          <img src={logo} alt="Prakash Building Material" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
      </div>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>Admin Panel</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>Prakash Building Material</p>
      </div>

      <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <ShieldCheck size={20} color="#7c4a1e" />
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Admin Login</h2>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Admin Email</label>
            <input className="input" type="email" placeholder="admin@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8, background: 'linear-gradient(135deg, #7c4a1e, #5a3312)' }}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
