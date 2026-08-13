import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, MapPin, Inbox, CheckCircle2, ChevronRight, Star, AlertTriangle, ShieldCheck, Heart, Clock } from 'lucide-react';

export default function ReceiverPortal() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'claims'
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Claim Modal states
  const [claimDonation, setClaimDonation] = useState(null);
  const [claimQty, setClaimQty] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Feedback Modal states
  const [feedbackTarget, setFeedbackTarget] = useState(null); 
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchBrowseFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/donations/available');
      setAvailableDonations(res.data);
    } catch(err) {
      console.error('Error fetching browse feed', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyClaims = async () => {
    try {
      const res = await api.get('/api/requests/my');
      setMyClaims(res.data);
    } catch (err) {
      console.error('Error fetching claims', err);
    }
  };

  useEffect(() => {
    fetchBrowseFeed();
    fetchMyClaims();
  }, []);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const qty = parseFloat(claimQty);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please specify a positive decimal quantity.');
      setActionLoading(false);
      return;
    }
    if (qty > claimDonation.quantity) {
      setErrorMsg(`Claim quantity exceeds available amount of ${claimDonation.quantity} kg.`);
      setActionLoading(false);
      return;
    }

    try {
      await api.post(`/api/requests?donationId=${claimDonation.id}&quantity=${qty}`);
      setSuccessMsg('Surplus claim registered! Awaiting donor authorization.');
      fetchBrowseFeed();
      fetchMyClaims();
      setTimeout(() => {
        setClaimDonation(null);
        setClaimQty('');
        setSuccessMsg('');
        setActiveTab('claims');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.error || 'Failed to submit portion claim.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const targetUserId = feedbackTarget.donorUserId;
      await api.post(`/api/feedback?targetUserId=${targetUserId}&type=DONOR&rating=${rating}&comment=${comment}`);
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackTarget(null);
        setRating(5);
        setComment('');
        setFeedbackSuccess(false);
      }, 1500);
    } catch(err) {
      console.error('Error posting feedback', err);
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
          <h2 className="text-editorial" style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>Receiver Operations Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>Browse available local food items, request portions, and audit delivery logs</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('browse')}
            className={activeTab === 'browse' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <Search size={16} /> Browse Food Listings
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={activeTab === 'claims' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <Inbox size={16} /> Claims Pipeline ({myClaims.length})
          </button>
        </div>
      </div>

      {/* VIEW: Browse Food listings */}
      {activeTab === 'browse' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>Available Surplus Items Catalogue</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading food listings feed...</div>
          ) : availableDonations.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Heart size={36} color="var(--primary)" style={{ opacity: 0.4, marginBottom: '12px' }} />
              <p>No food items are listed at your location. Refresh or check back later.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
              {availableDonations.map((d) => (
                <div key={d.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyValues: 'space-between', minHeight: '260px' }}>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-success">⭐ PROXIMITY SORTED</span>
                      <strong style={{ fontSize: '1.3rem', color: 'var(--accent)' }}>{d.quantity} kg</strong>
                    </div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>{d.foodType}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Listed by: <strong>{d.donorName || 'Authorized Donor'}</strong></p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minHeight: '50px', lineHeight: '1.5' }}>
                      {d.description || 'No allergen or inventory notes included.'}
                    </p>
                    
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'grid', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="var(--accent)" /> {d.pickupAddress}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Claim before: {new Date(d.expiryTime).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setClaimDonation(d); setClaimQty(d.quantity.toString()); setErrorMsg(''); setSuccessMsg(''); }}
                    className="glass-button"
                    style={{ width: '100%', marginTop: '20px', padding: '10px 14px', fontSize: '0.9rem' }}
                  >
                    Request Portion Rescue
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: My Claims workflow */}
      {activeTab === 'claims' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>Your Claims Logistics Pipeline</h3>
          {myClaims.length === 0 ? (
            <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Inbox size={36} color="var(--primary)" style={{ opacity: 0.4, marginBottom: '12px' }} />
              <p>You have not made any claims yet. Select "Browse Food Listings" to apply.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {myClaims.map((c) => (
                <div key={c.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{c.foodDonation.foodType}</h4>
                      <span className={`badge ${c.status === 'PENDING' ? 'badge-warning' : c.status === 'ACCEPTED' ? 'badge-info' : c.status === 'COMPLETED' ? 'badge-success' : 'badge-error'}`}>
                        {c.status}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Redistribution weight: <strong>{c.quantityRequested} kg</strong> | From: {c.foodDonation.donor.organizationName}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <MapPin size={12} color="var(--accent)" /> {c.foodDonation.pickupAddress}
                    </div>
                  </div>
                  <div>
                    {c.status === 'COMPLETED' && (
                      <button
                        onClick={() => {
                          setFeedbackTarget({
                            donationId: c.foodDonation.id,
                            donorName: c.foodDonation.donor.organizationName,
                            donorUserId: c.foodDonation.donor.user.id
                          });
                        }}
                        className="glass-button-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px' }}
                      >
                        <Star size={14} color="var(--accent)" fill="var(--accent)" />
                        Review Food Quality
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Claim portion request */}
      {claimDonation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,59,46,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '520px', padding: '36px', border: '1px solid var(--border)' }}>
            <h3 className="text-editorial" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>Confirm Portion Claim</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Redistributing portion package of <strong>{claimDonation.foodType}</strong>. Verify your organization is in position to pickup from <em>{claimDonation.pickupAddress}</em>.
            </p>

            {errorMsg && (
              <div className="badge-error" style={{ display: 'block', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="badge-success" style={{ display: 'block', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <span className="label-label">Requested Portion Weight (kg) - Limit: {claimDonation.quantity}</span>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="glass-input"
                  value={claimQty}
                  onChange={(e) => setClaimQty(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setClaimDonation(null)}
                  className="glass-button-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="glass-button"
                  style={{ flex: 1 }}
                >
                  {actionLoading ? 'Claiming...' : 'Request Portion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Submit Feedback */}
      {feedbackTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,59,46,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animated-fade" style={{ width: '100%', maxWidth: '520px', padding: '36px', border: '1px solid var(--border)' }}>
            <h3 className="text-editorial" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>Post Partner Quality Review</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Verify logistics hygiene and packaging quality of logs completed with <strong>{feedbackTarget.donorName}</strong>.
            </p>

            {feedbackSuccess ? (
              <div className="badge-success animated-fade" style={{ display: 'block', padding: '16px', borderRadius: '10px', textAlign: 'center', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <CheckCircle2 color="var(--primary)" style={{ margin: '0 auto 10px auto' }} />
                Review stored! Updating partner metrics rank.
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <span className="label-label">Rate Quality Experience</span>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', padding: '8px 0' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Star size={32} fill={star <= rating ? 'var(--accent)' : 'none'} color={star <= rating ? 'var(--accent)' : 'var(--text-muted)'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="label-label">Add Quality / Delivery Notes</span>
                  <textarea
                    rows="3"
                    placeholder="Provide details about packaging condition, food freshness, temperature..."
                    className="glass-input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setFeedbackTarget(null)}
                    className="glass-button-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="glass-button"
                    style={{ flex: 1 }}
                  >
                    {actionLoading ? 'Saving...' : 'Post Quality Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
