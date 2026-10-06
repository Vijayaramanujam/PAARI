import React, { useState, useEffect } from 'react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Truck, MapPin, CheckCircle, Navigation, Compass, AlertCircle, BookmarkCheck, History, Award, RotateCw, Sparkles, Utensils } from 'lucide-react';
import LiveDeliveryMap from '../components/LiveDeliveryMap';

export default function VolunteerPortal() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('paari_volunteer_tab') || 'active';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('paari_volunteer_tab', tab);
  };
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
      setAvailableTasks(res.data || []);
      return res.data;
    } catch(err) {
      console.error('Error fetching available tasks', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const res = await api.get('/api/deliveries/my');
      const tasks = res.data || [];
      setMyTasks(tasks);
      const activeOnes = tasks.filter(task => task.status !== 'DELIVERED' && task.status !== 'CANCELLED');
      if (activeOnes.length > 0 && !activeRouteTask) {
        setActiveRouteTask(activeOnes[0]);
      }
      return tasks;
    } catch (err) {
      console.error('Error fetching my deliveries', err);
      return [];
    }
  };

  useEffect(() => {
    fetchAvailable();
    fetchMyTasks();
  }, []);

  const handleDispatchTestJob = async () => {
    setActionLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/api/system/quick-dispatch-job');
      setMsg({ type: 'success', text: '⚡ Fresh delivery run dispatched from CIT Chennai hub! Available in Open Runs Board.' });
      await fetchAvailable();
      await fetchMyTasks();
      setActiveTab('browse');
    } catch (err) {
      setMsg({ type: 'error', text: 'Could not dispatch job: ' + (err.response?.data?.error || err.message) });
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setActionLoading(true);
    const [avail, mine] = await Promise.all([fetchAvailable(), fetchMyTasks()]);
    setActionLoading(false);
    const activeCount = (mine || []).filter(task => task.status !== 'DELIVERED' && task.status !== 'CANCELLED').length;
    setMsg({ type: 'success', text: `Synchronized: ${(avail || []).length} open run(s) available, ${activeCount} active job(s) in progress.` });
    setTimeout(() => setMsg({ type: '', text: '' }), 3500);
  };

  const handleClaim = async (deliveryId) => {
    setActionLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/api/deliveries/assign?deliveryId=${deliveryId}`);
      setMsg({ type: 'success', text: t('volunteerClaimSuccess') });
      await fetchAvailable();
      const updatedMine = await fetchMyTasks();
      const claimed = (updatedMine || []).find(task => task.id === deliveryId);
      if (claimed) setActiveRouteTask(claimed);
      setTimeout(() => {
        setMsg({ type: '', text: '' });
        setActiveTab('active');
      }, 1000);
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
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleManualRefresh}
            disabled={actionLoading}
            className="glass-button-secondary"
            title="Refresh jobs from backend"
            style={{ padding: '9px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCw size={14} className={actionLoading ? 'animate-spin' : ''} /> {t('refreshRunsBtn') || 'Refresh'}
          </button>

          <button
            onClick={handleDispatchTestJob}
            disabled={actionLoading}
            className="glass-button"
            style={{ padding: '9px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#D97706', borderColor: '#D97706', color: '#FFF' }}
          >
            <Sparkles size={15} /> {t('dispatchRunBtn') || 'Dispatch Fresh Run'}
          </button>

          <button
            onClick={() => handleTabChange('browse')}
            className={activeTab === 'browse' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '9px 18px', fontSize: '0.85rem' }}
          >
            <Truck size={16} /> {t('volunteerOpenRuns')} ({availableTasks.length})
          </button>

          <button
            onClick={() => handleTabChange('active')}
            className={activeTab === 'active' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '9px 18px', fontSize: '0.85rem' }}
          >
            <Navigation size={16} /> {t('volunteerActiveJobs')} ({myTasks.filter(task => task.status !== 'DELIVERED' && task.status !== 'CANCELLED').length})
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>{t('volunteerRunsBoard')}</h3>
            <button
              onClick={handleDispatchTestJob}
              disabled={actionLoading}
              className="glass-button-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} color="#D97706" /> + Generate New Run (CIT Hub)
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t('volunteerSearching')}</div>
          ) : availableTasks.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Award size={36} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '12px', margin: '0 auto' }} />
              <p>{t('volunteerNoRuns')}</p>
              <button
                onClick={handleDispatchTestJob}
                disabled={actionLoading}
                className="glass-button"
                style={{ marginTop: '16px', padding: '10px 22px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#D97706', borderColor: '#D97706', color: '#FFF' }}
              >
                <Sparkles size={16} /> {t('dispatchRunBtn') || 'Dispatch Test Delivery Run (CIT Hub)'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {availableTasks.map((task) => (
                <div key={task.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'grid', gap: '8px', flex: '1', minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{t('volunteerRunPrefix')}{task.id}</h4>
                      <span className="badge badge-warning" style={{ fontWeight: '800' }}>
                        Radius: {task.distanceKm ? task.distanceKm.toFixed(1) : '—'} km
                      </span>
                    </div>

                    {/* Food Cargo Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FDF1EB', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(241, 90, 41, 0.2)', margin: '2px 0' }}>
                      <Utensils size={16} color="#F15A29" />
                      <strong style={{ fontSize: '0.94rem', color: 'var(--primary)' }}>
                        {task.foodRequest?.foodDonation?.foodType || 'Fresh Meals & Provisions'}
                      </strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#F15A29', marginLeft: 'auto' }}>
                        {task.foodRequest?.quantityRequested || task.foodRequest?.foodDonation?.quantity || '15'} kg
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: '800', width: '90px', display: 'inline-block' }}>[A] {t('volunteerPickup')}:</span> 
                        <span>{task.pickupLocation}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: '800', width: '90px', display: 'inline-block' }}>[B] {t('volunteerDropoff')}:</span> 
                        <span>{task.deliveryLocation}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleClaim(task.id)}
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
            {myTasks.filter(task => task.status !== 'DELIVERED' && task.status !== 'CANCELLED').length === 0 ? (
              <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <History size={36} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '12px', margin: '0 auto' }} />
                <p>{t('volunteerNoActive')}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {myTasks.filter(task => task.status !== 'DELIVERED' && task.status !== 'CANCELLED').map((task) => (
                  <div key={task.id} className="glass-panel" style={{ display: 'grid', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{t('volunteerRunPrefix')}{task.id}</h4>
                          <span className={`badge ${task.status === 'ASSIGNED' ? 'badge-warning' : 'badge-info'}`}>
                            {task.status === 'ASSIGNED' ? t('volunteerAwaitingPickup') : t('volunteerTransitMode')}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          NGO Welfare Recipient: <strong>{task.foodRequest?.receiver?.organizationName || 'Shelter Partner'}</strong>
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: '900' }}>
                          {task.distanceKm ? task.distanceKm.toFixed(1) : '—'} km
                        </strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('volunteerTripDistance')}</div>
                      </div>
                    </div>

                    {/* Food Cargo Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FDF1EB', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(241, 90, 41, 0.2)' }}>
                      <Utensils size={16} color="#F15A29" />
                      <strong style={{ fontSize: '0.94rem', color: 'var(--primary)' }}>
                        {task.foodRequest?.foodDonation?.foodType || 'Fresh Meals & Provisions'}
                      </strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#F15A29', marginLeft: 'auto' }}>
                        Cargo: {task.foodRequest?.quantityRequested || task.foodRequest?.foodDonation?.quantity || '15'} kg
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', background: '#FAF6EE', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div>📍 <strong>{t('volunteerPickup')}:</strong> {task.pickupLocation}</div>
                      <div>🏁 <strong>{t('volunteerDropoff')}:</strong> {task.deliveryLocation}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button
                        onClick={() => setActiveRouteTask(task)}
                        className="glass-button"
                        style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary)', color: '#FFF' }}
                      >
                        <Navigation size={14} /> {t('trackLiveBtn') || 'Live GPS Navigation'}
                      </button>
                      
                      {task.status === 'ASSIGNED' ? (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'PICKED_UP')}
                          disabled={actionLoading}
                          className="glass-button"
                          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                        >
                          {t('volunteerConfirmPickup')}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'DELIVERED')}
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
