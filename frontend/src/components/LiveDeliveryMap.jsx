import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { 
  Navigation, 
  MapPin, 
  Play, 
  Pause, 
  FastForward, 
  LocateFixed, 
  Compass, 
  Clock, 
  Gauge, 
  ShieldCheck, 
  Phone, 
  Truck,
  RotateCw,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function LiveDeliveryMap({ 
  deliveryId, 
  initialData = null, 
  isVolunteer = false, 
  onClose = null 
}) {
  const { language, t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const traveledPolylineRef = useRef(null);
  const remainingPolylineRef = useRef(null);
  const simIntervalRef = useRef(null);

  // Delivery Tracking State
  const [trackingData, setTrackingData] = useState(initialData);
  const [waypoints, setWaypoints] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentPos, setCurrentPos] = useState(null);
  const [bearing, setBearing] = useState(0);
  const [speed, setSpeed] = useState(32); // km/h
  const [isSimulating, setIsSimulating] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [useDeviceGps, setUseDeviceGps] = useState(false);
  const [mapType, setMapType] = useState('streets'); // 'streets' | 'satellite'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [loading, setLoading] = useState(!initialData);

  // Helper to calculate bearing between two lat/lng points in degrees
  const calculateBearing = (startLat, startLng, endLat, endLng) => {
    const lat1 = (startLat * Math.PI) / 180;
    const lat2 = (endLat * Math.PI) / 180;
    const dLng = ((endLng - startLng) * Math.PI) / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  };

  // Helper to calculate distance between two coordinates in km
  const haversineDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch tracking details from backend
  const fetchTracking = async () => {
    try {
      const res = await api.get(`/api/deliveries/${deliveryId}/tracking`);
      setTrackingData(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      console.error('Error fetching live tracking data', err);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [deliveryId]);

  // Parse waypoints from routeData
  useEffect(() => {
    if (!trackingData) return;

    let points = [];
    if (trackingData.routeData) {
      try {
        const parsed = JSON.parse(trackingData.routeData);
        if (parsed.coordinates && Array.isArray(parsed.coordinates)) {
          // GeoJSON is [lng, lat] -> Leaflet is [lat, lng]
          points = parsed.coordinates.map((c) => [c[1], c[0]]);
        }
      } catch (e) {
        console.warn('Could not parse routeData JSON', e);
      }
    }

    // Fallback if no detailed waypoints
    if (points.length < 2) {
      const start = [trackingData.pickupLat || 12.9715628, trackingData.pickupLng || 80.043079];
      const end = [trackingData.deliveryLat || 12.9860, trackingData.deliveryLng || 80.0650];
      const mid = [(start[0] + end[0]) / 2 + 0.0015, (start[1] + end[1]) / 2 + 0.0025];
      points = [start, mid, end];
    }

    setWaypoints(points);

    // Initial position
    if (trackingData.currentLat && trackingData.currentLng) {
      setCurrentPos([trackingData.currentLat, trackingData.currentLng]);
      if (trackingData.currentBearing) {
        setBearing(trackingData.currentBearing);
      }
    } else {
      setCurrentPos(points[0]);
    }
  }, [trackingData]);

  // Dynamic Tile Layer update when mapType changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileUrl = mapType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap | Google Maps Style | PAARI Live GPS',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [mapType]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || waypoints.length === 0) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startPos = currentPos || waypoints[0];

    // Initialize Map with Google-Maps style standard OpenStreetMap tiles
    const map = L.map(mapContainerRef.current, {
      center: startPos,
      zoom: 15,
      zoomControl: false,
    });

    // Add Zoom Control to Top-Right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Tile Layer: OpenStreetMap or Satellite with clean tiles
    const tileUrl = mapType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap | Google Maps Style | PAARI Live GPS',
      maxZoom: 19,
    }).addTo(map);

    // Custom HTML Icons
    const donorIcon = L.divIcon({
      className: 'custom-donor-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background: #10B981; color: white; padding: 4px 8px; border-radius: 99px; font-weight: 800; font-size: 10px; box-shadow: 0 4px 12px rgba(16,185,129,0.4); white-space: nowrap; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; border: 1.5px solid #fff;">
            <span>📍 PICKUP</span>
          </div>
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #10B981; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">
            🏪
          </div>
        </div>
      `,
      iconSize: [40, 60],
      iconAnchor: [20, 50],
    });

    const shelterIcon = L.divIcon({
      className: 'custom-shelter-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background: #E65F2B; color: white; padding: 4px 8px; border-radius: 99px; font-weight: 800; font-size: 10px; box-shadow: 0 4px 12px rgba(230,95,43,0.4); white-space: nowrap; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; border: 1.5px solid #fff;">
            <span>🏁 DROPOFF</span>
          </div>
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #E65F2B; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">
            🏠
          </div>
        </div>
      `,
      iconSize: [40, 60],
      iconAnchor: [20, 50],
    });

    // Add Donor (Pickup) & Shelter (Dropoff) Markers
    const pickupCoord = [trackingData.pickupLat || waypoints[0][0], trackingData.pickupLng || waypoints[0][1]];
    const dropoffCoord = [trackingData.deliveryLat || waypoints[waypoints.length - 1][0], trackingData.deliveryLng || waypoints[waypoints.length - 1][1]];

    L.marker(pickupCoord, { icon: donorIcon })
      .bindPopup(`<b>${trackingData.donorName || 'Food Donor'}</b><br/>${trackingData.pickupLocation || 'Pickup location'}`)
      .addTo(map);

    L.marker(dropoffCoord, { icon: shelterIcon })
      .bindPopup(`<b>${trackingData.receiverName || 'Shelter'}</b><br/>${trackingData.deliveryLocation || 'Delivery location'}`)
      .addTo(map);

    // Full Route Polyline (Base gray route)
    L.polyline(waypoints, {
      color: '#64748B',
      weight: 6,
      opacity: 0.35,
      dashArray: '8, 8',
      lineCap: 'round',
    }).addTo(map);

    // Active Polyline (Remaining path in vivid blue/emerald)
    remainingPolylineRef.current = L.polyline(waypoints, {
      color: '#0284C7',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
    }).addTo(map);

    // Traveled Polyline (Solid emerald green for covered path)
    traveledPolylineRef.current = L.polyline([waypoints[0]], {
      color: '#10B981',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(map);

    // Live Courier Vehicle Marker (Motorcycle with heading rotation and pulsating radar wave)
    const createCourierIcon = (deg = 0) => L.divIcon({
      className: 'custom-courier-marker',
      html: `
        <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
          <!-- GPS Pulsing Wave Ring -->
          <div style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: rgba(14,165,233,0.3); animation: pulseRadar 1.8s ease-out infinite;"></div>
          <!-- Vehicle Disc with Bearing Rotation -->
          <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; background: #0F3B2E; border: 3px solid #FFF; box-shadow: 0 4px 14px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; transform: rotate(${deg}deg); transition: transform 0.3s ease;">
            <span style="font-size: 19px; display: block; line-height: 1;">🛵</span>
          </div>
          <!-- Live Indicator Badge -->
          <div style="position: absolute; bottom: 0; right: 4px; width: 10px; height: 10px; background: #10B981; border: 2px solid #FFF; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [56, 56],
      iconAnchor: [28, 28],
    });

    const courierMarker = L.marker(startPos, {
      icon: createCourierIcon(bearing),
      zIndexOffset: 1000,
    }).addTo(map);

    courierMarker.bindTooltip(
      `<b>${trackingData.volunteerName || 'Volunteer Rescuer'}</b> (${trackingData.vehicleType || 'Motorcycle'})`,
      { permanent: false, direction: 'top', offset: [0, -20] }
    );

    courierMarkerRef.current = courierMarker;
    mapInstanceRef.current = map;

    // Fit bounds smoothly to contain the full route
    const bounds = L.latLngBounds([pickupCoord, dropoffCoord, ...waypoints]);
    map.fitBounds(bounds, { padding: [60, 60] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [waypoints]);

  // Update courier marker position & bearing on map
  const updateCourierOnMap = (lat, lng, deg) => {
    if (!courierMarkerRef.current || !mapInstanceRef.current) return;

    const newLatLng = L.latLng(lat, lng);
    courierMarkerRef.current.setLatLng(newLatLng);

    // Update DivIcon HTML with new bearing rotation
    const iconHtml = `
      <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: rgba(14,165,233,0.3); animation: pulseRadar 1.8s ease-out infinite;"></div>
        <div style="position: relative; width: 38px; height: 38px; border-radius: 50%; background: #0F3B2E; border: 3px solid #FFF; box-shadow: 0 4px 14px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; transform: rotate(${deg}deg); transition: transform 0.3s ease;">
          <span style="font-size: 19px; display: block; line-height: 1;">🛵</span>
        </div>
        <div style="position: absolute; bottom: 0; right: 4px; width: 10px; height: 10px; background: #10B981; border: 2px solid #FFF; border-radius: 50%;"></div>
      </div>
    `;
    courierMarkerRef.current.setIcon(
      L.divIcon({
        className: 'custom-courier-marker',
        html: iconHtml,
        iconSize: [56, 56],
        iconAnchor: [28, 28],
      })
    );

    // Update polylines
    if (traveledPolylineRef.current && waypoints.length > 0) {
      const traveled = waypoints.slice(0, currentIdx + 1);
      traveled.push([lat, lng]);
      traveledPolylineRef.current.setLatLngs(traveled);
    }

    if (remainingPolylineRef.current && waypoints.length > 0) {
      const remaining = [[lat, lng], ...waypoints.slice(currentIdx + 1)];
      remainingPolylineRef.current.setLatLngs(remaining);
    }
  };

  // Synchronize location to backend
  const syncLocationToBackend = async (lat, lng, deg) => {
    try {
      await api.put(`/api/deliveries/${deliveryId}/location?latitude=${lat}&longitude=${lng}&bearing=${deg}`);
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Backend live sync warning:', err);
    }
  };

  // Recenter map smoothly onto courier
  const handleRecenter = () => {
    if (mapInstanceRef.current && currentPos) {
      mapInstanceRef.current.flyTo(currentPos, 16, { animate: true, duration: 0.8 });
    }
  };

  // Real-time GPS Simulation Loop (for Volunteer or Demo)
  useEffect(() => {
    if (!isSimulating || waypoints.length < 2) {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      return;
    }

    const intervalTime = Math.max(300, 1000 / speedMultiplier);

    simIntervalRef.current = setInterval(() => {
      setCurrentIdx((prevIdx) => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= waypoints.length) {
          setIsSimulating(false);
          clearInterval(simIntervalRef.current);
          return prevIdx;
        }

        const prevPoint = waypoints[prevIdx];
        const nextPoint = waypoints[nextIdx];

        const calculatedBrng = calculateBearing(prevPoint[0], prevPoint[1], nextPoint[0], nextPoint[1]);
        setBearing(calculatedBrng);
        setCurrentPos(nextPoint);
        updateCourierOnMap(nextPoint[0], nextPoint[1], calculatedBrng);

        // Fluctuate simulated speed between 28 and 42 km/h
        const instantSpeed = Math.round(28 + Math.random() * 14);
        setSpeed(instantSpeed);

        // Auto-sync position to backend every other step
        if (nextIdx % 2 === 0) {
          syncLocationToBackend(nextPoint[0], nextPoint[1], calculatedBrng);
        }

        return nextIdx;
      });
    }, intervalTime);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isSimulating, speedMultiplier, waypoints]);

  // Spectator Polling Mode (for Receiver/NGO: updates location if another user is moving)
  useEffect(() => {
    if (isVolunteer && isSimulating) return; // Volunteer is generating movements

    const pollInterval = setInterval(async () => {
      const data = await fetchTracking();
      if (data && data.currentLat && data.currentLng) {
        const newPos = [data.currentLat, data.currentLng];
        const newBearing = data.currentBearing || 0;
        setCurrentPos(newPos);
        setBearing(newBearing);
        updateCourierOnMap(newPos[0], newPos[1], newBearing);
      }
    }, 3500);

    return () => clearInterval(pollInterval);
  }, [isVolunteer, isSimulating, deliveryId]);

  // Real Device GPS Watcher
  useEffect(() => {
    let watchId = null;
    if (useDeviceGps && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const brng = pos.coords.heading || bearing;
          setCurrentPos([lat, lng]);
          setBearing(brng);
          updateCourierOnMap(lat, lng, brng);
          syncLocationToBackend(lat, lng, brng);
        },
        (err) => console.error('Device GPS error:', err),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [useDeviceGps]);

  // Compute remaining distance & dynamic ETA
  const remainingKm = (() => {
    if (!currentPos || waypoints.length === 0) return trackingData?.distanceKm || 0;
    const dest = waypoints[waypoints.length - 1];
    return haversineDist(currentPos[0], currentPos[1], dest[0], dest[1]);
  })();

  const etaMinutes = Math.max(1, Math.round((remainingKm / (speed || 35)) * 60));

  const pickupCoord = [
    trackingData?.pickupLat || (waypoints.length > 0 ? waypoints[0][0] : 12.9715628),
    trackingData?.pickupLng || (waypoints.length > 0 ? waypoints[0][1] : 80.043079)
  ];
  const dropoffCoord = [
    trackingData?.deliveryLat || (waypoints.length > 0 ? waypoints[waypoints.length - 1][0] : 12.9860),
    trackingData?.deliveryLng || (waypoints.length > 0 ? waypoints[waypoints.length - 1][1] : 80.0650)
  ];

  return (
    <div className="animated-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '520px', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid var(--border)', background: '#FAF8F4', position: 'relative' }}>
      
      {/* MAP TOP BAR (Google Maps Header HUD) */}
      <div style={{ background: '#0D3B2E', color: '#FFF', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981', animation: 'pulseRadar 1.5s infinite' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, letterSpacing: '0.3px' }}>
                {t('liveTrackingTitle')}
              </h3>
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#A7F3D0', padding: '2px 8px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '700' }}>
                {t('courierLiveBadge')}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              Run #{deliveryId} • {trackingData?.foodType || 'Surplus Meals'} ({trackingData?.quantity || '—'} kg)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Map Layer Switcher: Streets / Satellite */}
          <button
            onClick={() => setMapType(mapType === 'streets' ? 'satellite' : 'streets')}
            className="glass-button"
            title="Toggle Map Style"
            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.12)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <Layers size={13} /> {mapType === 'streets' ? 'Satellite' : 'Street'}
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            className="glass-button"
            title={t('centerCourierBtn')}
            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.12)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <LocateFixed size={13} /> {t('centerCourierBtn')}
          </button>

          {/* Direct Turn-by-Turn Route in Google Maps */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${currentPos ? currentPos[0] + ',' + currentPos[1] : pickupCoord[0] + ',' + pickupCoord[1]}&destination=${dropoffCoord[0]},${dropoffCoord[1]}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button"
            style={{
              padding: '6px 11px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#2563EB',
              borderColor: '#1D4ED8',
              color: '#FFF',
              textDecoration: 'none',
              fontWeight: '700'
            }}
            title={t('googleMapsDirections')}
          >
            <Navigation size={13} /> {t('openInGoogleMaps')} ↗
          </a>

          {/* User's Chennai Institute of Technology Link */}
          <a
            href="https://maps.app.goo.gl/1mpbkbppP7ejyKop8"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button"
            style={{
              padding: '6px 10px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(253,224,71,0.18)',
              borderColor: 'rgba(253,224,71,0.4)',
              color: '#FEF08A',
              textDecoration: 'none',
              fontWeight: '700'
            }}
            title="Chennai Institute of Technology Hub"
          >
            <MapPin size={12} color="#FDE047" /> {t('campusHubBadge')}
          </a>

          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* INTERACTIVE LEAFLET MAP CONTAINER */}
      <div style={{ flex: 1, minHeight: '380px', position: 'relative' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />

        {/* FLOATING TELEMETRY HUD (Top Overlay on Map) */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 1000, display: 'flex', gap: '8px', flexWrap: 'wrap', pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
            <Gauge size={18} color="#0284C7" />
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{t('courierSpeed')}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>{isSimulating ? speed : 0} km/h</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
            <MapPin size={18} color="#E65F2B" />
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{t('remainingDistance')}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0F172A' }}>{remainingKm.toFixed(1)} km</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
            <Clock size={18} color="#10B981" />
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{t('etaLabel')}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#10B981' }}>~{etaMinutes} mins</div>
            </div>
          </div>
        </div>

        {/* BOTTOM FLOATING CONTROLS PANEL (On Map) */}
        <div style={{ position: 'absolute', bottom: '14px', left: '14px', right: '14px', zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', padding: '12px 18px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Volunteer & Vehicle Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0D3B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0D3B2E' }}>
                {trackingData?.volunteerName || 'John Deliverer'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {trackingData?.vehicleType || 'Motorcycle'} • {trackingData?.vehicleNumber || 'MH-12-AB-9876'}
              </div>
            </div>
          </div>

          {/* Action & Simulation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {isVolunteer && (
              <>
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="glass-button"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isSimulating ? '#E65F2B' : '#0D3B2E',
                    borderColor: isSimulating ? '#E65F2B' : '#0D3B2E',
                    color: '#FFF'
                  }}
                >
                  {isSimulating ? <Pause size={14} /> : <Play size={14} />}
                  {isSimulating ? t('simPauseBtn') : t('simStartBtn')}
                </button>

                <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '8px', padding: '2px', border: '1px solid #CBD5E1' }}>
                  {[1, 2, 5].map((multiplier) => (
                    <button
                      key={multiplier}
                      onClick={() => setSpeedMultiplier(multiplier)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: speedMultiplier === multiplier ? '#0D3B2E' : 'transparent',
                        color: speedMultiplier === multiplier ? '#FFF' : '#475569'
                      }}
                    >
                      {multiplier}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setUseDeviceGps(!useDeviceGps)}
                  className="glass-button-secondary"
                  title="Toggle Real GPS Mode"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    background: useDeviceGps ? '#DCFCE7' : '#FFF',
                    borderColor: useDeviceGps ? '#10B981' : '#CBD5E1',
                    color: useDeviceGps ? '#15803D' : '#475569'
                  }}
                >
                  <Navigation size={13} /> {t('deviceGpsBtn')}
                </button>
              </>
            )}

            {!isVolunteer && (
              <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulseRadar 1.5s infinite' }} />
                <span>Live GPS Signal Synchronized</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pulse Animation Style */}
      <style>{`
        @keyframes pulseRadar {
          0% {
            transform: scale(0.85);
            opacity: 0.9;
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
