import React, { useState } from 'react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { LogIn, UserPlus, Mail, Lock, Phone, MapPin, Briefcase, Car, Heart, ShieldCheck, Compass as GPSIcon, KeyRound } from 'lucide-react';

export default function Auth({ onNavigate, onLoginSuccess, initialMode = 'login' }) {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'DONOR',
    organizationName: '',
    address: '',
    foodTypeOffered: '',
    areaServed: '',
    vehicleType: '',
    vehicleNumber: '',
    latitude: 12.9716, // Default Bangalore coordinates
    longitude: 77.5946,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fillDemoAccount = (email, password) => {
    setFormData((prev) => ({
      ...prev,
      email,
      password
    }));
    setMode('login');
  };

  const handleGeoTrigger = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setSuccessMsg(language === 'ta' ? 'இருப்பிடம் வெற்றிகரமாகக் கண்டறியப்பட்டது!' : 'Coordinates detected successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        },
        (err) => {
          setErrorMsg(language === 'ta' ? 'இருப்பிடத்தைக் கண்டறிய முடியவில்லை. இயல்புநிலை இருப்பிடம் பயன்படுத்தப்படுகிறது.' : 'Failed to read geolocation from GPS. Using default location.');
          setTimeout(() => setErrorMsg(''), 4000);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        const res = await api.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        onLoginSuccess(res.data);
      } else {
        await api.post('/api/auth/register', formData);
        setSuccessMsg(language === 'ta' ? 'பதிவு வெற்றிகரமாக முடிந்தது! உள்நுழைவுப் பக்கத்திற்கு மாறுகிறது...' : 'Member registration successful! Redirecting to sign in...');
        setTimeout(() => {
          onNavigate('login');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          setErrorMsg(err.response.data.message);
        } else if (err.response.data.error) {
          setErrorMsg(err.response.data.error);
        } else if (err.response.data.details) {
          const detailStr = Object.entries(err.response.data.details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ');
          setErrorMsg(detailStr);
        } else {
          setErrorMsg(language === 'ta' ? 'உள்நுழைவு தோல்வியடைந்தது. விவரங்களை சரிபார்க்கவும்.' : 'Authentication failed. Please verify credentials.');
        }
      } else {
        setErrorMsg(language === 'ta' ? 'சேவையகத்தை இணைக்க முடியவில்லை.' : 'Network timeout. Please ensure the backend is online.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', minHeight: '90vh', background: 'var(--background)' }}>
      
      {/* Decorative Brand Panel */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover, #1b3d17) 100%)',
        color: '#FAF8F4',
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '0 var(--border-radius-large, 24px) var(--border-radius-large, 24px) 0',
        minHeight: '400px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(230, 95, 43, 0.08)', pointerEvents: 'none' }} />
        
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
            <Heart size={14} fill="#FAF8F4" /> {language === 'ta' ? 'பாரி உணவு மீட்பு தளம்' : 'PAARI RESCUE SYSTEM'}
          </div>
          <h2 className="text-editorial" style={{ fontSize: '2.8rem', fontWeight: '800', marginTop: '24px', lineHeight: '1.2' }}>
            {language === 'ta' ? (
              <>உபரி உணவை <br /><span style={{ color: 'var(--accent)' }}>நேரடி நன்மையாக மாற்றுங்கள்</span></>
            ) : (
              <>Transforming Surplus into <br/><span style={{ color: 'var(--accent)' }}>Direct Impact</span></>
            )}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginTop: '20px', maxWidth: '440px', lineHeight: '1.7' }}>
            {language === 'ta' 
              ? 'உணவகங்களின் உபரி உணவை, அருகிலுள்ள ஆதரவற்றோர் இல்லங்கள் மற்றும் காப்பகங்களுக்கு உரிய நேரத்தில் தன்னார்வலர்கள் மூலம் கொண்டு சேர்க்கிறோம்.' 
              : 'By coordinating donors, delivery volunteers, and vetted shelters, PAARI ensures that good surplus food reaches those who need it most.'}
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '24px', marginTop: '40px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <ShieldCheck size={36} color="var(--accent)" />
            <div>
              <h4 style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                {language === 'ta' ? 'சரிபார்க்கப்பட்ட சுயவிவரங்கள்' : 'Encrypted & Verified Profiles'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                {language === 'ta' ? 'வழங்குநர்கள் மற்றும் காப்பகங்கள் நகராட்சி மற்றும் FSSAI தரத்தின்படி சரிபார்க்கப்படுகின்றன.' : 'All food donors, NGOs, and volunteers are vetted by city admins.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '36px', boxShadow: 'none', border: '1px solid var(--border)', background: '#fff' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 className="text-editorial" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '6px' }}>
              {mode === 'login' ? t('authTitleLogin') : t('authTitleRegister')}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              {mode === 'login' ? t('authSubtitleLogin') : t('authSubtitleRegister')}
            </p>
          </div>

          {/* Quick Demo Logins Bar (Visible in Login Mode) */}
          {mode === 'login' && (
            <div style={{ background: '#FAF6EE', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
                <KeyRound size={14} /> {t('demoLoginsTitle')}:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('donor@paari.org', 'donor123')}
                  style={{ background: '#fff', border: '1px solid var(--border)', padding: '6px 8px', borderRadius: '8px', fontSize: '0.74rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  🍞 <strong>{t('demoDonor')}</strong> <br /><span style={{ color: 'var(--text-muted)' }}>donor@paari.org</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('ngo@paari.org', 'ngo123')}
                  style={{ background: '#fff', border: '1px solid var(--border)', padding: '6px 8px', borderRadius: '8px', fontSize: '0.74rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  🏠 <strong>{t('demoReceiver')}</strong> <br /><span style={{ color: 'var(--text-muted)' }}>ngo@paari.org</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('volunteer@paari.org', 'volunteer123')}
                  style={{ background: '#fff', border: '1px solid var(--border)', padding: '6px 8px', borderRadius: '8px', fontSize: '0.74rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  🛵 <strong>{t('demoVolunteer')}</strong> <br /><span style={{ color: 'var(--text-muted)' }}>volunteer@paari.org</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@paari.org', 'admin123')}
                  style={{ background: '#fff', border: '1px solid var(--border)', padding: '6px 8px', borderRadius: '8px', fontSize: '0.74rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  ⚙️ <strong>{t('demoAdmin')}</strong> <br /><span style={{ color: 'var(--text-muted)' }}>admin@paari.org</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="badge-error" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', display: 'block', wordBreak: 'break-word', color: '#c53030', background: '#fff5f5', border: '1px solid #feb2b2' }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="badge-success" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', display: 'block', color: '#276749', background: '#f0fff4', border: '1px solid #9ae6b4' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            
            {/* Sign Up Name */}
            {mode === 'register' && (
              <div>
                <span className="label-label">{t('nameLabel')}</span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={t('namePlaceholder')}
                  className="glass-input"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <span className="label-label">{t('emailLabel')}</span>
              <input
                type="email"
                name="email"
                required
                placeholder={t('emailPlaceholder')}
                className="glass-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            {mode === 'register' && (
              <div>
                <span className="label-label">{t('phoneLabel')}</span>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder={t('phonePlaceholder')}
                  className="glass-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <span className="label-label">{t('passwordLabel')}</span>
              <input
                type="password"
                name="password"
                required
                placeholder={t('passwordPlaceholder')}
                className="glass-input"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Signup Specific Form Fields */}
            {mode === 'register' && (
              <>
                {/* Role Pill Selectors */}
                <div>
                  <span className="label-label">{t('roleSelectPrompt')}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['DONOR', 'RECEIVER', 'VOLUNTEER'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        style={{
                          flex: 1,
                          padding: '10px 6px',
                          borderRadius: '99px',
                          border: formData.role === r ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                          background: formData.role === r ? 'var(--primary)' : 'transparent',
                          color: formData.role === r ? '#FAF8F4' : 'var(--text-muted)',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast, 0.2s)'
                        }}
                        onClick={() => setFormData({ ...formData, role: r })}
                      >
                        {r === 'DONOR' ? t('roleDonor') : r === 'RECEIVER' ? t('roleReceiver') : t('roleVolunteer')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor and Receiver common profile */}
                {(formData.role === 'DONOR' || formData.role === 'RECEIVER') && (
                  <>
                    <div>
                      <span className="label-label">{t('orgNameLabel')}</span>
                      <input
                        type="text"
                        name="organizationName"
                        required
                        placeholder={t('orgNamePlaceholder')}
                        className="glass-input"
                        value={formData.organizationName}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <span className="label-label">{t('addressLabel')}</span>
                      <input
                        type="text"
                        name="address"
                        required
                        placeholder={t('addressPlaceholder')}
                        className="glass-input"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                {/* Donor fields */}
                {formData.role === 'DONOR' && (
                  <div>
                    <span className="label-label">{language === 'ta' ? 'வழங்கும் உணவு வகைகள்' : 'Supported Food Categories'}</span>
                    <input
                      type="text"
                      name="foodTypeOffered"
                      placeholder={language === 'ta' ? 'எ.கா: சாப்பாடு, பிரியாணி, ரொட்டி, பழங்கள்' : 'e.g. Cooked meals, bakery items, fruits'}
                      className="glass-input"
                      value={formData.foodTypeOffered}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* Receiver fields */}
                {formData.role === 'RECEIVER' && (
                  <div>
                    <span className="label-label">{language === 'ta' ? 'பயன்பெறும் பகுதி' : 'Municipal Area Served'}</span>
                    <input
                      type="text"
                      name="areaServed"
                      required
                      placeholder={language === 'ta' ? 'எ.கா: அண்ணா நகர், தி.நகர்' : 'e.g. Ward 6, Central District'}
                      className="glass-input"
                      value={formData.areaServed}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* Volunteer fields */}
                {formData.role === 'VOLUNTEER' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <span className="label-label">{t('vehicleTypeLabel')}</span>
                      <input
                        type="text"
                        name="vehicleType"
                        required
                        placeholder={t('vehicleTypePlaceholder')}
                        className="glass-input"
                        value={formData.vehicleType}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <span className="label-label">{t('vehicleNumberLabel')}</span>
                      <input
                        type="text"
                        name="vehicleNumber"
                        required
                        placeholder={t('vehicleNumberPlaceholder')}
                        className="glass-input"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {/* Geolocation settings */}
                {(formData.role === 'DONOR' || formData.role === 'RECEIVER') && (
                  <div style={{ border: '2px solid var(--border)', padding: '14px', borderRadius: '14px', background: '#FAF6EE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="label-label" style={{ margin: 0, fontSize: '0.8rem' }}>
                        {language === 'ta' ? 'வரைபட இருப்பிடக் குறியீடுகள்' : 'Geographic Mapping Coordinates'}
                      </span>
                      <button
                        type="button"
                        onClick={handleGeoTrigger}
                        style={{
                          background: 'var(--primary-light, rgba(45,90,39,0.1))',
                          border: 'none',
                          borderRadius: '99px',
                          padding: '5px 12px',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <GPSIcon size={12} /> {language === 'ta' ? 'கண்டறி' : 'Auto-Detect'}
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <span className="label-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Latitude</span>
                        <input
                          type="number"
                          step="0.000001"
                          name="latitude"
                          required
                          className="glass-input"
                          style={{ padding: '8px 12px' }}
                          value={formData.latitude}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <span className="label-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Longitude</span>
                        <input
                          type="number"
                          step="0.000001"
                          name="longitude"
                          required
                          className="glass-input"
                          style={{ padding: '8px 12px' }}
                          value={formData.longitude}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="glass-button"
              style={{ width: '100%', marginTop: '8px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading ? (
                'Processing...'
              ) : mode === 'login' ? (
                <>
                  <LogIn size={18} /> {t('btnSignIn')}
                </>
              ) : (
                <>
                  <UserPlus size={18} /> {t('btnRegister')}
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Sign-up */}
          <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {mode === 'login' ? t('needAccount') : t('haveAccount')}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={{
                  marginLeft: '8px',
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  textDecoration: 'underline'
                }}
              >
                {mode === 'login' ? t('navJoin') : t('navSignIn')}
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
