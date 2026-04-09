import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Copy, Check, MousePointer2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code');

  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) {
      navigate('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get(`/stats/${code}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
    };

    fetchStats();
  }, [code, navigate]);

  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading analytics...</div>;

  const copyToClipboard = () => {
    const fullUrl = window.location.host + '/' + data.shortCode;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Chart Data Preparation
  const lineChartData = {
    labels: Object.keys(data.dateStats).map(l => {
      const d = new Date(l);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Clicks',
      data: Object.values(data.dateStats),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
    }]
  };

  const doughnutData = {
    labels: Object.keys(data.countryStats),
    datasets: [{
      data: Object.values(data.countryStats),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="container" style={{ paddingTop: '48px' }}>
      <header style={{ marginBottom: '40px', background: 'none', border: 'none', position: 'static', padding: 0 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 700, fontSize: '14px', padding: '12px 24px', background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--border)', width: 'fit-content', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s' }}>
          <ChevronLeft size={18} strokeWidth={3} />
          Back to Dashboard
        </Link>
      </header>

      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Total Clicks</div>
          <div style={{ fontSize: '56px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '16px' }}>
             <MousePointer2 size={40} color="var(--accent)" strokeWidth={2.5} />
             {data.totalClicks.toLocaleString()}
          </div>
        </div>
        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Viewing Analytics For</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', wordBreak: 'break-all' }}>{window.location.host + '/' + data.shortCode}</div>
              <button 
                onClick={copyToClipboard}
                style={{ background: '#EFF6FF', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              >
                {copied ? <Check size={20} color="#22C55E" strokeWidth={3} /> : <Copy size={20} strokeWidth={2.5} />}
              </button>
            </div>
            <div style={{ fontSize: '15px', color: 'var(--text-muted)', wordBreak: 'break-all', fontWeight: 500 }}>{data.originalUrl}</div>
          </div>
        </div>
      </div>

      <div className="responsive-grid" style={{ marginBottom: '40px' }}>
        <div style={{ background: 'var(--white)', borderRadius: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)', padding: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>Traffic Trend</div>
          <div style={{ height: '320px' }}>
            <Line 
              data={lineChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                  y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { stepSize: 1, font: { weight: '600' } } },
                  x: { grid: { display: false }, ticks: { font: { weight: '600' } } }
                }
              }} 
            />
          </div>
        </div>
        <div style={{ background: 'var(--white)', borderRadius: '32px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', width: '100%' }}>City/Country</div>
          <div style={{ height: '320px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Object.keys(data.countryStats).length > 0 ? (
              <Doughnut 
                data={doughnutData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  cutout: '75%', 
                  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: 'Outfit', size: 12, weight: '600' } } } } 
                }} 
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No geographic data yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Recent Activity</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Timestamp</th>
              <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Country</th>
              <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Platform</th>
              <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {data.clicks.length > 0 ? data.clicks.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 32px' }}>{new Date(c.timestamp).toLocaleString()}</td>
                <td style={{ padding: '16px 32px' }}>
                  <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, background: '#E0F2FE', color: '#0369A1' }}>
                    {c.country || 'Unknown'}
                  </span>
                </td>
                <td style={{ padding: '16px 32px' }}>{[c.browser, c.os].filter(Boolean).join(' / ') || 'Unknown'}</td>
                <td style={{ padding: '16px 32px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{c.ip || '—'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No click data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
