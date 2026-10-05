import React, { useState, useEffect } from 'react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Truck, MapPin, CheckCircle, Navigation, Compass, AlertCircle, BookmarkCheck, History, Award } from 'lucide-react';
import LiveDeliveryMap from '../components/LiveDeliveryMap';

export default function VolunteerPortal() {
  const { language, t } = useLanguage();
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
      setMsg({ type: 'success', text: t('volunteerClaimSuccess') });
      fetchAvailable();
      fetchMyTasks();
      setTimeout(() => {
        setMsg({ type: '', text: '' });
        setActiveTab('active');
      }, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || err.response?.data?.error || t('volunteerClaimFail') });
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
          <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('volunteerPortalTag')}</span>
          <h2 className="text-editorial" style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>{t('volunteerPortalTitle')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>{t('volunteerPortalDesc')}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('browse')}
            className={activeTab === 'browse' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <Truck size={16} /> {t('volunteerOpenRuns')} ({availableTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={activeTab === 'active' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <Navigation size={16} /> {t('volunteerActiveJobs')} ({myTasks.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').length})
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
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>{t('volunteerRunsBoard')}</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t('volunteerSearching')}</div>
          ) : availableTasks.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Award size={36} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '12px', margin: '0 auto' }} />
              <p>{t('volunteerNoRuns')}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {availableTasks.map((t) => (
                <div key={t.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{t('volunteerRunPrefix')}{t.id}</h4>
                      <span className="badge badge-warning" style={{ fontWeight: '800' }}>
                        Radius: {t.distanceKm ? t.distanceKm.toFixed(1) : '—'} km
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: '800', width: '90px', display: 'inline-block' }}>[A] {t('volunteerPickup')}:</span> 
                        <span>{t.pickupLocation}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: '800', width: '90px', display: 'inline-block' }}>[B] {t('volunteerDropoff')}:</span> 
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
                      {t('volunteerAcceptRun')} <BookmarkCheck size={16} />
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
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>{t('volunteerActiveTitle')}</h3>
            {myTasks.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').length === 0 ? (
              <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <History size={36} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '12px', margin: '0 auto' }} />
                <p>{t('volunteerNoActive')}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {myTasks.filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').map((t) => (
                  <div key={t.id} className="glass-panel" style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{t('volunteerRunPrefix')}{t.id}</h4>
                          <span className={`badge ${t.status === 'ASSIGNED' ? 'badge-warning' : 'badge-info'}`}>
                            {t.status === 'ASSIGNED' ? t('volunteerAwaitingPickup') : t('volunteerTransitMode')}
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
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('volunteerTripDistance')}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', background: '#FAF6EE', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div>📍 <strong>{t('volunteerPickup')}:</strong> {t.pickupLocation}</div>
                      <div>🏁 <strong>{t('volunteerDropoff')}:</strong> {t.deliveryLocation}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button
                        onClick={() => setActiveRouteTask(t)}
                        className="glass-button"
                        style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#FFF' }}
                      >
                        <Navigation size={14} /> {t('trackLiveBtn') || 'Live GPS Navigation'}
                      </button>
                      
                      {t.status === 'ASSIGNED' ? (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'PICKED_UP')}
                          disabled={actionLoading}
                          className="glass-button"
                          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                        >
                          {t('volunteerConfirmPickup')}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'DELIVERED')}
                          disabled={actionLoading}
                          className="glass-button"
                          style={{ padding: '8px 18px', fontSize: '0.85rem', background: 'var(--primary)', borderColor: 'var(--primary)' }}
                        >
                          {t('volunteerConfirmDelivered')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDE PANEL: Live Google Maps Delivery Component */}
          {activeRouteTask && (
            <div style={{ position: 'sticky', top: '90px' }}>
              <LiveDeliveryMap
                deliveryId={activeRouteTask.id}
                initialData={activeRouteTask}
                isVolunteer={true}
                onClose={() => setActiveRouteTask(null)}
              />
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
