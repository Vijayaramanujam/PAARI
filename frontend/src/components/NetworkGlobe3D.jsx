import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Utensils, Heart, Truck, Compass, Globe } from 'lucide-react';

export default function NetworkGlobe3D({ language = 'en' }) {
  const mountRef = useRef(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [activeTelemetry, setActiveTelemetry] = useState('cit');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // WebGL Check
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch (e) {
      setWebGlSupported(false);
      return;
    }

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 560;
    const height = container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Realistic Lighting Setup (Sunlight + Ambient + Atmosphere Backlight)
    const sunLight = new THREE.DirectionalLight(0xFFF6E8, 2.8);
    sunLight.position.set(6, 4, 7);
    scene.add(sunLight);

    const nightAmbient = new THREE.AmbientLight(0x1B352E, 1.1);
    scene.add(nightAmbient);

    const rimLight = new THREE.DirectionalLight(0x38BDF8, 1.4);
    rimLight.position.set(-6, -3, -4);
    scene.add(rimLight);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    const GLOBE_RADIUS = 2.3;

    // =========================================================================
    // 3. PHOTOREALISTIC PROCEDURAL EARTH TEXTURE (Detailed Continents & Oceans)
    // =========================================================================
    const createRealisticEarthTexture = () => {
      const c = document.createElement('canvas');
      c.width = 2048;
      c.height = 1024;
      const ctx = c.getContext('2d');

      // A. Deep Oceanic Blue Gradient Base
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      oceanGrad.addColorStop(0, '#0F314C');
      oceanGrad.addColorStop(0.5, '#0B2238');
      oceanGrad.addColorStop(1, '#081928');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // B. Shallow Coastal Water Shelves (Turquoise Rim)
      ctx.strokeStyle = '#1A6178';
      ctx.lineWidth = 14;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Helper for coordinate conversion (Lon: -180..180 -> 0..2048, Lat: 90..-90 -> 0..1024)
      const toX = (lon) => ((lon + 180) / 360) * 2048;
      const toY = (lat) => ((90 - lat) / 180) * 1024;

      const drawPolygon = (coords, fillColor, strokeColor = null) => {
        if (!coords || coords.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(toX(coords[0][0]), toY(coords[0][1]));
        for (let i = 1; i < coords.length; i++) {
          ctx.lineTo(toX(coords[i][0]), toY(coords[i][1]));
        }
        ctx.closePath();
        if (strokeColor) {
          ctx.strokeStyle = strokeColor;
          ctx.stroke();
        }
        ctx.fillStyle = fillColor;
        ctx.fill();
      };

      // Realistic Continental Polygons (Accurate Geographic Approximations)
      const landColor = '#1F4E38';    // Rich Forest Green
      const aridColor = '#3A6348';    // Savanna / High Plains
      const mountainColor = '#4B7354';// Plateau High Green
      const coastalColor = '#185669'; // Shallow ocean boundary

      // 1. Africa
      const africa = [
        [-17, 15], [-17, 30], [-10, 35], [10, 37], [25, 32], [35, 30],
        [43, 12], [51, 10], [40, -10], [35, -20], [28, -34], [18, -34],
        [12, -20], [10, 0], [0, 5], [-15, 12]
      ];
      drawPolygon(africa, coastalColor, coastalColor);
      drawPolygon(africa, landColor);

      // 2. Eurasia & Europe
      const eurasia = [
        [-9, 36], [-9, 43], [0, 48], [5, 58], [15, 58], [25, 70], [60, 75],
        [100, 77], [140, 72], [170, 65], [140, 50], [120, 40], [120, 25],
        [105, 10], [100, 20], [90, 22], [80, 13], [70, 25], [60, 25],
        [50, 30], [35, 35], [26, 40], [15, 40], [0, 40]
      ];
      drawPolygon(eurasia, coastalColor, coastalColor);
      drawPolygon(eurasia, landColor);

      // 3. Indian Subcontinent (Highlighted Detail)
      const india = [
        [68, 24], [72, 32], [78, 35], [88, 28], [92, 22],
        [88, 20], [80, 13], [77, 8], [76, 10], [72, 19], [68, 24]
      ];
      drawPolygon(india, '#28704A'); // Vibrant Emerald India Landmass
      drawPolygon([[72, 26], [78, 30], [84, 25], [80, 16], [76, 12]], mountainColor);

      // 4. Southeast Asia & Indonesia
      drawPolygon([[98, 5], [104, 1], [115, -4], [125, -8], [115, -8], [100, 0]], landColor);
      drawPolygon([[105, 15], [108, 12], [105, 10], [100, 14]], landColor);

      // 5. Australia
      const australia = [
        [114, -22], [122, -15], [135, -12], [145, -15], [152, -24],
        [150, -37], [138, -38], [128, -33], [115, -34], [113, -25]
      ];
      drawPolygon(australia, coastalColor, coastalColor);
      drawPolygon(australia, aridColor);

      // 6. North America
      const northAmerica = [
        [-165, 65], [-140, 70], [-100, 75], [-60, 65], [-55, 50], [-70, 42],
        [-80, 25], [-82, 30], [-95, 28], [-105, 20], [-100, 30], [-120, 35],
        [-124, 48], [-140, 60], [-165, 60]
      ];
      drawPolygon(northAmerica, coastalColor, coastalColor);
      drawPolygon(northAmerica, landColor);

      // 7. South America
      const southAmerica = [
        [-76, 8], [-60, 8], [-35, -5], [-38, -15], [-50, -30], [-65, -54],
        [-75, -50], [-72, -35], [-80, -5], [-76, 8]
      ];
      drawPolygon(southAmerica, coastalColor, coastalColor);
      drawPolygon(southAmerica, landColor);

      // 8. Antarctica Ice Cap
      ctx.fillStyle = '#E3EDF2';
      ctx.fillRect(0, 930, 2048, 94);

      // 9. Delicate Latitude & Longitude Navigation Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        ctx.moveTo(0, toY(lat));
        ctx.lineTo(2048, toY(lat));
        ctx.stroke();
      }
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        ctx.moveTo(toX(lon), 0);
        ctx.lineTo(toX(lon), 1024);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(c);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    // =========================================================================
    // 4. PROCEDURAL CLOUD LAYER (Realistic Soft Atmospheric Clouds)
    // =========================================================================
    const createCloudTexture = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 1024, 512);

      // Draw soft cloud wisps
      for (let i = 0; i < 48; i++) {
        const x = Math.random() * 1024;
        const y = 80 + Math.random() * 350;
        const rad = 30 + Math.random() * 80;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.22)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      return tex;
    };

    // A. Main Earth Globe Mesh with Specular Shine
    const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthTexture = createRealisticEarthTexture();
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.35,      // Smooth ocean reflections
      metalness: 0.08,
      bumpScale: 0.04
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    masterGroup.add(earthMesh);

    // B. Clouds Sphere Layer (Slightly larger, independent rotation)
    const cloudGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.018, 48, 48);
    const cloudTexture = createCloudTexture();
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      roughness: 1.0
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    masterGroup.add(cloudMesh);

    // C. Atmosphere Halo Glow Shader (Celestial Rim Glow)
    const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.065, 48, 48);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          gl_FragColor = vec4(0.24, 0.72, 0.88, 1.0) * intensity * 1.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    masterGroup.add(atmoMesh);

    // Helper: Convert Lat/Long to 3D Cartesian coordinates
    const latLongToVector3 = (lat, lon, r = GLOBE_RADIUS) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.cos(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    // =========================================================================
    // 5. LUMINOUS LOGISTICS PINS & SUPPLY HUBS
    // =========================================================================
    const hubs = [
      { id: 'cit', name: 'CIT Central Food Hub', lat: 12.9715, lon: 80.0430, color: 0xF15A29, isMain: true },
      { id: 'baker', name: "Baker's Delight CIT", lat: 14.1, lon: 81.2, color: 0xF15A29 },
      { id: 'shelter', name: 'Hope Food Shelter', lat: 11.8, lon: 78.9, color: 0x22C55E },
      { id: 'bengaluru', name: 'Bengaluru Logistics', lat: 12.97, lon: 77.59, color: 0x22C55E },
      { id: 'mumbai', name: 'Mumbai Supply Kitchen', lat: 19.07, lon: 72.87, color: 0x22C55E },
      { id: 'singapore', name: 'Singapore Zero-Waste', lat: 1.35, lon: 103.81, color: 0xF59E0B },
      { id: 'dubai', name: 'Dubai Food Banking', lat: 25.20, lon: 55.27, color: 0xF59E0B },
      { id: 'london', name: 'London Redistribution', lat: 51.50, lon: -0.12, color: 0x38BDF8 }
    ];

    hubs.forEach(h => {
      const pos = latLongToVector3(h.lat, h.lon, GLOBE_RADIUS + 0.02);

      // Glowing Pin Bead
      const beadGeo = new THREE.SphereGeometry(h.isMain ? 0.085 : 0.055, 16, 16);
      const beadMat = new THREE.MeshBasicMaterial({ color: h.color });
      const bead = new THREE.Mesh(beadGeo, beadMat);
      bead.position.copy(pos);
      masterGroup.add(bead);

      // Outer Pulsing Radar Ring for Main Hub
      if (h.isMain) {
        const ringGeo = new THREE.RingGeometry(0.12, 0.18, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xF15A29,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos.clone().multiplyScalar(1.02));
        ring.lookAt(pos.clone().multiplyScalar(2));
        masterGroup.add(ring);
      }
    });

    // =========================================================================
    // 6. 3D GLOWING LOGISTICS FLIGHT ARCS & MOVING PHOTONS
    // =========================================================================
    const arcConnections = [
      [0, 1], // CIT -> Baker's
      [0, 2], // CIT -> Hope Shelter
      [0, 3], // CIT -> Bengaluru
      [0, 4], // CIT -> Mumbai
      [0, 5], // CIT -> Singapore
      [0, 6], // CIT -> Dubai
      [0, 7], // CIT -> London
    ];

    const animatedPhotons = [];

    arcConnections.forEach(([fromIdx, toIdx], arcIdx) => {
      const h1 = hubs[fromIdx];
      const h2 = hubs[toIdx];

      const p1 = latLongToVector3(h1.lat, h1.lon, GLOBE_RADIUS);
      const p2 = latLongToVector3(h2.lat, h2.lon, GLOBE_RADIUS);

      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const elevation = GLOBE_RADIUS + Math.min(dist * 0.45, 1.25);
      mid.normalize().multiplyScalar(elevation);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const curvePoints = curve.getPoints(40);

      // Arc Line
      const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const isLocal = arcIdx < 3;
      const arcMat = new THREE.LineBasicMaterial({
        color: isLocal ? 0xF15A29 : 0x38BDF8,
        transparent: true,
        opacity: isLocal ? 0.85 : 0.45,
        linewidth: 1.5
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      masterGroup.add(arcLine);

      // Moving Pulse Photon
      const photonGeo = new THREE.SphereGeometry(isLocal ? 0.048 : 0.038, 12, 12);
      const photonMat = new THREE.MeshBasicMaterial({
        color: isLocal ? 0xFFEDD5 : 0xE0F2FE
      });
      const photon = new THREE.Mesh(photonGeo, photonMat);
      masterGroup.add(photon);

      animatedPhotons.push({
        mesh: photon,
        curve: curve,
        speed: 0.004 + (arcIdx % 3) * 0.0018,
        progress: (arcIdx * 0.14) % 1
      });
    });

    // Orient initial globe face to show India & Asia clearly
    masterGroup.rotation.y = -Math.PI * 0.38;
    masterGroup.rotation.x = 0.25;

    // =========================================================================
    // 7. SMOOTH INERTIA DRAG ROTATION (User can spin the Earth naturally)
    // =========================================================================
    let isDragging = false;
    let previousPointer = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0.0018 };
    let isVisible = true;

    const onPointerDown = (e) => {
      isDragging = true;
      previousPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousPointer.x;
      const deltaY = e.clientY - previousPointer.y;

      velocity.y = deltaX * 0.004;
      velocity.x = deltaY * 0.004;

      masterGroup.rotation.y += velocity.y;
      masterGroup.rotation.x += velocity.x;

      previousPointer = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Viewport IntersectionObserver
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(container);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 8. ANIMATION LOOP
    // =========================================================================
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return; // Halt rendering when scrolled away

      // Continuous rotation with inertia damping
      if (!isDragging) {
        velocity.y = THREE.MathUtils.lerp(velocity.y, 0.0018, 0.04);
        velocity.x = THREE.MathUtils.lerp(velocity.x, 0, 0.05);
        masterGroup.rotation.y += velocity.y;
        masterGroup.rotation.x += velocity.x;
      }

      // Rotate clouds slightly faster than earth for dynamic atmospheric realism
      cloudMesh.rotation.y += 0.0006;

      // Update traveling photon pulses along 3D arcs
      animatedPhotons.forEach(p => {
        p.progress = (p.progress + p.speed) % 1;
        p.mesh.position.copy(p.curve.getPointAt(p.progress));
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Clean Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      earthTexture.dispose();
      cloudTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '560px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* 3D WebGL Canvas Mount */}
      {webGlSupported ? (
        <div
          ref={mountRef}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Drag to rotate Earth in 3D"
        />
      ) : (
        /* WebGL Fallback Card */
        <div
          className="glass-panel"
          style={{
            padding: '40px 30px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #103D30 0%, #205B39 100%)',
            color: '#fff',
            maxWidth: '440px',
            borderRadius: '24px'
          }}
        >
          <Globe size={48} color="#F15A29" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>
            {language === 'ta' ? 'உணவு மீட்பு வலைப்பின்னல்' : 'Global Food Rescue Network'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
            {language === 'ta'
              ? 'உபரி சமையலறைகளையும் காப்பகங்களையும் நிகழ்நேரத்தில் இணைக்கும் பாரி தளம்.'
              : 'Real-time logistics connecting commercial surplus kitchens with community shelters.'}
          </p>
        </div>
      )}

      {/* Floating Tactical Pill: Drag Interaction Guide */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          borderRadius: '99px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.76rem',
          fontWeight: '700',
          color: 'var(--primary)',
          boxShadow: '0 6px 18px rgba(16, 61, 48, 0.08)',
          pointerEvents: 'none'
        }}
      >
        <Compass size={14} color="#F15A29" />
        <span>{language === 'ta' ? 'சுழற்றிப் பார்க்க இழுக்கவும்' : 'Click & drag Earth to rotate in 3D'}</span>
      </div>

      {/* Floating Card: CIT Central Hub */}
      <div
        className="glass-panel animated-float"
        style={{
          position: 'absolute',
          top: '30px',
          left: '10px',
          padding: '12px 18px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(14px)',
          border: '1.5px solid #F15A29',
          boxShadow: '0 14px 32px rgba(241, 90, 41, 0.16)',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      >
        <div style={{ background: '#FDF1EB', color: '#F15A29', padding: '8px', borderRadius: '12px', display: 'flex' }}>
          <Utensils size={18} />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#F15A29', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {language === 'ta' ? 'முதன்மை மையம்' : 'Central Dispatch Hub'}
          </div>
          <strong style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>
            CIT Chennai (12.97° N, 80.04° E)
          </strong>
        </div>
      </div>

      {/* Floating Card: Live Courier */}
      <div
        className="glass-panel animated-float"
        style={{
          position: 'absolute',
          bottom: '55px',
          right: '15px',
          padding: '12px 18px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(14px)',
          border: '1.5px solid #205B39',
          boxShadow: '0 14px 32px rgba(32, 91, 57, 0.16)',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 5,
          animationDelay: '1.8s',
          pointerEvents: 'none'
        }}
      >
        <div style={{ background: '#E7EFEA', color: '#205B39', padding: '8px', borderRadius: '12px', display: 'flex' }}>
          <Truck size={18} />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#205B39', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {language === 'ta' ? 'நிகழ்நேர டெலிவரி' : 'Live Transit Courier'}
          </div>
          <strong style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>
            John (Speed: 32 km/h • 2.8 km left)
          </strong>
        </div>
      </div>

    </div>
  );
}
