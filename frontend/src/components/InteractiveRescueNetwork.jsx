import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Heart, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Thermometer, 
  Clock, 
  ChevronRight, 
  Radio, 
  Compass,
  ArrowRight
} from 'lucide-react';

export default function InteractiveRescueNetwork({ language = 'en' }) {
  const [activeStep, setActiveStep] = useState(2); // 0: Donor, 1: Hub, 2: Courier, 3: Shelter
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const stages = [
    {
      id: 'donor',
      stepNum: '01',
      label: language === 'ta' ? 'உணவு வழங்குநர்' : 'Donor Kitchen',
      title: language === 'ta' ? "பேக்கர்ஸ் டிலைட் (சி.ஐ.டி வளாகம்)" : "Baker's Delight (CIT Campus)",
      role: language === 'ta' ? 'உணவு உபரி வழங்குநர்' : 'Commercial Bakery Donor',
      location: 'CIT Chennai Campus, Kundrathur Road',
      cargo: language === 'ta' ? 'சுடச்சுட சாக்லேட் க்ரோசண்ட்கள் & ரொட்டி (25 கிலோ)' : 'Fresh Chocolate Croissants & Buns (25 kg)',
      status: language === 'ta' ? 'உபரி தயார்' : 'SURPLUS READY',
      statusColor: '#F15A29',
      temp: '68°C',
      tempDesc: language === 'ta' ? 'சூடான பேக்கிங் நிலை' : 'Freshly Baked Hot Hold',
      eta: '0 min (Origin)',
      transitSpeed: '0 km/h',
      compliance: 'FSSAI Tier-1 Bakery Certified • Sealed Batch #BK-4921',
      icon: Utensils,
      radarPos: { x: 18, y: 35 }
    },
    {
      id: 'hub',
      stepNum: '02',
      label: language === 'ta' ? 'மத்திய மையம்' : 'Logistics Hub',
      title: language === 'ta' ? 'சி.ஐ.டி மத்திய மறுபகிர்வு மையம்' : 'CIT Central Redistribution Hub',
      role: language === 'ta' ? 'தரப் பரிசோதனை & வரிசைப்படுத்துதல்' : 'Smart Sorting & Screening Hub',
      location: 'Sarathy Nagar, Kundrathur, Chennai - 600069',
      cargo: language === 'ta' ? 'தரப் பரிசோதனை முடிந்து வெப்பப் பைகளில் அடைக்கப்பட்டது' : 'Screened & Packed in Insulated Thermal Sleeves',
      status: language === 'ta' ? 'பரிசோதிக்கப்பட்டது' : 'QUALITY VERIFIED',
      statusColor: '#103D30',
      temp: '65°C',
      tempDesc: language === 'ta' ? 'வெப்பநிலை உறுதி செய்யப்பட்டது' : 'Thermal Insulated Storage',
      eta: 'Completed',
      transitSpeed: 'Hub Sort Desk',
      compliance: '100% Organoleptic & Freshness Cleared • Zero Contamination',
      icon: Zap,
      radarPos: { x: 42, y: 55 }
    },
    {
      id: 'courier',
      stepNum: '03',
      label: language === 'ta' ? 'தன்னார்வ விநியோகம்' : 'In-Transit Courier',
      title: language === 'ta' ? 'தன்னார்வலர் ஜான் (TN-09-AB-4412)' : 'Volunteer John (Motorcycle TN-09-AB)',
      role: language === 'ta' ? 'விரைவு உணவுப் போக்குவரத்து' : 'Direct Insulated Food Courier',
      location: 'Kundrathur Main Road (2.4 km from destination)',
      cargo: language === 'ta' ? '25 கிலோ சூடான ரொட்டிப் பார்சல்கள்' : '25 kg Fresh Bread Parcels • Hot Hold',
      status: language === 'ta' ? 'பயணத்தில் உள்ளது' : 'IN TRANSIT',
      statusColor: '#D97706',
      temp: '63°C',
      tempDesc: language === 'ta' ? 'வெப்பக் காப்புப் பெட்டி' : 'Insulated Bag Regulated',
      eta: language === 'ta' ? 'இன்னும் 12 நிமிடங்கள்' : '12 mins remaining',
      transitSpeed: '32 km/h (Live GPS)',
      compliance: 'Sanitized Carrier Box • Direct Non-Stop Fast Route',
      icon: Truck,
      radarPos: { x: 68, y: 40 }
    },
    {
      id: 'shelter',
      stepNum: '04',
      label: language === 'ta' ? 'காப்பகம்' : 'Community Shelter',
      title: language === 'ta' ? 'ஹோப் குழந்தைகள் பராமரிப்பு இல்லம்' : 'Hope Children Care Home',
      role: language === 'ta' ? '120 குழந்தைகள் மற்றும் முதியோர்' : 'Shelter Home • 120 Beneficiaries',
      location: 'Kundrathur Main Road, Near Murugan Temple',
      cargo: language === 'ta' ? 'மாலையரசு சத்துணவு & சிற்றுண்டி' : 'Nutritious Evening Snack & Dinner Support',
      status: language === 'ta' ? 'வரவேற்கத் தயார்' : 'READY FOR RECEIPT',
      statusColor: '#205B39',
      temp: '62°C',
      tempDesc: language === 'ta' ? 'சாப்பிடத் தயார்' : 'Ready for Immediate Dining',
      eta: language === 'ta' ? 'விநியோகம் இலக்கு' : 'Destination Hub',
      transitSpeed: '0 km/h (Receiving Bay)',
      compliance: 'Clean Dining Distribution Ready • Dignified Serving',
      icon: Heart,
      radarPos: { x: 86, y: 65 }
    }
  ];

  // Auto-cycle simulation
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % stages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, stages.length]);

  const current = stages[activeStep];

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '28px',
        border: '1.5px solid var(--border)',
        boxShadow: '0 20px 50px rgba(16, 61, 48, 0.07)',
        overflow: 'hidden'
      }}
    >
      {/* 1. Header Bar: Command Hub Status */}
      <div
        style={{
          padding: '28px 32px 20px 32px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(180deg, #FAF7F2 0%, #FFFFFF 100%)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981'
              }}
            />
            <span style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.8px', color: 'var(--primary)', textTransform: 'uppercase' }}>
              {language === 'ta' ? 'நிகழ்நேர விநியோக கட்டுப்பாட்டு மையம்' : 'PAARI RESCUE COMMAND HUB'}
            </span>
          </div>
          <h3 className="text-editorial" style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
            {language === 'ta' ? 'உணவுப் பாதை மற்றும் தரக் கண்காணிப்பு' : 'Live Mission Telemetry & Cold-Chain Manifest'}
          </h3>
        </div>

        {/* Tactical Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="glass-button-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: isAutoPlaying ? 'var(--primary)' : 'transparent',
              color: isAutoPlaying ? '#FFFFFF' : 'var(--primary)',
              borderColor: 'var(--primary)'
            }}
          >
            <Radio size={14} className={isAutoPlaying ? 'animated-pulse' : ''} />
            <span>{isAutoPlaying ? (language === 'ta' ? 'சுழற்சி இயங்குகிறது' : 'Live Auto-Cycle: ON') : (language === 'ta' ? 'சுழற்சி தொடங்கு' : 'Auto-Cycle Simulation')}</span>
          </button>
        </div>
      </div>

      {/* 2. Unified 4-Step Pipeline Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {stages.map((st, idx) => {
          const Icon = st.icon;
          const isActive = idx === activeStep;
          return (
            <button
              key={st.id}
              onClick={() => {
                setActiveStep(idx);
                setIsAutoPlaying(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                background: isActive ? '#FAF6EE' : '#FFFFFF',
                border: 'none',
                borderBottom: isActive ? `3px solid ${st.statusColor}` : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: isActive ? st.statusColor : 'rgba(16, 61, 48, 0.06)',
                  color: isActive ? '#FFFFFF' : 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.25s ease'
                }}
              >
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: isActive ? st.statusColor : 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  STEP {st.stepNum} • {st.label}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                  {st.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Main Command Console: Tactical Radar (Left) + Manifest (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 0
        }}
      >
        {/* Left: Tactical Radar Screen */}
        <div
          style={{
            background: 'radial-gradient(circle at 50% 50%, #0F2D24 0%, #081712 100%)',
            padding: '36px',
            position: 'relative',
            minHeight: '430px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden'
          }}
        >
          {/* Concentric Range Rings */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              pointerEvents: 'none'
            }}
          />

          {/* Tactical Header Overlay */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontSize: '0.75rem', fontWeight: '700' }}>
              <Compass size={14} />
              <span>RADAR GRID • CIT CHENNAI 15 KM ZONE</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
              LAT 12.9716° N / LON 80.0428° E
            </span>
          </div>

          {/* SVG Route Arcs Connecting Nodes */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {/* Donor -> Hub */}
            <path
              d="M 18% 35% Q 30% 25% 42% 55%"
              fill="none"
              stroke="#F15A29"
              strokeWidth="2.5"
              strokeDasharray={activeStep >= 1 ? 'none' : '6 6'}
              opacity={activeStep >= 1 ? 0.9 : 0.4}
            />
            {/* Hub -> Courier */}
            <path
              d="M 42% 55% Q 55% 65% 68% 40%"
              fill="none"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeDasharray={activeStep >= 2 ? 'none' : '6 6'}
              opacity={activeStep >= 2 ? 0.9 : 0.4}
            />
            {/* Courier -> Shelter */}
            <path
              d="M 68% 40% Q 78% 30% 86% 65%"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeDasharray={activeStep >= 3 ? 'none' : '6 6'}
              opacity={activeStep >= 3 ? 0.9 : 0.4}
            />
          </svg>

          {/* Interactive Tactical Node Markers */}
          <div style={{ position: 'relative', width: '100%', height: '270px', zIndex: 2 }}>
            {stages.map((st, idx) => {
              const Icon = st.icon;
              const isActive = idx === activeStep;
              return (
                <div
                  key={st.id}
                  onClick={() => {
                    setActiveStep(idx);
                    setIsAutoPlaying(false);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${st.radarPos.x}%`,
                    top: `${st.radarPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {/* Glowing Marker Button */}
                  <div
                    style={{
                      position: 'relative',
                      width: isActive ? '48px' : '36px',
                      height: isActive ? '48px' : '36px',
                      borderRadius: '50%',
                      background: isActive ? st.statusColor : '#122D23',
                      border: `2px solid ${st.statusColor}`,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? `0 0 20px ${st.statusColor}` : '0 4px 10px rgba(0,0,0,0.4)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <Icon size={isActive ? 22 : 16} />
                    {isActive && (
                      <span
                        className="radar-ping"
                        style={{
                          position: 'absolute',
                          inset: '-6px',
                          borderRadius: '50%',
                          border: `2px solid ${st.statusColor}`,
                          pointerEvents: 'none'
                        }}
                      />
                    )}
                  </div>

                  {/* Marker Title Tag */}
                  <div
                    style={{
                      background: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 25, 20, 0.75)',
                      color: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.75)',
                      border: isActive ? `1.5px solid ${st.statusColor}` : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '99px',
                      padding: '2px 8px',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      transition: 'all 0.25s ease'
                    }}
                  >
                    {st.stepNum}. {st.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Radar Status */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '14px',
              zIndex: 2,
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.78rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color="#10B981" />
              <span>{language === 'ta' ? 'அனைத்து முனையங்களும் இணைப்பில் உள்ளன' : 'All 4 Stations Synchronized & Online'}</span>
            </span>
            <span style={{ color: current.statusColor, fontWeight: '800' }}>
              ● {current.status}
            </span>
          </div>
        </div>

        {/* Right: Live Telemetry & Cold-Chain Manifest */}
        <div
          style={{
            padding: '36px',
            background: '#FAF7F2',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '1px solid var(--border)'
          }}
        >
          <div>
            {/* Stage Eyebrow & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span
                style={{
                  background: `${current.statusColor}18`,
                  color: current.statusColor,
                  border: `1px solid ${current.statusColor}40`,
                  padding: '4px 12px',
                  borderRadius: '99px',
                  fontSize: '0.76rem',
                  fontWeight: '800',
                  letterSpacing: '0.5px'
                }}
              >
                STAGE {current.stepNum} OF 04 • {current.role}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                FSSAI COMPLIANT
              </span>
            </div>

            {/* Stage Title & Location */}
            <h4 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
              {current.title}
            </h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '22px' }}>
              <MapPin size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{current.location}</span>
            </div>

            {/* Key Sensor Telemetry Metrics (Grid) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '14px',
                marginBottom: '22px'
              }}
            >
              {/* Temperature Sensor */}
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '14px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '800' }}>
                  <Thermometer size={14} />
                  <span>{language === 'ta' ? 'வெப்பநிலை' : 'CARGO TEMP'}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>
                  {current.temp}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {current.tempDesc}
                </div>
              </div>

              {/* ETA / Speed Sensor */}
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '14px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800' }}>
                  <Clock size={14} />
                  <span>{language === 'ta' ? 'கால அளவு' : 'SPEED & ETA'}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>
                  {current.eta}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {current.transitSpeed}
                </div>
              </div>
            </div>

            {/* Cargo Manifest Description */}
            <div
              style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {language === 'ta' ? 'ஏற்றுமதி செய்யப்பட்ட உணவு' : 'DISPATCHED FOOD CARGO'}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--primary)' }}>
                {current.cargo}
              </div>
            </div>

            {/* Food Safety & Cold Chain Checklist */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{current.compliance}</span>
            </div>
          </div>

          {/* Action Step Simulation Trigger */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {language === 'ta' ? 'அடுத்த கட்டத்தைப் பார்க்கவும்' : 'Advance through the 4 rescue phases'}
            </span>
            <button
              onClick={() => {
                setActiveStep((prev) => (prev + 1) % stages.length);
                setIsAutoPlaying(false);
              }}
              className="glass-button"
              style={{
                padding: '9px 18px',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{language === 'ta' ? 'அடுத்த நிலை' : 'Next Phase'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
