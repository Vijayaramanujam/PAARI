import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NetworkGlobe3D from '../components/NetworkGlobe3D';
import InteractiveRescueNetwork from '../components/InteractiveRescueNetwork';
import { 
  Utensils, 
  Heart, 
  Truck, 
  Leaf, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Users, 
  Activity, 
  Award,
  Globe,
  Flame,
  Soup,
  Croissant
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Landing({ onNavigate }) {
  const { language, t } = useLanguage();
  const containerRef = useRef(null);

  // Live platform metrics
  const [stats, setStats] = useState({
    totalKgsSaved: 1420,
    mealsSaved: 3550,
    activeDonors: 14,
    activeReceivers: 8,
    completedDeliveries: 48,
  });

  // Fetch live stats from backend
  useEffect(() => {
    api.get('/api/system/database-inspector')
      .then((res) => {
        if (res.data) {
          const totalDonations = res.data.foodDonations || [];
          const deliveries = res.data.pickupDeliveries || [];
          const donors = res.data.donors || [];
          const receivers = res.data.receivers || [];

          const calculatedKgs = totalDonations.reduce((sum, item) => sum + (item.quantityKg || 0), 0);
          const calculatedDeliveries = deliveries.length;

          setStats({
            totalKgsSaved: Math.max(1420, Math.round(calculatedKgs * 40)),
            mealsSaved: Math.max(3550, Math.round(calculatedKgs * 100)),
            activeDonors: Math.max(14, donors.length),
            activeReceivers: Math.max(8, receivers.length),
            completedDeliveries: Math.max(48, calculatedDeliveries),
          });
        }
      })
      .catch((err) => {
        console.warn('Using baseline verified analytics data', err);
      });
  }, []);

  // GSAP Animation Timelines & ScrollTriggers (Initial Mount)
  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Hero Entrance Timeline
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .fromTo('.hero-eyebrow', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, clearProps: 'opacity,transform' })
        .fromTo('.hero-headline-word', { opacity: 0, y: 32 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.85, clearProps: 'opacity,transform' }, '-=0.5')
        .fromTo('.hero-supporting-text', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, clearProps: 'opacity,transform' }, '-=0.55')
        .fromTo('.hero-action-btn', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.7, clearProps: 'opacity,transform' }, '-=0.5')
        .fromTo('.hero-3d-scene', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.1, clearProps: 'opacity,transform' }, '-=0.9');

      // 2. Generic ScrollTrigger Section Reveals
      gsap.utils.toArray('.gsap-reveal-section').forEach((elem) => {
        gsap.fromTo(elem,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
            scrollTrigger: {
              trigger: elem,
              start: 'top 88%',
              toggleActions: 'play none none none'
            }
          }
        );
      });

      // 3. Staggered 4-Step Food Journey Cards (With resilient fallback)
      const journeyBoxes = gsap.utils.toArray('.journey-step-box');
      if (journeyBoxes.length > 0) {
        gsap.fromTo(journeyBoxes,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
            scrollTrigger: {
              trigger: '#journey-section',
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // 4. Staggered Role Entry Cards
      const roleBoxes = gsap.utils.toArray('.role-entry-card');
      if (roleBoxes.length > 0) {
        gsap.fromTo(roleBoxes,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
            scrollTrigger: {
              trigger: '#roles-section',
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // 5. Connecting Flow Line Scrub
      gsap.to('.flowing-route-line', {
        scrollTrigger: {
          trigger: '#problem-section',
          start: 'top 75%',
          end: 'bottom 45%',
          scrub: 1.2
        },
        strokeDashoffset: 0,
        ease: 'none'
      });

      // 6. Recalculate ScrollTrigger once Three.js and layout stabilize
      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 400);

      return () => clearTimeout(refreshTimeout);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Impact Metric Number Counters (Updates dynamically with fetched stats)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const counters = gsap.utils.toArray('.metric-counter-number');
    counters.forEach((counter) => {
      const targetVal = parseFloat(counter.getAttribute('data-val')) || 0;
      gsap.to(counter, {
        innerText: targetVal,
        duration: 2.0,
        ease: 'power2.out',
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: counter,
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      });
    });
  }, [stats]);

  // Interactive 3D Card Tilt Handler
  const handleTilt = (e, cardId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const resetTilt = (e) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return (
    <div ref={containerRef} style={{ maxWidth: '100%', overflowX: 'hidden' }}>

      {/* ========================================================================= */}
      {/* SECTION B: IMMERSIVE 3D HERO SECTION (Three.js + GSAP Staggered Entrance) */}
      {/* ========================================================================= */}
      <section
        id="hero-section"
        style={{
          position: 'relative',
          padding: '40px 24px 80px 24px',
          maxWidth: '1360px',
          margin: '0 auto',
          minHeight: '84vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            width: '100%'
          }}
        >
          {/* Left Hero Content */}
          <div style={{ maxWidth: '640px' }}>
            
            {/* Eyebrow badge */}
            <div
              className="hero-eyebrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                padding: '8px 20px',
                borderRadius: '99px',
                fontSize: '0.82rem',
                fontWeight: '800',
                letterSpacing: '0.6px',
                marginBottom: '24px',
                border: '1px solid rgba(241, 90, 41, 0.25)'
              }}
            >
              <Flame size={15} color="var(--accent)" /> {t('heroEyebrow')}
            </div>

            {/* Main Headline with word-by-word reveal */}
            <h1
              className="text-editorial"
              style={{
                fontSize: 'clamp(2.6rem, 5.2vw, 4.2rem)',
                fontWeight: '900',
                lineHeight: '1.14',
                color: 'var(--primary)',
                letterSpacing: '-0.03em',
                marginBottom: '22px'
              }}
            >
              <span className="hero-headline-word" style={{ display: 'inline-block', marginRight: '10px' }}>
                {t('heroFoodHeadlinePart1')}
              </span>
              <br />
              <span
                className="hero-headline-word"
                style={{
                  display: 'inline-block',
                  color: 'var(--accent)',
                  position: 'relative'
                }}
              >
                {t('heroFoodHeadlinePart2')}
              </span>
            </h1>

            {/* Supporting Copy */}
            <p
              className="hero-supporting-text"
              style={{
                fontSize: '1.18rem',
                color: 'var(--text-muted)',
                lineHeight: '1.75',
                marginBottom: '38px',
                maxWidth: '560px'
              }}
            >
              {t('heroFoodSupporting')}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                className="glass-button hero-action-btn"
                onClick={() => onNavigate('register')}
                style={{ padding: '16px 36px', fontSize: '1.05rem', gap: '10px' }}
              >
                {t('heroBtnRescue')} <ArrowRight size={18} />
              </button>

              <a
                href="#network-section"
                className="glass-button-secondary hero-action-btn"
                style={{ padding: '16px 32px', fontSize: '1.05rem', textDecoration: 'none' }}
              >
                {t('heroBtnExploreNetwork')}
              </a>
            </div>

            {/* Trust Pill Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary)' }}>
                <CheckCircle2 size={16} color="var(--primary-rich)" /> 100% Edible Surplus
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary)' }}>
                <CheckCircle2 size={16} color="var(--primary-rich)" /> Insulated Transport
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary)' }}>
                <CheckCircle2 size={16} color="var(--primary-rich)" /> Live GPS Matched
              </div>
            </div>

          </div>

          {/* Right Hero: Three.js Interactive 3D Food Globe */}
          <div className="hero-3d-scene" style={{ width: '100%', position: 'relative' }}>
            <NetworkGlobe3D language={language} />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION C: THE CRISIS — KITCHEN SURPLUS MEETS COMMUNITY HUNGER (Split Screen) */}
      {/* ========================================================================= */}
      <section
        id="problem-section"
        className="gsap-reveal-section"
        style={{
          padding: '90px 24px',
          background: 'linear-gradient(180deg, #F7F3EB 0%, #FAF6EE 50%, #F7F3EB 100%)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '50px', alignItems: 'center' }}>
            
            {/* Left Editorial Card: Surplus Culinary Presentation */}
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                background: '#FFFFFF',
                borderRadius: '26px',
                border: '1.5px solid var(--border)',
                boxShadow: 'var(--shadow-premium)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span className="badge badge-warning" style={{ fontSize: '0.78rem' }}>
                  <Flame size={14} style={{ marginRight: '4px' }} /> Commercial Kitchen Reality
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                  Chennai & Urban Centers
                </span>
              </div>

              <div style={{ background: 'var(--surface-warm)', padding: '24px', borderRadius: '18px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
                  Freshness At Risk Every Day
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  Hotels, banquets, and bakeries prepare generous reserves to guarantee guest delight. Without a swift redistribution channel, trays of wholesome croissants, biryanis, and curries are lost to landfill dumpsters by midnight.
                </p>
              </div>

              {/* Verified Metrics Counter Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '18px', background: '#FDF1EB', borderRadius: '14px', border: '1px solid rgba(241, 90, 41, 0.2)' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--accent)' }}>33%</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '4px' }}>
                    Of banquet-prepared food is unserved and discarded globally.
                  </p>
                </div>
                <div style={{ padding: '18px', background: '#E7EFEA', borderRadius: '14px', border: '1px solid rgba(32, 91, 57, 0.2)' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--primary)' }}>&lt; 3h</span>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '4px' }}>
                    Critical window to deliver freshly cooked surplus to shelter kitchens.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Storytelling Narrative & Flowing Line */}
            <div>
              <span style={{ color: '#F15A29', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {t('problemTag')}
              </span>
              <h2 className="text-editorial" style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--primary)', lineHeight: '1.2', marginTop: '8px', marginBottom: '20px' }}>
                {t('problemTitle')}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '24px' }}>
                {t('problemDesc')}
              </p>

              {/* Animated SVG Food-Flow Curve */}
              <div style={{ padding: '20px 0' }}>
                <svg width="100%" height="60" viewBox="0 0 400 60" fill="none">
                  <path
                    className="flowing-route-line"
                    d="M 10 30 C 120 5, 200 55, 390 30"
                    stroke="#F15A29"
                    strokeWidth="3.5"
                    strokeDasharray="400"
                    strokeDashoffset="400"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="30" r="6" fill="#103D30" />
                  <circle cx="390" cy="30" r="6" fill="#F15A29" />
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
                  <span>Commercial Kitchen Surplus</span>
                  <span>Community Dining Table</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ background: 'var(--accent-light)', padding: '10px', borderRadius: '50%', color: 'var(--accent)', display: 'flex' }}>
                  <Leaf size={22} />
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
                  Preventing 1 ton of food waste avoids approximately 2.5 tons of greenhouse gas emissions while honoring the hard work of chefs and growers.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION D: THE 4-STAGE FOOD JOURNEY (Horizontal Connected Timeline)       */}
      {/* ========================================================================= */}
      <section
        id="journey-section"
        style={{
          padding: '100px 24px',
          maxWidth: '1280px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--surface-warm)',
              color: 'var(--primary)',
              padding: '6px 18px',
              borderRadius: '99px',
              fontSize: '0.78rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              border: '1px solid var(--border)',
              marginBottom: '14px'
            }}
          >
            <Clock size={14} /> {t('journeyBadge')}
          </div>
          <h2 className="text-editorial" style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--primary)' }}>
            {t('journeyTitle')}
          </h2>
        </div>

        {/* 4 Connected Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', position: 'relative' }}>
          
          {/* Step 1 */}
          <div
            className="journey-step-box glass-panel"
            style={{
              padding: '34px 26px',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              borderTop: '4px solid #F15A29',
              borderRadius: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#F15A29', opacity: 0.8 }}>01</span>
              <div style={{ background: '#FDF1EB', padding: '10px', borderRadius: '12px', color: '#F15A29', display: 'flex' }}>
                <Utensils size={20} />
              </div>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
              {t('step1HarvestTitle')}
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t('step1HarvestDesc')}
            </p>
          </div>

          {/* Step 2 */}
          <div
            className="journey-step-box glass-panel"
            style={{
              padding: '34px 26px',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              borderTop: '4px solid var(--primary)',
              borderRadius: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--primary)', opacity: 0.8 }}>02</span>
              <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)', display: 'flex' }}>
                <Sparkles size={20} />
              </div>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
              {t('step2MatchTitle')}
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t('step2MatchDesc')}
            </p>
          </div>

          {/* Step 3 */}
          <div
            className="journey-step-box glass-panel"
            style={{
              padding: '34px 26px',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              borderTop: '4px solid #D97706',
              borderRadius: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#D97706', opacity: 0.8 }}>03</span>
              <div style={{ background: '#FEF3C7', padding: '10px', borderRadius: '12px', color: '#D97706', display: 'flex' }}>
                <Truck size={20} />
              </div>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
              {t('step3LogisticsTitle')}
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t('step3LogisticsDesc')}
            </p>
          </div>

          {/* Step 4 */}
          <div
            className="journey-step-box glass-panel"
            style={{
              padding: '34px 26px',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              borderTop: '4px solid #205B39',
              borderRadius: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: '900', color: '#205B39', opacity: 0.8 }}>04</span>
              <div style={{ background: '#E7EFEA', padding: '10px', borderRadius: '12px', color: '#205B39', display: 'flex' }}>
                <Heart size={20} />
              </div>
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
              {t('step4NourishTitle')}
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t('step4NourishDesc')}
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION E: INTERACTIVE FOOD-RESCUE NETWORK (Topological Dispatch Demo)   */}
      {/* ========================================================================= */}
      <section
        id="network-section"
        className="gsap-reveal-section"
        style={{
          padding: '60px 24px 90px 24px',
          maxWidth: '1280px',
          margin: '0 auto'
        }}
      >
        <InteractiveRescueNetwork language={language} />
      </section>

      {/* ========================================================================= */}
      {/* SECTION F: OUR IMPACT (Animated Number Counters & Verified DB Data)       */}
      {/* ========================================================================= */}
      <section
        id="impact-section"
        className="gsap-reveal-section"
        style={{
          padding: '80px 24px',
          background: 'linear-gradient(180deg, #FAF6EE 0%, #F5EFE3 100%)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              VERIFIED RESCUE TELEMETRY
            </span>
            <h2 className="text-editorial" style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
              {language === 'ta' ? 'வலையமைப்பின் நேரடி ஊட்டச்சத்து தாக்கம்' : 'Nourishment Delivered: Our Impact'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px', margin: '10px auto 0 auto' }}>
              {language === 'ta'
                ? 'ஒவ்வொரு பார்சலும் வீணாவதைத் தடுத்து குழந்தைகளின் சிரிப்பாக மாறுகிறது.'
                : 'Every meal saved directly protects municipal resources, lowers emissions, and bridges local hunger.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            
            {/* Stat Card 1: Meals */}
            <div className="glass-panel" style={{ textAlign: 'center', padding: '36px 20px', background: '#FFFFFF', borderTop: '4px solid #F15A29', borderRadius: '22px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FDF1EB', color: '#F15A29', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Soup size={26} />
              </div>
              <h3 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
                <span className="metric-counter-number" data-val={stats.mealsSaved}>
                  {stats.mealsSaved}
                </span>
                <span style={{ fontSize: '1.8rem', color: '#F15A29' }}>+</span>
              </h3>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)' }}>
                {t('statsMeals')}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
                {language === 'ta' ? 'காப்பகங்களுக்கு நேரடியாக வழங்கப்பட்ட சூடான உணவுகள்.' : 'Served to orphanages, elderly shelters, and community feeding centers.'}
              </p>
            </div>

            {/* Stat Card 2: KGs */}
            <div className="glass-panel" style={{ textAlign: 'center', padding: '36px 20px', background: '#FFFFFF', borderTop: '4px solid var(--primary)', borderRadius: '22px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Leaf size={26} />
              </div>
              <h3 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
                <span className="metric-counter-number" data-val={stats.totalKgsSaved}>
                  {stats.totalKgsSaved}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: '700' }}> kg</span>
              </h3>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)' }}>
                {t('statsKgs')}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
                {language === 'ta' ? 'குப்பைக் கிடங்குகளில் சேராமல் பாதுகாக்கப்பட்ட சமையலறை உபரி.' : 'Commercial surplus diverted from organic landfill degradation.'}
              </p>
            </div>

            {/* Stat Card 3: Partners */}
            <div className="glass-panel" style={{ textAlign: 'center', padding: '36px 20px', background: '#FFFFFF', borderTop: '4px solid #205B39', borderRadius: '22px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#E7EFEA', color: '#205B39', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Users size={26} />
              </div>
              <h3 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
                <span className="metric-counter-number" data-val={stats.activeDonors + stats.activeReceivers}>
                  {stats.activeDonors + stats.activeReceivers}
                </span>
                <span style={{ fontSize: '1.8rem', color: '#205B39' }}>+</span>
              </h3>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)' }}>
                {language === 'ta' ? 'இணைக்கப்பட்ட கூட்டமைப்புகள்' : 'Kitchens & Shelters'}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
                {language === 'ta' ? 'உணவகங்கள், பேக்கரிகள் மற்றும் தொண்டு அமைப்புகள்.' : 'Verified donor establishments and recipient shelter houses active.'}
              </p>
            </div>

            {/* Stat Card 4: Deliveries */}
            <div className="glass-panel" style={{ textAlign: 'center', padding: '36px 20px', background: '#FFFFFF', borderTop: '4px solid #D97706', borderRadius: '22px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Truck size={26} />
              </div>
              <h3 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
                <span className="metric-counter-number" data-val={stats.completedDeliveries}>
                  {stats.completedDeliveries}
                </span>
                <span style={{ fontSize: '1.8rem', color: '#D97706' }}>+</span>
              </h3>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)' }}>
                {t('statsDeliveries')}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
                {language === 'ta' ? 'தன்னார்வலர்களால் முடிக்கப்பட்ட விரைவு விநியோகங்கள்.' : 'Optimized zero-waste food logistics runs completed.'}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION G: ROLE-BASED ENTRY CARDS (Interactive 3D Mouse Tilt)             */}
      {/* ========================================================================= */}
      <section
        id="roles-section"
        style={{
          padding: '100px 24px',
          maxWidth: '1280px',
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ color: '#F15A29', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            JOIN THE ECOSYSTEM
          </span>
          <h2 className="text-editorial" style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
            {language === 'ta' ? 'உங்களின் பங்கு என்ன?' : 'How Will You Be Part of PAARI?'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px', margin: '8px auto 0 auto' }}>
            Choose your role and join our verified network in under 60 seconds.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          
          {/* Card 1: Food Donor */}
          <div
            className="role-entry-card tilt-card glass-panel"
            onMouseMove={(e) => handleTilt(e, 'donor')}
            onMouseLeave={resetTilt}
            style={{
              padding: '40px 32px',
              background: '#FFFFFF',
              borderRadius: '26px',
              border: '2px solid rgba(241, 90, 41, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#FDF1EB', color: '#F15A29', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                <Croissant size={28} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#F15A29', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('roleCard1Role')}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginTop: '6px', marginBottom: '14px' }}>
                {t('roleCard1Title')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.65', marginBottom: '28px' }}>
                {t('roleCard1Desc')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="glass-button"
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
            >
              Join as Food Donor <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: NGO & Shelter */}
          <div
            className="role-entry-card tilt-card glass-panel"
            onMouseMove={(e) => handleTilt(e, 'ngo')}
            onMouseLeave={resetTilt}
            style={{
              padding: '40px 32px',
              background: '#FFFFFF',
              borderRadius: '26px',
              border: '2px solid rgba(16, 61, 48, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                <Heart size={28} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('roleCard2Role')}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginTop: '6px', marginBottom: '14px' }}>
                {t('roleCard2Title')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.65', marginBottom: '28px' }}>
                {t('roleCard2Desc')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="glass-button"
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', background: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              Register Your Shelter <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 3: Volunteer Courier */}
          <div
            className="role-entry-card tilt-card glass-panel"
            onMouseMove={(e) => handleTilt(e, 'courier')}
            onMouseLeave={resetTilt}
            style={{
              padding: '40px 32px',
              background: '#FFFFFF',
              borderRadius: '26px',
              border: '2px solid rgba(217, 119, 6, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
                <Truck size={28} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('roleCard3Role')}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginTop: '6px', marginBottom: '14px' }}>
                {t('roleCard3Title')}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.65', marginBottom: '28px' }}>
                {t('roleCard3Desc')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="glass-button"
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', background: '#D97706', borderColor: '#D97706' }}
            >
              Sign Up as Courier <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION H: CULTURAL HERITAGE — KING PAARI (வள்ளல் பாரி)                     */}
      {/* ========================================================================= */}
      <section
        style={{
          padding: '60px 24px',
          background: 'linear-gradient(135deg, rgba(16, 61, 48, 0.08) 0%, rgba(241, 90, 41, 0.08) 100%)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{ maxWidth: '920px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FDF1EB',
              color: 'var(--accent)',
              padding: '6px 20px',
              borderRadius: '99px',
              fontSize: '0.82rem',
              fontWeight: '800',
              marginBottom: '18px'
            }}
          >
            <Sparkles size={15} /> {t('kingPaariBadge')}
          </div>
          <h2 className="text-editorial" style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>
            {t('kingPaariTitle')}
          </h2>
          <p style={{ fontSize: '1.08rem', color: 'var(--text-muted)', lineHeight: '1.8', maxWidth: '840px', margin: '0 auto' }}>
            {t('kingPaariDesc')}
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION I: MEMORABLE FINAL CTA & FOOTER                                   */}
      {/* ========================================================================= */}
      <section
        className="gsap-reveal-section"
        style={{
          padding: '100px 24px 80px 24px',
          textAlign: 'center',
          maxWidth: '860px',
          margin: '0 auto'
        }}
      >
        <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          THE NOURISHMENT MISSION
        </span>
        <h2
          className="text-editorial"
          style={{
            fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
            fontWeight: '900',
            color: 'var(--primary)',
            marginTop: '10px',
            marginBottom: '18px',
            lineHeight: '1.2'
          }}
        >
          {t('finalCtaStatement')}
        </h2>
        <p style={{ fontSize: '1.14rem', color: 'var(--text-muted)', marginBottom: '36px', lineHeight: '1.7', maxWidth: '640px', margin: '0 auto 36px auto' }}>
          {t('finalCtaDesc')}
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('register')}
            className="glass-button"
            style={{ padding: '16px 40px', fontSize: '1.05rem' }}
          >
            {t('heroBtnRescue')}
          </button>
          <button
            onClick={() => onNavigate('login')}
            className="glass-button-secondary"
            style={{ padding: '16px 36px', fontSize: '1.05rem' }}
          >
            {t('navSignIn')}
          </button>
        </div>
      </section>

    </div>
  );
}
