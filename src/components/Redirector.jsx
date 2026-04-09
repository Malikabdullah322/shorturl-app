import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Redirector = () => {
  const { code } = useParams();
  const navigationStarted = React.useRef(false);

  useEffect(() => {
    if (navigationStarted.current) return;
    
    // Redirects toport 3001 in development, 
    // Redirects to current origin in production
    const backendUrl = window.location.hostname === 'localhost'
      ? `http://localhost:3001/${code}`
      : `/${code}`;

    navigationStarted.current = true;
    window.location.href = backendUrl;
  }, [code]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
      <div style={{ width: '48px', height: '48px', border: '5px solid #FFF', borderBottomColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Redirecting you to the destination...</p>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Redirector;
