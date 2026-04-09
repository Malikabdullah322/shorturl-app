import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Link as LinkIcon, Calendar, ArrowRight, Check, Copy } from 'lucide-react';

const Home = () => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiry, setExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.host + '/');
  }, []);

  const handleShorten = async () => {
    if (!url) return;
    
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
    if (!urlPattern.test(url)) {
      setError('Please enter a valid URL (e.g., example.com)');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/shorten', {
        url,
        customAlias,
        expiresAt: expiry || null
      });
      if (response.data.link) {
        setResult(response.data.link);
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to shorten.'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const fullUrl = window.location.origin + '/' + result.shortCode;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="container">
      <section style={{ textAlign: 'center', margin: 'clamp(40px, 10vh, 80px) 0 40px' }}>
        <h1>Shorten. Share. Track.</h1>
        <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Create short, memorable links in seconds. Track clicks, geographic data, and set expiration dates for complete control.
        </p>
      </section>

      <div style={{ background: 'var(--white)', padding: 'clamp(20px, 4vw, 32px)', borderRadius: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--input-bg)',
          border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
          borderRadius: '24px',
          padding: '8px',
          flexWrap: 'wrap',
          gap: '8px',
          transition: 'border-color 0.2s'
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '16px', minWidth: '250px' }}>
            <LinkIcon size={20} color={error ? 'var(--error)' : 'var(--text-muted)'} style={{ marginRight: '16px' }} />
            <input
              type="text"
              placeholder="Paste your long URL here..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              style={{ flex: 1, border: 'none', background: 'none', fontSize: '18px', outline: 'none', color: 'var(--text-main)', fontFamily: 'inherit' }}
            />
          </div>
          <button
            onClick={handleShorten}
            disabled={loading}
            style={{
              background: url ? 'var(--accent)' : 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '18px',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1,
              width: window.innerWidth < 640 ? '100%' : 'auto',
              flex: window.innerWidth < 640 ? '1px 1 100%' : 'none'
            }}
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        {error && (
          <div style={{ color: 'var(--error)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', marginTop: '-12px' }}>
            <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--error)', color: 'white', textAlign: 'center', lineHeight: '16px', fontSize: '12px' }}>!</span> 
            {error}
          </div>
        )}

        {result && (
          <div className="animate-slide-up" style={{ marginTop: '24px', background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '24px', borderRadius: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0369A1', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} strokeWidth={3} />
              Link created successfully!
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E0F2FE', flexWrap: 'wrap', gap: '12px' }}>
              <a href={`/${result.shortCode}`} target="_blank" rel="noreferrer" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', wordBreak: 'break-all' }}>
                {window.location.host + '/' + result.shortCode}
              </a>
              <button
                onClick={copyToClipboard}
                style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <Link to={`/stats?code=${result.shortCode}`} style={{ display: 'block', marginTop: '16px', color: '#0369A1', fontSize: '14px', fontWeight: 600, textDecoration: 'none', textAlign: 'right' }}>
              View Analytics →
            </Link>
          </div>
        )}
      </div>

      <div className="responsive-grid" style={{ marginTop: '24px' }}>
        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LinkIcon size={18} color="var(--text-muted)" />
            <div style={{ fontSize: '18px', fontWeight: 700 }}>Custom Alias</div>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Create a memorable, branded link.</div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 16px', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '15px' }}>{baseUrl}</div>
            <input
              type="text"
              placeholder="my-custom-name"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: 500, flex: 1, minWidth: '120px' }}
            />
          </div>
        </div>

        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <div style={{ fontSize: '18px', fontWeight: 700 }}>Expiration Date</div>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Link will automatically expire on this date.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>
            <Calendar size={16} />
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', color: 'var(--text-main)', width: '100%' }}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
