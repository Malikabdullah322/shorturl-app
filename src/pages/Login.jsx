import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'var(--white)', padding: '48px', borderRadius: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ background: 'var(--input-bg)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent)' }}>
            <LogIn size={32} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Login to manage your premium links.</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C', padding: '16px', borderRadius: '16px', marginBottom: '24px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #FEE2E2' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '4px' }}>Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{ width: '100%', padding: '14px 16px 14px 52px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '16px', fontSize: '16px', outline: 'none', fontFamily: 'inherit', fontWeight: 500 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '4px' }}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '14px 16px 14px 52px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '16px', fontSize: '16px', outline: 'none', fontFamily: 'inherit', fontWeight: 500 }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', background: 'var(--accent)', color: 'white', padding: '16px', borderRadius: '18px', border: 'none', fontSize: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)', transition: 'all 0.2s', marginTop: '10px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Entering...' : 'Login to Dashboard'}
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Register Now</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
