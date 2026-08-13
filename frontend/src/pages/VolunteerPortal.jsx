import React, { useState, useEffect } from 'react';
import api from '../api';
import { Truck, MapPin, CheckCircle, Navigation, Compass, AlertCircle, BookmarkCheck, History, Award } from 'lucide-react';

export default function VolunteerPortal() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'active'
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Map route viewer modal state
  const [activeRouteTask, setActiveRouteTask] = useState(null);

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/deliveries/available');
      setAvailableTasks(res.data);
    } catch(err) {
      console.error('Error fetching available tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const res = await api.get('/api/deliveries/my');
      setMyTasks(res.data);
    } catch (err) {
      console.error('Error fetching my deliveries', err);
    }
  };

  useEffect(() => {
    fetchAvailable();
    fetchMyTasks();
  }, []);

  const handleClaim = async (deliveryId) => {
    setActionLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/api/deliveries/assign?deliveryId=${deliveryId}`);
      setMsg({ type: 'success', text: 'Food run claimed! Check instructions in Active Tasks tab.' });
      fetchAvailable();
      fetchMyTasks();
      setTimeout(() => {
        setMsg({ type: '', text: '' });
        setActiveTab('active');
      }, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || err.response?.data?.error || 'Failed to claim task.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId, status) => {
    setActionLoading(true);
    try {
      await api.put(`/api/deliveries/${deliveryId}/status?status=${status}`);
      fetchAvailable();
      fetchMyTasks();
      if (status === 'DELIVERED') {
        setActiveRouteTask(null);
      }
    } catch (err) {
      console.error('Error updating status', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animated-fade" style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', background: 'var(--background)' }}>
      
      {/* Sub Header Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '30px' }}>
        <div>
          <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Portal</span>
          <h2 className="text-editorial" style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>Volunteer Rescuer Dispatch</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>Claim local dispatch tasks, follow geocoded routes, and record delivery handovers</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('browse')}
            className={activeTab === 'browse' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <Truck size={16} /> Open Food Runs ({availableTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={activeTab === 'active' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <Navigation size={16} /> Active Jobs ({myTasks.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').length})
          </button>
        </div>
      </div>

      {msg.text && (
        <div className={msg.type === 'success' ? 'badge-success' : 'badge-error'} style={{ padding: '14px', borderRadius: '12px', marginBottom: '24px', width: '100%', display: 'block', fontSize: '0.9rem' }}>
          {msg.text}
        </div>
      )}

      {/* VIEW: Available Tasks list */}
      {activeTab === 'browse' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>Available Delivery Runs Board</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Searching dispatch board...</div>
          ) : availableTasks.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Award size={36} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '12px', margin: '0 auto' }} />
              <p>Excellent! All scheduled donation runs are currently covered by the courier group.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {availableTasks.map((t) => (
                <div key={t.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>Food Dispatch Run #{t.id}</h4>
                      <span className="badge badge-warning" style={{ fontWeight: '800' }}>
                        Radius: {t.distanceKm ? t.distanceKm.toFixed(1) : '—'} km
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: '800', width: '80px', display: 'inline-block' }}>[A] Pickup:</span> 
                        <span>{t.pickupLocation}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: '800', width: '80px', display: 'inline-block' }}>[B] Dropoff:</span> 
                        <span>{t.deliveryLocation}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleClaim(t.id)}
                      disabled={actionLoading}
                      className="glass-button"
                      style={{ padding: '10px 24px', fontSize: '0.85rem' }}
                    >
                      Accept Run <BookmarkCheck size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: Active Tasks & Route tracking */}
      {activeTab === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: activeRouteTask ? '1.2fr 0.8fr' : '1fr', gap: '30px', alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>Your Active Delivery Milestone Runs</h3>
            {myTasks.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').length === 0 ? (
              <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <History size={36} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '12px', margin: '0 auto' }} />
                <p>You have no active runs. Head to the Dispatch Runs Board to accept one.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {myTasks.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').map((t) => (
                  <div key={t.id} className="glass-panel" style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>Rescue Job Task #{t.id}</h4>
                          <span className={`badge ${t.status === 'ASSIGNED' ? 'badge-warning' : 'badge-info'}`}>
                            {t.status === 'ASSIGNED' ? 'Awaiting pickup' : 'Transit mode'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          NGO Welfare Recipient: <strong>{t.foodRequest?.receiver?.organizationName || 'Shelter Partner'}</strong>
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: '900' }}>
                          {t.distanceKm ? t.distanceKm.toFixed(1) : '—'} km
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trip Distance</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', background: '#FAF6EE', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div>📍 <strong>Pickup Shop:</strong> {t.pickupLocation}</div>
                      <div>🏁 <strong>Dropoff Shelter:</strong> {t.deliveryLocation}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button
                        onClick={() => setActiveRouteTask(t)}
                        className="glass-button-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        <Compass size={14} /> Compass Vector Path
                      </button>
                      
                      {t.status === 'ASSIGNED' ? (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'PICKED_UP')}
                          disabled={actionLoading}
                          className="glass-button"
                          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                        >
                          Confirm Pickup Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'DELIVERED')}
                          disabled={actionLoading}
                          className="glass-button"
                          style={{ padding: '8px 18px', fontSize: '0.85rem', background: 'var(--primary)', borderColor: 'var(--primary)' }}
                        >
                          Confirm Distribution Successful
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDE PANEL: Interactive Vector Routing map */}
          {activeRouteTask && (
            <div className="glass-panel animated-fade" style={{ padding: '24px', border: '1.5px solid var(--primary)', alignSelf: 'start', background: '#FAF6EE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Navigation size={16} color="var(--accent)" />
                  Geodirectional Route Path
                </h3>
                <button
                  onClick={() => setActiveRouteTask(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }}
                >
                  &times;
                </button>
              </div>

              {/* Interactive Vector Animation Map */}
              <div style={{ minHeight: '200px', background: '#FFF', borderRadius: '12px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="180" viewBox="0 0 300 200" style={{ pointerEvents: 'none' }}>
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(15,59,46,0.02)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Route path */}
                  <path
                    d="M 60,140 Q 140,40 240,90"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="3.5"
                    strokeDasharray="6,6"
                    style={{ animation: 'dash 12s linear infinite' }}
                  />

                  {/* Nodes */}
                  <circle cx="60" cy="140" r="8" fill="var(--accent-light)" />
                  <circle cx="60" cy="140" r="4.5" fill="var(--accent)" />
                  
                  <circle cx="240" cy="90" r="8" fill="var(--primary-light)" />
                  <circle cx="240" cy="90" r="4.5" fill="var(--primary)" />

                  <text x="45" y="165" fill="var(--text-muted)" fontSize="9" fontWeight="800">Shop [A]</text>
                  <text x="220" y="115" fill="var(--text-muted)" fontSize="9" fontWeight="800">NGO [B]</text>
                </svg>

                <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.92)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Status:</span>{' '}
                    <strong style={{ color: 'var(--primary)' }}>{activeRouteTask.status}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Dist:</span>{' '}
                    <strong>{activeRouteTask.distanceKm ? activeRouteTask.distanceKm.toFixed(1) : '—'} km</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'grid', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>🏁 <strong>Target Dropoff point:</strong> {activeRouteTask.deliveryLocation}</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--accent)', fontWeight: '600' }}>
                  <AlertCircle size={14} />
                  <span>Always check preparation and pickup time before setting out.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SVG Path animation style */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -120;
          }
        }
      `}</style>

    </div>
  );
}
