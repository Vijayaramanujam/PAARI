import React, { useState, useEffect } from 'react';
import api from './api';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import DonorPortal from './pages/DonorPortal';
import ReceiverPortal from './pages/ReceiverPortal';
import VolunteerPortal from './pages/VolunteerPortal';
import AdminPortal from './pages/AdminPortal';
import { LogOut, Bell, Shield, User, Landmark, HelpCircle, Heart } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('landing'); // 'landing', 'login', 'register', 'dashboard'
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auto load user context
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
      setPage('dashboard');
    }
  }, [token]);

  // Read notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // Poll notifications every 20s
      return () => clearInterval(interval);
    }
  }, [token]);

  // Listener for token expiration event from api.js
  useEffect(() => {
    const handleAuthExpired = () => {
      setToken('');
      setUser(null);
      setPage('login');
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const handleLoginSuccess = (userData) => {
    setToken(userData.token);
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setPage('landing');
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch(err) {
      console.error(err);
    }
  };

  const renderDashboardByRole = () => {
    if (!user) return null;
    switch(user.role) {
      case 'ADMIN':
        return <AdminPortal />;
      case 'DONOR':
        return <DonorPortal />;
      case 'RECEIVER':
        return <ReceiverPortal />;
      case 'VOLUNTEER':
        return <VolunteerPortal />;
      default:
        return <div style={{ padding: '40px', textAlignment: 'center' }}>Role dashboard not found.</div>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Global Navigation Bar */}
      <nav className="glass-panel" style={{ margin: '15px', padding: '15px 30px', position: 'sticky', top: '15px', zIndex: 90, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setPage(token ? 'dashboard' : 'landing')}>
          <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center' }}>
            <Heart size={20} fill="#fff" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', tracking: '-0.5px' }}>
            PAARI<span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', marginLeft: '4px' }}>Net</span>
          </span>
        </div>

        {/* Action center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {token && user ? (
            <>
              {/* User profile brief */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--border)', paddingRight: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                  <User size={16} color="var(--primary)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.username}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</span>
                </div>
              </div>

              {/* Notification bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex' }}
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent)', width: '8px', height: '8px', borderRadius: '50%' }}></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="glass-panel animated-fade" style={{ position: 'absolute', top: '35px', right: 0, width: '320px', padding: '16px', zIndex: 100, alignSelf: 'start', maxHeight: '400px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>Network Alerts ({notifications.filter(n => !n.read).length})</strong>
                      <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Close</button>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '10px 0' }}>No active notifications.</div>
                    ) : (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {notifications.map(n => (
                          <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px', opacity: n.read ? 0.6 : 1 }}>
                            <div>
                              <p style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>{n.message}</p>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            {!n.read && (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600' }}
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Log out */}
              <button
                onClick={handleLogout}
                className="glass-button-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPage('login')} className="glass-button-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Sign In
              </button>
              <button onClick={() => setPage('register')} className="glass-button" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Join PAARI
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Page Content Body */}
      <main style={{ flex: 1 }}>
        {page === 'landing' && <Landing onNavigate={setPage} />}
        {page === 'login' && <Auth onNavigate={setPage} onLoginSuccess={handleLoginSuccess} initialMode="login" />}
        {page === 'register' && <Auth onNavigate={setPage} onLoginSuccess={handleLoginSuccess} initialMode="register" />}
        {page === 'dashboard' && token && renderDashboardByRole()}
      </main>

      {/* Footer Info */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 15px', textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© 2026 PAARI Rescue Network. Backed by corporate sponsorship and local volunteer engines.</p>
      </footer>

    </div>
  );
}
