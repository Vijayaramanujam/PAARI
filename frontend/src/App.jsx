import React, { useState, useEffect } from 'react';
import api from './api';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import DonorPortal from './pages/DonorPortal';
import ReceiverPortal from './pages/ReceiverPortal';
import VolunteerPortal from './pages/VolunteerPortal';
import AdminPortal from './pages/AdminPortal';
import DataInspector from './pages/DataInspector';
import Chatbot from './components/Chatbot';
import { useLanguage } from './context/LanguageContext';
import { LogOut, Bell, Shield, User, Landmark, HelpCircle, Heart, Globe, Database } from 'lucide-react';

// Stable Module-Level Error Boundary to prevent component remounting
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Component caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '640px', margin: '40px auto' }} className="glass-panel">
          <h3 style={{ color: '#DC2626', marginBottom: '12px', fontWeight: '800', fontSize: '1.4rem' }}>Portal Display Notice</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
            {this.state.error?.message || 'A display issue occurred while rendering this view.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="glass-button"
              style={{ padding: '10px 22px', fontSize: '0.9rem' }}
            >
              Reload Page
            </button>
            <button 
              onClick={() => {
                if (this.props.onLogout) this.props.onLogout();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              }}
              className="glass-button-secondary"
              style={{ padding: '10px 22px', fontSize: '0.9rem' }}
            >
              Sign Out & Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
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
    let content;
    switch(user.role) {
      case 'ADMIN':
        content = <AdminPortal />;
        break;
      case 'DONOR':
        content = <DonorPortal />;
        break;
      case 'RECEIVER':
        content = <ReceiverPortal />;
        break;
      case 'VOLUNTEER':
        content = <VolunteerPortal />;
        break;
      default:
        content = <div style={{ padding: '40px', textAlign: 'center' }}>Role dashboard not found.</div>;
        break;
    }
    return <ErrorBoundary key={user.role} onLogout={handleLogout}>{content}</ErrorBoundary>;
  };

  // Scroll detection for navbar blur and shadow
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)' }}>
      
      {/* Section A: Premium Floating Navigation Bar */}
      <nav
        className="glass-panel"
        style={{
          margin: isScrolled ? '8px 16px' : '14px 24px',
          padding: isScrolled ? '12px 28px' : '16px 32px',
          position: 'sticky',
          top: '10px',
          zIndex: 90,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '99px',
          background: isScrolled ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          boxShadow: isScrolled
            ? '0 16px 36px rgba(16, 61, 48, 0.09), 0 2px 6px rgba(16, 61, 48, 0.04)'
            : '0 8px 24px rgba(16, 61, 48, 0.04)',
          border: '1.5px solid var(--border)',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Brand Identity */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0, marginRight: '16px' }}
          onClick={() => setPage(token ? 'dashboard' : 'landing')}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-rich) 100%)',
              padding: '7px',
              borderRadius: '12px',
              color: '#fff',
              display: 'flex',
              boxShadow: '0 4px 12px rgba(16, 61, 48, 0.2)'
            }}
          >
            <Heart size={20} fill="#fff" />
          </div>
          <span style={{ fontSize: '1.45rem', fontWeight: '900', letterSpacing: '-0.02em', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
            {t('brandTitle')}<span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: '800', marginLeft: '6px' }}>{t('brandSubtitle')}</span>
          </span>
        </div>

        {/* Center Editorial Links (Visible on Landing Page) */}
        {page === 'landing' && (
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              padding: '4px 12px',
              background: 'rgba(255, 255, 255, 0.72)',
              borderRadius: '99px',
              border: '1px solid rgba(16, 61, 48, 0.08)',
              boxShadow: '0 2px 8px rgba(16, 61, 48, 0.03)'
            }}
            className="editorial-nav-links"
          >
            <a href="#hero-section" className="nav-pill-link">
              {t('navHome')}
            </a>
            <a href="#journey-section" className="nav-pill-link">
              {t('navJourney')}
            </a>
            <a href="#impact-section" className="nav-pill-link">
              {t('navImpact')}
            </a>
            <a href="#roles-section" className="nav-pill-link">
              {t('navDonors')}
            </a>
            <a href="#roles-section" className="nav-pill-link">
              {t('navNGOs')}
            </a>
          </div>
        )}

        {/* Action center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          
          {/* Language Switcher Button */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.04)', borderRadius: '20px', padding: '3px 4px', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setLanguage('en')}
              style={{
                background: language === 'en' ? 'var(--primary)' : 'transparent',
                color: language === 'en' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              style={{
                background: language === 'ta' ? 'var(--primary)' : 'transparent',
                color: language === 'ta' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              தமிழ்
            </button>
          </div>

          {/* Backend Live Data Inspector Button */}
          <button
            onClick={() => setPage(page === 'inspector' ? (token ? 'dashboard' : 'landing') : 'inspector')}
            className={page === 'inspector' ? 'glass-button' : 'glass-button-secondary'}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: page === 'inspector' ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              background: page === 'inspector' ? '#FAF6EE' : 'transparent',
              color: page === 'inspector' ? 'var(--primary)' : 'inherit'
            }}
            title="Inspect backend database tables, persistence, and SQL console"
          >
            <Database size={14} color="#D97706" />
            <span>{page === 'inspector' ? '← ' + (t('navDashboard') || 'Back') : t('navDataInspector')}</span>
          </button>

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
                      <strong style={{ fontSize: '0.9rem' }}>{t('navAlerts')} ({notifications.filter(n => !n.read).length})</strong>
                      <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>{t('navClose')}</button>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '10px 0' }}>{t('navNoAlerts')}</div>
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
                                {t('navDismiss')}
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
                {t('navSignOut')}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setPage('login')} className="glass-button-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                {t('navSignIn')}
              </button>
              <button onClick={() => setPage('register')} className="glass-button" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                {t('navJoin')}
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
        {page === 'inspector' && <DataInspector />}
        {page === 'dashboard' && token && renderDashboardByRole()}
      </main>

      {/* Section I: Comprehensive Food Rescue Editorial Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          background: '#FAF6EE',
          padding: '60px 24px 30px 24px',
          marginTop: '80px',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '50px' }}>
            
            {/* Col 1: Brand & Philosophy */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '10px', color: '#fff', display: 'flex' }}>
                  <Heart size={18} fill="#fff" />
                </div>
                <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--primary)' }}>
                  {t('brandTitle')}<span style={{ color: 'var(--accent)', fontSize: '0.85rem', marginLeft: '3px' }}>{t('brandSubtitle')}</span>
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: '1.65', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {language === 'ta'
                  ? 'பாரி என்பது தொழில்முறை உபரி உணவு மறுபகிர்வு தளம். ஹோட்டல்கள், பேக்கரிகள் மற்றும் சமையலறைகளின் உணவை காப்பகங்களோடு இணைக்கிறது.'
                  : 'PAARI Net is a professional surplus food rescue network. Connecting chef-grade commercial surplus with shelter homes through intelligent distance matching.'}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800' }}>
                🌱 Sustainable Development Goal #2: Zero Hunger
              </div>
            </div>

            {/* Col 2: The Journey Links */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Platform Journey
              </h4>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '10px', fontSize: '0.88rem' }}>
                <li><a href="#hero-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('navHome')}</a></li>
                <li><a href="#journey-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('navJourney')}</a></li>
                <li><a href="#problem-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>The Food Paradox</a></li>
                <li><a href="#network-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Topological Network</a></li>
                <li><a href="#impact-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('navImpact')}</a></li>
              </ul>
            </div>

            {/* Col 3: Ecosystem Roles */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Ecosystem
              </h4>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '10px', fontSize: '0.88rem' }}>
                <li><a href="#roles-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('navDonors')}</a></li>
                <li><a href="#roles-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('navNGOs')}</a></li>
                <li><a href="#roles-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Thermal Food Couriers</a></li>
                <li><button onClick={() => setPage('inspector')} style={{ background: 'none', border: 'none', color: '#D97706', cursor: 'pointer', padding: 0, fontSize: '0.88rem', fontWeight: '700' }}>🔍 Database Inspector (DB)</button></li>
              </ul>
            </div>

            {/* Col 4: King Paari Sangam Heritage */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Our Heritage
              </h4>
              <p style={{ fontSize: '0.84rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                {language === 'ta'
                  ? 'முல்லைக்குத் தேர் கொடுத்த வள்ளல் பாரியின் கொடைப் பண்பை தொழில்நுட்ப வடிவில் முன்னெடுத்துச் செல்லும் கூட்டு முயற்சி.'
                  : 'Inspired by classical Sangam lore of King Paari (வள்ளல் பாரி), who bestowed his royal chariot to cradle a fragile wild jasmine vine. We champion unconditional generosity.'}
              </p>
            </div>

          </div>

          {/* Bottom Copyright Row */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '0.82rem' }}>
            <p>{t('footerText')}</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>Privacy & Food Safety Protocols</span>
              <span>•</span>
              <span>CIT Chennai Campus Hub</span>
              <span>•</span>
              <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{language === 'ta' ? 'தமிழ் பதிப்பு' : 'English Edition'}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Bilingual AI Chatbot */}
      <Chatbot />

    </div>
  );
}
