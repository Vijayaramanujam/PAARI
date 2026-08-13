import React, { useState } from 'react';
import api from '../api';
import { LogIn, UserPlus, Mail, Lock, Phone, MapPin, Briefcase, Car, Heart, ShieldCheck, Compass as GPSIcon } from 'lucide-react';

export default function Auth({ onNavigate, onLoginSuccess, initialMode = 'login' }) {
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

  const handleGeoTrigger = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setSuccessMsg('Coordinates detected successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        },
        (err) => {
          setErrorMsg('Failed to read geolocation from GPS. Using default location.');
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
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data));
        onLoginSuccess(res.data);
      } else {
        await api.post('/api/auth/register', formData);
        setSuccessMsg('Member registration successful! Loading Access Panel.');
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('');
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
          setErrorMsg('Authentication failed. Please verify credentials.');
        }
      } else {
        setErrorMsg('Network timeout. Please ensure the backend is online.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', minHeight: '90vh', background: 'var(--background)' }}>
      
      {/* Decorative Brand Panel */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        color: '#FAF8F4',
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '0 var(--border-radius-large) var(--border-radius-large) 0',
        minHeight: '400px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(230, 95, 43, 0.08)', pointerEvents: 'none' }} />
        
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
            <Heart size={14} fill="#FAF8F4" /> PAARI RESCUE SYSTEM
          </div>
          <h2 className="text-editorial" style={{ fontSize: '3rem', fontWeight: '800', marginTop: '30px', lineHeight: '1.2' }}>
            Transforming Surplus into <br/>
            <span style={{ color: 'var(--accent)' }}>Direct Impact</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', marginTop: '20px', maxWidth: '440px', lineHeight: '1.7' }}>
            By checking excess inventories, coordinating logistics volunteers, and ranking reliable partners, PAARI bridges physical access and local food equity.
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', marginTop: '40px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <ShieldCheck size={36} color="var(--accent)" />
            <div>
              <h4 style={{ fontWeight: '700', fontSize: '0.95rem' }}>Encrypted & Verified Profiles</h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>All corporate sponsors, NGOs, and volunteers are vetted by city admins.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '36px', boxShadow: 'none', border: '1px solid var(--border)' }}>
          
          <div style={{ marginBottom: '28px' }}>
            <h3 className="text-editorial" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '6px' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {mode === 'login' ? 'Access your localized food redistribution dashboard' : 'Join as a donor, volunteer, or receiver NGO'}
            </p>
          </div>

          {errorMsg && (
            <div className="badge-error" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', display: 'block', wordBreak: 'break-word' }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="badge-success" style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', display: 'block' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
            
            {/* Sign Up Name */}
            {mode === 'register' && (
              <div>
                <span className="label-label">Full Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="glass-input"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <span className="label-label">Email Address</span>
              <input
                type="email"
                name="email"
                required
                placeholder="name@organization.org"
                className="glass-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            {mode === 'register' && (
              <div>
                <span className="label-label">Phone Number</span>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  className="glass-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <span className="label-label">Password</span>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
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
                  <span className="label-label">I am registering as:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['DONOR', 'RECEIVER', 'VOLUNTEER'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '99px',
                          border: formData.role === r ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                          background: formData.role === r ? 'var(--primary)' : 'transparent',
                          color: formData.role === r ? '#FAF8F4' : 'var(--text-muted)',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onClick={() => setFormData({ ...formData, role: r })}
                      >
                        {r === 'DONOR' ? 'Donor' : r === 'RECEIVER' ? 'NGO / Utility' : 'Volunteer'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor and Receiver common profile */}
                {(formData.role === 'DONOR' || formData.role === 'RECEIVER') && (
                  <>
                    <div>
                      <span className="label-label">Organization Name</span>
                      <input
                        type="text"
                        name="organizationName"
                        required
                        placeholder="e.g. Care Home Foundation"
                        className="glass-input"
                        value={formData.organizationName}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <span className="label-label">Office Street Address</span>
                      <input
                        type="text"
                        name="address"
                        required
                        placeholder="e.g. 102 Green Boulevard, Ward 4"
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
                    <span className="label-label">Supported Food Categories</span>
                    <input
                      type="text"
                      name="foodTypeOffered"
                      placeholder="e.g. Veg meals, bakery leftovers, fruits"
                      className="glass-input"
                      value={formData.foodTypeOffered}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* Receiver fields */}
                {formData.role === 'RECEIVER' && (
                  <div>
                    <span className="label-label">Municipal Area Served</span>
                    <input
                      type="text"
                      name="areaServed"
                      required
                      placeholder="e.g. Ward 6, East slums distribution"
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
                      <span className="label-label">Vehicle Type</span>
                      <input
                        type="text"
                        name="vehicleType"
                        required
                        placeholder="e.g. Scooter, Hatchback"
                        className="glass-input"
                        value={formData.vehicleType}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <span className="label-label">Vehicle Plate</span>
                      <input
                        type="text"
                        name="vehicleNumber"
                        required
                        placeholder="e.g. KA-03-XX-1100"
                        className="glass-input"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {/* Geolocation settings */}
                {(formData.role === 'DONOR' || formData.role === 'RECEIVER') && (
                  <div style={{ border: '2px solid var(--border)', padding: '16px', borderRadius: '16px', background: '#FAF6EE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="label-label" style={{ margin: 0, fontSize: '0.8rem' }}>Geographic Mapping Coordinates</span>
                      <button
                        type="button"
                        onClick={handleGeoTrigger}
                        style={{
                          background: 'var(--primary-light)',
                          border: 'none',
                          borderRadius: '99px',
                          padding: '6px 14px',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <GPSIcon size={12} /> Auto-Detect
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
              style={{ width: '100%', marginTop: '10px', padding: '14px' }}
            >
              {loading ? (
                'Processing secure login...'
              ) : mode === 'login' ? (
                <>
                  <LogIn size={18} /> Access Portal
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Register as Partner
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Sign-up */}
          <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {mode === 'login' ? "New to the rescue network?" : 'Already a registered partner?'}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={{
                  marginLeft: '6px',
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  textDecoration: 'underline'
                }}
              >
                {mode === 'login' ? 'Register Now' : 'Sign In'}
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
