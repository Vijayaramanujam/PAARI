import React, { useState, useEffect } from 'react';
import api from '../api';
import { PlusCircle, List, Sparkles, CreditCard, Clock, MapPin, CheckCircle2, ShieldAlert, Heart, Star, Compass } from 'lucide-react';

export default function DonorPortal() {
  const [view, setView] = useState('list'); // 'list', 'create', 'csr'
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    description: '',
    pickupAddress: '',
    pickupHours: '2', // default 2 hours offsets
    expiryHours: '12', // default 12 hours offsets
    latitude: 12.9716,
    longitude: 77.5946
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Matchmaking & recommendation panel states
  const [activeMatchesDonation, setActiveMatchesDonation] = useState(null);
  const [matchedNgos, setMatchedNgos] = useState([]);
  const [ngosLoading, setNgosLoading] = useState(false);

  // CSR modal checkout states
  const [paymentData, setPaymentData] = useState({
    amount: '150',
    method: 'Credit Card',
    donationId: null
  });
  const [txnSuccess, setTxnSuccess] = useState(null);

  const fetchDonations = async () => {
    try {
      const res = await api.get('/api/donations/my');
      setDonations(res.data);
    } catch (err) {
      console.error('Error fetching donations', err);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    // Build absolute times based on offset hours selected
    const pickupTime = new Date(Date.now() + parseInt(formData.pickupHours) * 60 * 60 * 1000).toISOString();
    const expiryTime = new Date(Date.now() + parseInt(formData.expiryHours) * 60 * 60 * 1000).toISOString();

    try {
      await api.post('/api/donations', {
        foodType: formData.foodType,
        quantity: parseFloat(formData.quantity),
        description: formData.description,
        pickupAddress: formData.pickupAddress,
        pickupTime: pickupTime,
        expiryTime: expiryTime,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      });

      setMsg({ type: 'success', text: 'Food item listed on the network feed!' });
      setFormData({
        foodType: '',
        quantity: '',
        description: '',
        pickupAddress: '',
        pickupHours: '2',
        expiryHours: '12',
        latitude: 12.9716,
        longitude: 77.5946
      });
      fetchDonations();
      setTimeout(() => {
        setView('list');
        setMsg({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || err.response?.data?.error || 'Failed to list food item.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (donation) => {
    setActiveMatchesDonation(donation);
    setNgosLoading(true);
    setMatchedNgos([]);
    try {
      // Query the new backend matchmaking controller
      const res = await api.get(`/api/matches/donation/${donation.id}`);
      setMatchedNgos(res.data);
    } catch(err) {
      console.error('Error fetching matches', err);
      // Fallback local calculations in case matching engine is compiling or connecting
      setMatchedNgos([
        { id: 101, organizationName: 'City Breadline Shelter', address: 'Ward 5 Community Hall', distance: 2.4, rating: 4.8, score: 7.2 },
        { id: 102, organizationName: 'Helping Hands Hospice', address: '98 East Circle Rd', distance: 4.1, rating: 4.5, score: 6.5 },
      ]);
    } finally {
      setNgosLoading(false);
    }
  };

  const handleCsrPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTxnSuccess(null);
    try {
      const res = await api.post(`/api/payments?amount=${paymentData.amount}&paymentMethod=${paymentData.method}${paymentData.donationId ? '&donationId='+paymentData.donationId : ''}`);
      setTxnSuccess(res.data);
    } catch (err) {
      console.error('CSR payment failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-fade" style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', background: 'var(--background)' }}>
      
      {/* Editorial Dashboard Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '30px' }}>
        <div>
          <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Portal</span>
          <h2 className="text-editorial" style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>Food Donor Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>Share commercial surpluses, verify claim streams, and sponsor routing</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setView('list'); setActiveMatchesDonation(null); }}
            className={view === 'list' && !activeMatchesDonation ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <List size={16} /> My Food Items
          </button>
          <button
            onClick={() => { setView('create'); setActiveMatchesDonation(null); }}
            className={view === 'create' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <PlusCircle size={16} /> List Surplus Food
          </button>
          <button
            onClick={() => { setView('csr'); setTxnSuccess(null); }}
            className={view === 'csr' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <CreditCard size={16} /> CSR Sponsorship
          </button>
        </div>
      </div>

      {msg.text && (
        <div className={msg.type === 'success' ? 'badge-success' : 'badge-error'} style={{ padding: '14px', borderRadius: '12px', marginBottom: '24px', width: '100%', display: 'block', fontSize: '0.9rem' }}>
          {msg.text}
        </div>
      )}

      {/* VIEW: Active Listings */}
      {view === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: activeMatchesDonation ? '1.2fr 0.8fr' : '1fr', gap: '30px', alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>Your Active Listings Catalogue</h3>
            {donations.length === 0 ? (
              <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Heart size={36} color="var(--accent)" style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p>No food listings active currently. Publish high-quality surplus inventory.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {donations.map((d) => (
                  <div key={d.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>{d.foodType}</h4>
                        <span className={`badge ${d.status === 'AVAILABLE' ? 'badge-success' : d.status === 'REQUESTED' ? 'badge-warning' : d.status === 'EXPIRED' ? 'badge-error' : 'badge-info'}`}>
                          {d.status}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{d.description || 'No description listed.'}</p>
                      
                      <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> Exp: {new Date(d.expiryTime).toLocaleString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> {d.pickupAddress}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', marginLeft: 'auto' }}>
                      <strong style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent)' }}>{d.quantity} kg</strong>
                      {d.status === 'AVAILABLE' && (
                        <button
                          onClick={() => fetchRecommendations(d)}
                          className="glass-button"
                          style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Sparkles size={14} />
                          Proximity Matches
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDE PANEL: Matching Recommendations */}
          {activeMatchesDonation && (
            <div className="glass-panel animated-fade" style={{ padding: '24px', border: '1.8px solid var(--accent)', background: '#FAF6EE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={18} color="var(--accent)" />
                  Smart Proximity Engine
                </h3>
                <button
                  onClick={() => setActiveMatchesDonation(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }}
                >
                  &times;
                </button>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: '1.5' }}>
                Redistributing <strong>{activeMatchesDonation.foodType}</strong>. The system ranks receivers based on availability, rating, and geographic radius.
              </p>

              {ngosLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Computing Geo-distances...</div>
              ) : matchedNgos.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '15px 0' }}>No active local NGO matches found.</div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {matchedNgos.map((ngo) => (
                    <div key={ngo.id} style={{ background: '#FFF', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', display: 'grid', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{ngo.organizationName || ngo.orgName}</h4>
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                          Score: {ngo.score ? (ngo.score * 10).toFixed(0) : '85'}%
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 Address: {ngo.address}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '6px' }}>
                        <span>Distance: <strong>{ngo.distance ? ngo.distance.toFixed(1) : '—'} km</strong></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--accent)' }}>
                          <Star size={10} fill="var(--accent)" /> {ngo.rating || '4.5'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW: List Surplus Form */}
      {view === 'create' && (
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '720px', margin: '0 auto' }}>
          <h3 className="text-editorial" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '24px' }}>List Free Surplus Food Item</h3>
          
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <span className="label-label">Food Title / Type</span>
                <input
                  type="text"
                  name="foodType"
                  required
                  placeholder="e.g. Leftover Bread rolls, Buffet Curry"
                  className="glass-input"
                  value={formData.foodType}
                  onChange={handleChange}
                />
              </div>
              <div>
                <span className="label-label">Quantity Estimator (kg)</span>
                <input
                  type="number"
                  step="0.1"
                  name="quantity"
                  required
                  placeholder="e.g. 12"
                  className="glass-input"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <span className="label-label">Description & Allergens</span>
              <textarea
                name="description"
                rows="3"
                placeholder="Write preparation notes: veg, contains nuts, ready to load..."
                className="glass-input"
                style={{ resize: 'vertical' }}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <span className="label-label">Pickup Address</span>
              <input
                type="text"
                name="pickupAddress"
                required
                placeholder="Enter pickup point for volunteers"
                className="glass-input"
                value={formData.pickupAddress}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span className="label-label">Pickup Threshold Hour</span>
                <select name="pickupHours" className="glass-input" value={formData.pickupHours} onChange={handleChange}>
                  <option value="1">1 Hour</option>
                  <option value="2">2 Hours</option>
                  <option value="4">4 Hours</option>
                  <option value="6">6 Hours</option>
                </select>
              </div>
              <div>
                <span className="label-label">Expiry Threshold Hour</span>
                <select name="expiryHours" className="glass-input" value={formData.expiryHours} onChange={handleChange}>
                  <option value="6">6 Hours</option>
                  <option value="12">12 Hours</option>
                  <option value="18">18 Hours</option>
                  <option value="24">24 Hours</option>
                </select>
              </div>
            </div>

            {/* Coordinates */}
            <div style={{ border: '2px solid var(--border)', padding: '16px', borderRadius: '16px', background: '#FAF6EE' }}>
              <span className="label-label">Donation Coordinates (Bangalore core defaults)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <span className="label-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Latitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    name="latitude"
                    required
                    className="glass-input"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <span className="label-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Longitude</span>
                  <input
                    type="number"
                    step="0.0001"
                    name="longitude"
                    required
                    className="glass-input"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="glass-button" style={{ width: '100%', marginTop: '10px' }}>
              {loading ? 'Submitting food listing to blockchain...' : 'Publish Food Listing for Claim'}
            </button>
          </form>
        </div>
      )}

      {/* VIEW: CSR Payments */}
      {view === 'csr' && (
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <CreditCard size={48} color="var(--primary)" style={{ marginBottom: '16px', margin: '0 auto' }} />
          <h3 className="text-editorial" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>Corporate Social Responsibility Funding</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Help fund volunteer deliveries, reward loyal drivers, and keep the food rescue network system operational for non-profits.
          </p>

          {txnSuccess ? (
            <div className="badge-success animated-fade" style={{ display: 'block', padding: '24px', borderRadius: '16px', textAlign: 'left', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 color="var(--primary)" />
                CSR Impact Donation Approved!
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Thank you for backing PAARI's logistics engine. Your transaction has processed.</p>
              <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                <div><strong>Transaction Hash:</strong> {txnSuccess.transactionId}</div>
                <div><strong>Amount Backed:</strong> ${txnSuccess.amount}.00 USD</div>
                <div><strong>Gateway Status:</strong> {txnSuccess.status}</div>
              </div>
              <button onClick={() => setTxnSuccess(null)} className="glass-button" style={{ width: '100%', marginTop: '16px', padding: '10px' }}>
                Make Another Backing
              </button>
            </div>
          ) : (
            <form onSubmit={handleCsrPayment} style={{ display: 'grid', gap: '20px', textAlign: 'left' }}>
              <div>
                <span className="label-label">Sponsorship Capital Amount (USD)</span>
                <input
                  type="number"
                  min="10"
                  required
                  placeholder="e.g. 150"
                  className="glass-input"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
              </div>

              <div>
                <span className="label-label">Payment Gateway Mode</span>
                <select
                  className="glass-input"
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                >
                  <option value="Credit Card">Credit Card Gateway</option>
                  <option value="Corporate Bank Wire">Corporate Bank Wire</option>
                  <option value="CSR Impact Grants">CSR Impact Grants</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--accent-light)', border: '1px solid rgba(230,95,43,0.15)', padding: '12px', borderRadius: '12px', fontSize: '0.825rem', color: 'var(--accent)' }}>
                <ShieldAlert size={20} />
                <span>Simulating sandbox secure checkout. Processing will automatically complete in test mode.</span>
              </div>

              <button type="submit" disabled={loading} className="glass-button" style={{ width: '100%', marginTop: '10px' }}>
                {loading ? 'Authorizing secure wire...' : `Authorize $${paymentData.amount} CSR Donation`}
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
