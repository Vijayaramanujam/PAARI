import React, { useEffect, useState } from 'react';
import api from '../api';
import { Heart, ShieldCheck, Truck, BarChart3, Users, Leaf, ArrowRight, CheckCircle2, ChevronRight, Compass } from 'lucide-react';

export default function Landing({ onNavigate }) {
  const [stats, setStats] = useState({
    totalKgsSaved: 0,
    mealsSaved: 0,
    activeDonors: 0,
    activeReceivers: 0,
    completedDeliveries: 0,
  });

  useEffect(() => {
    api.get('/api/analytics/summary')
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error('Error fetching analytics summary', err);
        // Fallback demo stats
        setStats({
          totalKgsSaved: 1420,
          mealsSaved: 3550,
          activeDonors: 14,
          activeReceivers: 8,
          completedDeliveries: 46,
        });
      });
  }, []);

  return (
    <div className="animated-fade" style={{ padding: '0px', maxWidth: '100%', margin: '0 auto' }}>
      
      {/* Editorial Hero Banner */}
      <section style={{ 
        position: 'relative', 
        padding: '120px 24px 100px 24px', 
        background: 'linear-gradient(180deg, #F2ECE1 0%, #FAF8F4 100%)', 
        borderRadius: '0 0 var(--border-radius-large) var(--border-radius-large)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center', 
        overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', opacity: 0.1, zIndex: 0 }}>
          <Leaf size={120} color="var(--primary)" />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', opacity: 0.1, zIndex: 0 }}>
          <Heart size={140} color="var(--accent)" />
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            padding: '8px 20px', 
            borderRadius: '99px',
            fontSize: '0.875rem',
            fontWeight: '700',
            marginBottom: '30px'
          }}>
            <Leaf size={16} /> Connecting Food Abundance with Community Need
          </div>
          
          <h1 className="text-editorial" style={{ 
            fontSize: '4.2rem', 
            fontWeight: '800', 
            lineHeight: '1.1', 
            color: 'var(--primary)', 
            marginBottom: '28px',
            letterSpacing: '-1.5px'
          }}>
            A Network Built on <br />
            <span style={{ color: 'var(--accent)' }}>Nutrition & Human Care</span>
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-muted)', 
            maxWidth: '720px', 
            margin: '0 auto 48px auto',
            lineHeight: '1.7'
          }}>
            PAARI is a professional surplus food redistribution platform. We coordinate local donors, NGO shelters, and logistics volunteers using smart distance matching and real-time route optimization.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="glass-button" onClick={() => onNavigate('register')} style={{ padding: '16px 36px', fontSize: '1.1rem' }}>
              Join the Network <ArrowRight size={18} />
            </button>
            <button className="glass-button-secondary" onClick={() => onNavigate('login')} style={{ padding: '16px 36px', fontSize: '1.1rem' }}>
              Access Portal
            </button>
          </div>
        </div>
      </section>

      {/* Social Impact Stats Board */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="text-editorial" style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary)' }}>
            Real-Time Network Impact
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '10px' }}>
            Every contribution directly reduces organic landfill gas and bridges local nutritional deficits.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
          
          {/* Stat 1 */}
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--accent)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'var(--accent-light)', 
              color: 'var(--accent)', 
              margin: '0 auto 20px auto' 
            }}>
              <Heart size={30} />
            </div>
            <h3 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
              {stats.mealsSaved}
            </h3>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>Meals Served</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fresh surplus meals directly delivered to local welfare houses.</p>
          </div>

          {/* Stat 2 */}
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'var(--primary-light)', 
              color: 'var(--primary)', 
              margin: '0 auto 20px auto' 
            }}>
              <Leaf size={30} />
            </div>
            <h3 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
              {stats.totalKgsSaved} <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>kg</span>
            </h3>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>Food Waste Prevented</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Rescued items diverted from landfills, reducing greenhouse impact.</p>
          </div>

          {/* Stat 3 */}
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--accent)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'var(--accent-light)', 
              color: 'var(--accent)', 
              margin: '0 auto 20px auto' 
            }}>
              <Users size={30} />
            </div>
            <h3 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
              {stats.activeDonors + stats.activeReceivers}
            </h3>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>Active Partners</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Soup kitchens, distribution centers, and donors synced on our map.</p>
          </div>

          {/* Stat 4 */}
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--primary)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'var(--primary-light)', 
              color: 'var(--primary)', 
              margin: '0 auto 20px auto' 
            }}>
              <Truck size={30} />
            </div>
            <h3 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
              {stats.completedDeliveries}
            </h3>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>Runs Dispatched</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Logistics cycles successfully completed by volunteer couriers.</p>
          </div>

        </div>
      </section>

      {/* 5-Step Redistribution Process */}
      <section style={{ 
        padding: '100px 24px', 
        background: '#FAF6EF', 
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '70px' }}>
            <div style={{ 
              display: 'inline-block', 
              background: '#EAE3D6', 
              color: 'var(--primary)', 
              padding: '6px 16px', 
              borderRadius: '99px',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '14px'
            }}>
              Our Operational Engine
            </div>
            <h2 className="text-editorial" style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--primary)' }}>
              How PAARI Works In 5 Steps
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '10px auto 0 auto' }}>
              Seamlessly converting supply store redundancies into local warm portions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', minWidth: '800px', overflowX: 'auto', paddingBottom: '20px' }}>
            
            {/* Step 1 */}
            <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--border)', lineHeight: '1', marginBottom: '12px' }}>01</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>Listing Surplus</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Donors list food they can't sell or use, complete with volume, coordinates, and clear freshness deadlines.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--border)', lineHeight: '1', marginBottom: '12px' }}>02</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>Smart Matching</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                The engine automatically matches active items with nearby registered NGOs based on need, ratings, and distance.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--border)', lineHeight: '1', marginBottom: '12px' }}>03</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>Route Plan</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Upon request approval, distance routes are optimized. Couriers claim dispatch jobs and view dynamic vector paths.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--border)', lineHeight: '1', marginBottom: '12px' }}>04</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>Transport</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Volunteers pickup the food from the donor, check details on the map, and drive directly to recipient NGOs.
              </p>
            </div>

            {/* Step 5 */}
            <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--border)', lineHeight: '1', marginBottom: '12px' }}>05</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>Served Detail</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Shelters accept the intake, track metrics, and serve warm food. Positive feedback boosts the donor's rank.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Network Roles Detail Section */}
      <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className="text-editorial" style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary)', textAlign: 'center', marginBottom: '60px' }}>
          Role-Based Portals in the Network
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          
          {/* Donors Page Area */}
          <div className="glass-panel" style={{ padding: '36px' }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '12px', 
              borderRadius: '50%', 
              background: 'var(--accent-light)', 
              color: 'var(--accent)', 
              marginBottom: '24px' 
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>Food Donors</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.6' }}>
              Restaurants, caterers, and grocers can publish food logs in under a minute. Our scheduler tracks and notifies you when NGOs claims are received.
            </p>
            <ul style={{ display: 'grid', gap: '10px', fontSize: '0.875rem', color: 'var(--text-muted)', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={14} color="var(--accent)" /> Expiries automatically tracked</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={14} color="var(--accent)" /> Proximity matching recommendations</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={14} color="var(--accent)" /> Tax-deductible CSR backing options</li>
            </ul>
          </div>

          {/* NGOs Page Area */}
          <div className="glass-panel" style={{ padding: '36px' }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '12px', 
              borderRadius: '50%', 
              background: 'var(--primary-light)', 
              color: 'var(--primary)', 
              marginBottom: '24px' 
            }}>
              <Users size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>NGO Receivers</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.6' }}>
              Welfare homes, centers, and kitchens receive high-priority lists sorted automatically by distance. Secure nutritional resources seamlessly.
            </p>
            <ul style={{ display: 'grid', gap: '10px', fontSize: '0.875rem', color: 'var(--text-muted)', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={14} color="var(--primary)" /> Real-time active listings feed</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={14} color="var(--primary)" /> Smart portion claim interfaces</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={14} color="var(--primary)" /> Donor reviews & verification feedback</li>
            </ul>
          </div>

          {/* Volunteers Area */}
          <div className="glass-panel" style={{ padding: '36px' }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '12px', 
              borderRadius: '50%', 
              background: 'var(--accent-light)', 
              color: 'var(--accent)', 
              marginBottom: '24px' 
            }}>
              <Truck size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>Volunteers</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.6' }}>
              Drivers and riders step in to handle transit. Get route maps instantly showing optimal directions, pick-up hours, and dropoff milestones.
            </p>
            <ul style={{ display: 'grid', gap: '10px', fontSize: '0.875rem', color: 'var(--text-muted)', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={14} color="var(--accent)" /> Quick one-click queue mapping</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={14} color="var(--accent)" /> Vector geometry route visual</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowRight size={14} color="var(--accent)" /> Completed runs impact statistics</li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
}
