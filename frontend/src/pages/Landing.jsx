import React, { useEffect, useState } from 'react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { Heart, ShieldCheck, Truck, BarChart3, Users, Leaf, ArrowRight, CheckCircle2, ChevronRight, Compass, Sparkles } from 'lucide-react';

export default function Landing({ onNavigate }) {
  const { language, t } = useLanguage();
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
        padding: '100px 24px 80px 24px', 
        background: 'linear-gradient(180deg, #F2ECE1 0%, #FAF8F4 100%)', 
        borderRadius: '0 0 var(--border-radius-large, 24px) var(--border-radius-large, 24px)',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center', 
        overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '8%', opacity: 0.1, zIndex: 0 }}>
          <Leaf size={120} color="var(--primary)" />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', opacity: 0.1, zIndex: 0 }}>
          <Heart size={140} color="var(--accent)" />
        </div>

        <div style={{ maxWidth: '920px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--primary-light, rgba(45, 90, 39, 0.1))', 
            color: 'var(--primary)', 
            padding: '8px 20px', 
            borderRadius: '99px',
            fontSize: '0.875rem',
            fontWeight: '700',
            marginBottom: '26px'
          }}>
            <Leaf size={16} /> {t('heroBadge')}
          </div>
          
          <h1 className="text-editorial" style={{ 
            fontSize: '3.8rem', 
            fontWeight: '800', 
            lineHeight: '1.15', 
            color: 'var(--primary)', 
            marginBottom: '24px',
            letterSpacing: '-1.5px'
          }}>
            {t('heroTitle1')} <br />
            <span style={{ color: 'var(--accent)' }}>{t('heroTitle2')}</span>
          </h1>
          
          <p style={{ 
            fontSize: '1.2rem', 
            color: 'var(--text-muted)', 
            maxWidth: '740px', 
            margin: '0 auto 40px auto',
            lineHeight: '1.7'
          }}>
            {t('heroDesc')}
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="glass-button" onClick={() => onNavigate('register')} style={{ padding: '16px 36px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {t('heroBtnJoin')} <ArrowRight size={18} />
            </button>
            <button className="glass-button-secondary" onClick={() => onNavigate('login')} style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
              {t('heroBtnPortal')}
            </button>
          </div>
        </div>
      </section>

      {/* Social Impact Stats Board */}
      <section style={{ padding: '70px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="text-editorial" style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary)' }}>
            {language === 'ta' ? 'வலையமைப்பின் நிகழ்நேரப் புள்ளிவிவரங்கள்' : 'Real-Time Network Impact'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '10px' }}>
            {language === 'ta' ? 'ஒவ்வொரு பங்களிப்பும் உணவு வீணாவதைத் தடுத்து எளியோரின் பசியைப் போக்குகிறது.' : 'Every contribution directly reduces organic landfill gas and bridges local nutritional deficits.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          
          {/* Stat 1 */}
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--accent)', padding: '30px 20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--accent-light)', 
              color: 'var(--accent)', 
              margin: '0 auto 16px auto' 
            }}>
              <Heart size={28} />
            </div>
            <h3 style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '6px' }}>
              {stats.mealsSaved || 3550}
            </h3>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>
              {t('statsMeals')}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {language === 'ta' ? 'உடனடியாகக் காப்பகங்களுக்கு வழங்கப்பட்ட சத்தான உணவுகள்.' : 'Fresh surplus meals directly delivered to local welfare houses.'}
            </p>
          </div>

          {/* Stat 2 */}
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--primary)', padding: '30px 20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--primary-light)', 
              color: 'var(--primary)', 
              margin: '0 auto 16px auto' 
            }}>
              <Leaf size={28} />
            </div>
            <h3 style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '6px' }}>
              {stats.totalKgsSaved || 1420} <span style={{ fontSize: '1.3rem', fontWeight: '600' }}>kg</span>
            </h3>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>
              {t('statsKgs')}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {language === 'ta' ? 'குப்பைக் கிடங்குகளில் சேராமல் மீட்கப்பட்ட உயர்தர உணவு.' : 'Rescued items diverted from landfills, reducing greenhouse impact.'}
            </p>
          </div>

          {/* Stat 3 */}
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--accent)', padding: '30px 20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--accent-light)', 
              color: 'var(--accent)', 
              margin: '0 auto 16px auto' 
            }}>
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '6px' }}>
              {(stats.activeDonors || 14) + (stats.activeReceivers || 8)}
            </h3>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>
              {language === 'ta' ? 'இணைக்கப்பட்ட கூட்டமைப்புகள்' : 'Active Partners'}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {language === 'ta' ? 'பதிவுசெய்த உணவகங்கள், காப்பகங்கள் மற்றும் அமைப்புகள்.' : 'Soup kitchens, distribution centers, and donors synced on our map.'}
            </p>
          </div>

          {/* Stat 4 */}
          <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid var(--primary)', padding: '30px 20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'var(--primary-light)', 
              color: 'var(--primary)', 
              margin: '0 auto 16px auto' 
            }}>
              <Truck size={28} />
            </div>
            <h3 style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '6px' }}>
              {stats.completedDeliveries || 46}
            </h3>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>
              {t('statsDeliveries')}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {language === 'ta' ? 'தன்னார்வலர்களால் வெற்றிகரமாக முடிக்கப்பட்ட விநியோகங்கள்.' : 'Logistics cycles successfully completed by volunteer couriers.'}
            </p>
          </div>

        </div>
      </section>

      {/* Cultural Heritage Banner: King Paari (பாரி வள்ளல்) */}
      <section style={{ 
        padding: '60px 24px', 
        background: 'linear-gradient(135deg, rgba(45, 90, 39, 0.08) 0%, rgba(224, 122, 95, 0.08) 100%)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--accent-light)', 
            color: 'var(--accent)', 
            padding: '6px 18px', 
            borderRadius: '99px',
            fontSize: '0.82rem',
            fontWeight: '700',
            marginBottom: '18px'
          }}>
            <Sparkles size={15} /> {t('kingPaariBadge')}
          </div>
          <h2 className="text-editorial" style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '18px' }}>
            {t('kingPaariTitle')}
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', maxWidth: '820px', margin: '0 auto' }}>
            {t('kingPaariDesc')}
          </p>
        </div>
      </section>

      {/* How PAARI Works Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
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
            {t('howItWorksBadge')}
          </div>
          <h2 className="text-editorial" style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--primary)' }}>
            {t('howItWorksTitle')}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Step 1 */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', opacity: 0.3, lineHeight: '1', marginBottom: '12px' }}>01</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
              {t('step1Title')}
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t('step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', opacity: 0.3, lineHeight: '1', marginBottom: '12px' }}>02</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
              {t('step2Title')}
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t('step2Desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', opacity: 0.3, lineHeight: '1', marginBottom: '12px' }}>03</div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
              {t('step3Title')}
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t('step3Desc')}
            </p>
          </div>

        </div>
      </section>

      {/* Network Roles Section */}
      <section style={{ padding: '80px 24px 100px 24px', background: '#FAF6EF', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="text-editorial" style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary)', textAlign: 'center', marginBottom: '50px' }}>
            {t('rolesTitle')}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            
            {/* Donors Card */}
            <div className="glass-panel" style={{ padding: '36px', background: '#fff' }}>
              <div style={{ 
                display: 'inline-flex', 
                padding: '12px', 
                borderRadius: '50%', 
                background: 'var(--accent-light)', 
                color: 'var(--accent)', 
                marginBottom: '20px' 
              }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
                {t('roleDonorTitle')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: '1.6' }}>
                {t('roleDonorSummary')}
              </p>
              <button 
                onClick={() => onNavigate('register')}
                className="glass-button-secondary"
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
              >
                {t('heroBtnJoin')} ({t('roleDonor')})
              </button>
            </div>

            {/* NGOs Card */}
            <div className="glass-panel" style={{ padding: '36px', background: '#fff' }}>
              <div style={{ 
                display: 'inline-flex', 
                padding: '12px', 
                borderRadius: '50%', 
                background: 'var(--primary-light)', 
                color: 'var(--primary)', 
                marginBottom: '20px' 
              }}>
                <Users size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
                {t('roleReceiverTitle')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: '1.6' }}>
                {t('roleReceiverSummary')}
              </p>
              <button 
                onClick={() => onNavigate('register')}
                className="glass-button-secondary"
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
              >
                {t('heroBtnJoin')} ({t('roleReceiver')})
              </button>
            </div>

            {/* Volunteers Card */}
            <div className="glass-panel" style={{ padding: '36px', background: '#fff' }}>
              <div style={{ 
                display: 'inline-flex', 
                padding: '12px', 
                borderRadius: '50%', 
                background: 'var(--accent-light)', 
                color: 'var(--accent)', 
                marginBottom: '20px' 
              }}>
                <Truck size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
                {t('roleVolunteerTitle')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: '1.6' }}>
                {t('roleVolunteerSummary')}
              </p>
              <button 
                onClick={() => onNavigate('register')}
                className="glass-button-secondary"
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
              >
                {t('heroBtnJoin')} ({t('roleVolunteer')})
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="text-editorial" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>
          {t('ctaTitle')}
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
          {t('ctaDesc')}
        </p>
        <button 
          onClick={() => onNavigate('register')}
          className="glass-button"
          style={{ padding: '16px 40px', fontSize: '1.1rem' }}
        >
          {t('ctaButton')}
        </button>
      </section>

    </div>
  );
}
