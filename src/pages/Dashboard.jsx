import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Search, Globe, Activity, Copy, ExternalLink, BarChart2, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, topLink: null });
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const fetchDashboardData = async () => {
    try {
      const url = selectedCountry ? `/dashboard-stats?country=${encodeURIComponent(selectedCountry)}` : '/dashboard-stats';
      const res = await axios.get(url);
      setLinks(res.data.links);
      setStats({
        totalLinks: res.data.totalLinks,
        totalClicks: res.data.totalClicks,
        topLink: res.data.topLink
      });
    } catch (err) {
      console.error("Dashboard failed to load:", err);
    }
  };

  const performDelete = async (id) => {
    try {
      await axios.delete(`/links/${id}`);
      setLinks(links.filter(l => l.id !== id));
      setStats(prev => ({ ...prev, totalLinks: prev.totalLinks - 1 }));
      toast.success("Link deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      const errMsg = err.response?.data?.error || "Failed to delete link";
      toast.error(errMsg);
    }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
          Delete this link permanently?
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(id);
            }}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              background: '#F1F5F9',
              color: '#64748B',
              border: '1px solid #E2E8F0',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      style: {
        borderRadius: '20px',
        padding: '16px',
        background: '#fff',
        border: '1px solid #E2E8F0',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
      }
    });
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get('/countries');
      setCountries(res.data.countries);
    } catch (err) {
      console.error("Failed to load countries:", err);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [selectedCountry]);

  const filteredLinks = links.filter(l => {
    const searchLower = search.toLowerCase();
    const fullShort = (window.location.host + '/' + l.shortCode).toLowerCase();
    return l.shortCode.toLowerCase().includes(searchLower) ||
      l.originalUrl.toLowerCase().includes(searchLower) ||
      fullShort.includes(searchLower);
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Link copied to clipboard!");
    });
  };

  return (
    <div className="container">
      <section style={{ margin: 'clamp(24px, 5vh, 48px) 0 32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h2>Dashboard</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Manage your shortened links and track their performance.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', width: window.innerWidth < 640 ? '100%' : 'auto' }}>
          <div style={{ position: 'relative', background: 'var(--white)', borderRadius: '14px', padding: '10px 16px 10px 44px', border: '1px solid var(--border)', flex: 1, minWidth: '200px' }}>
            <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit', fontSize: '15px', background: 'none' }}
            />
          </div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{ background: 'var(--white)', padding: '10px 16px', borderRadius: '14px', border: '1px solid var(--border)', fontFamily: 'inherit', fontWeight: 600, fontSize: '15px', cursor: 'pointer', height: '44px', flex: window.innerWidth < 640 ? '1' : 'none', minWidth: '150px', outline: 'none' }}
          >
            <option value="">🌍 All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </section>

      <div className="responsive-grid" style={{ marginBottom: '32px' }}>
        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '28px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Links</div>
          <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalLinks}</div>
        </div>
        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '28px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Clicks</div>
          <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalClicks.toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--white)', padding: '32px', borderRadius: '28px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--white)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Performing</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)', wordBreak: 'break-all' }}>
            {stats.topLink ? `${window.location.host}/${stats.topLink.shortCode}` : 'None'}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Short Link</th>
              <th style={{ textAlign: 'left', padding: '18px 32px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Original URL</th>
              <th style={{ textAlign: 'right', padding: '18px 32px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Clicks</th>
              <th style={{ textAlign: 'right', padding: '18px 32px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '18px 32px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLinks.length > 0 ? filteredLinks.map(link => {
              const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
              const fullShort = window.location.host + '/' + link.shortCode;
              return (
                <tr key={link.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <a href={`/${link.shortCode}`} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-main)', textDecoration: 'none' }}>{fullShort}</a>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '24px 32px' }}>
                    <div className="truncate" title={link.originalUrl}>
                      {link.originalUrl}
                    </div>
                  </td>
                  <td style={{ padding: '24px 32px', textAlign: 'right', fontWeight: 700 }}>{link.clicks.toLocaleString()}</td>
                  <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: isExpired ? '#FEE2E2' : '#DCFCE7',
                      color: isExpired ? '#991B1B' : '#166534'
                    }}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <Link to={`/stats?code=${link.shortCode}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', background: '#F8FAFC', color: '#64748B', border: '1px solid #F1F5F9', transition: 'all 0.2s' }} title="View Analytics">
                        <Activity size={18} />
                      </Link>
                      <button onClick={() => copyToClipboard(fullShort)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', background: '#F8FAFC', color: '#64748B', border: '1px solid #F1F5F9', cursor: 'pointer' }} title="Copy Link">
                        <Copy size={18} />
                      </button>
                      <a href={`/${link.shortCode}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', background: '#F8FAFC', color: '#64748B', border: '1px solid #F1F5F9' }} title="Open Link">
                        <ExternalLink size={18} />
                      </a>
                      <button onClick={() => handleDelete(link.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', cursor: 'pointer' }} title="Delete Link">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No links found. Try creating one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
