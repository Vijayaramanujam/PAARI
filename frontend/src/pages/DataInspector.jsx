import React, { useState, useEffect } from 'react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import { 
  Database, 
  RefreshCw, 
  Sparkles, 
  ExternalLink, 
  Users, 
  Store, 
  HeartHandshake, 
  Truck, 
  Package, 
  FileText, 
  Navigation, 
  Star, 
  Search,
  CheckCircle,
  Clock,
  Terminal,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export default function DataInspector() {
  const { language, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState('pickupDeliveries');
  const [searchTerm, setSearchTerm] = useState('');
  const [dispatchMsg, setDispatchMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDatabaseSnapshot = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/system/database-inspector');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching database inspector data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseSnapshot();
  }, []);

  const handleQuickDispatch = async () => {
    setActionLoading(true);
    setDispatchMsg('');
    try {
      const res = await api.post('/api/system/quick-dispatch-job');
      setDispatchMsg('⚡ Fresh delivery run created! Delivery ID #' + res.data.deliveryId);
      await fetchDatabaseSnapshot();
      setActiveTable('pickupDeliveries');
    } catch (err) {
      setDispatchMsg('Error dispatching job: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const tables = [
    { key: 'pickupDeliveries', label: 'Pickup Deliveries', icon: Navigation, count: data?.tableCounts?.pickupDeliveries || 0 },
    { key: 'foodDonations', label: 'Food Donations', icon: Package, count: data?.tableCounts?.foodDonations || 0 },
    { key: 'foodRequests', label: 'Food Claims/Requests', icon: FileText, count: data?.tableCounts?.foodRequests || 0 },
    { key: 'users', label: 'System Users', icon: Users, count: data?.tableCounts?.users || 0 },
    { key: 'volunteers', label: 'Volunteers', icon: Truck, count: data?.tableCounts?.volunteers || 0 },
    { key: 'donors', label: 'Donors', icon: Store, count: data?.tableCounts?.donors || 0 },
    { key: 'receivers', label: 'Receivers / NGOs', icon: HeartHandshake, count: data?.tableCounts?.receivers || 0 },
    { key: 'feedbacks', label: 'Feedbacks & Ratings', icon: Star, count: data?.tableCounts?.feedbacks || 0 },
  ];

  const currentRecords = data ? (data[activeTable] || []) : [];

  const filteredRecords = currentRecords.filter((row) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return Object.values(row).some((val) => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(q)
    );
  });

  return (
    <div className="animated-fade" style={{ padding: '40px 24px', maxWidth: '1350px', margin: '0 auto', background: 'var(--background)' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Database size={16} /> Backend Database Inspector & Evidence
          </div>
          <h2 className="text-editorial" style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>
            Live Backend Storage Explorer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px', maxWidth: '650px' }}>
            Direct real-time window into all entities stored inside the persistent H2 database engine. View records, verify coordinates, and launch SQL queries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={fetchDatabaseSnapshot}
            disabled={loading}
            className="glass-button-secondary"
            style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Snapshot
          </button>

          <button
            onClick={handleQuickDispatch}
            disabled={actionLoading}
            className="glass-button"
            style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#D97706', borderColor: '#D97706', color: '#FFF' }}
          >
            <Sparkles size={16} /> ⚡ Dispatch Test Run
          </button>

          <a
            href="/h2-console"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button"
            style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#0D3B2E', color: '#FFF', textDecoration: 'none' }}
          >
            <Terminal size={15} /> Open H2 SQL Console ↗
          </a>
        </div>
      </div>

      {dispatchMsg && (
        <div className="badge-success animated-fade" style={{ padding: '14px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{dispatchMsg}</span>
          <button onClick={() => setDispatchMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
        </div>
      )}

      {/* METADATA & PERSISTENCE INFO BANNER */}
      {data?.metadata && (
        <div className="glass-panel" style={{ padding: '18px 24px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', background: '#FAF6EE', border: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Storage Persistence Mode</div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0D3B2E', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#10B981" /> {data.metadata.storageMode}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>H2 Console JDBC URL</div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#B45309', marginTop: '2px', fontFamily: 'monospace' }}>
              {data.metadata.jdbcUrl}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>H2 Credentials</div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>
              User: <code>{data.metadata.h2User}</code> • Password: <em>blank</em>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Last Snapshot Time</div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} /> {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* STAT METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {tables.map((t) => {
          const Icon = t.icon;
          const isSelected = activeTable === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setActiveTable(t.key); setSearchTerm(''); }}
              className="glass-panel"
              style={{
                padding: '14px 16px',
                textAlign: 'left',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: isSelected ? '#FAF6EE' : '#FFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <Icon size={18} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: isSelected ? 'var(--primary)' : 'var(--text-dark)' }}>
                  {t.count}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: isSelected ? '800' : '600', color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                {t.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* TABLE DATA EXPLORER PANEL */}
      <div className="glass-panel" style={{ padding: '24px', background: '#FFF' }}>
        
        {/* Table Search & Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', margin: 0, textTransform: 'capitalize' }}>
              Table: <code>{activeTable}</code> ({filteredRecords.length} records)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing live records directly from backend persistence layer
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={`Filter in ${activeTable}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '0.85rem', width: '100%' }}
            />
          </div>
        </div>

        {/* Dynamic Table Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p>Loading database records from Spring Boot backend...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Database size={32} style={{ opacity: 0.4, margin: '0 auto 10px auto' }} />
            <p>No records match your criteria in <code>{activeTable}</code>.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '560px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#FAF6EE', borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, zIndex: 2 }}>
                  {Object.keys(filteredRecords[0]).map((colKey) => (
                    <th key={colKey} style={{ padding: '12px 14px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                      {colKey}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? '#FFFFFF' : '#FDFBF7' }}>
                    {Object.entries(row).map(([k, v], cellIdx) => {
                      const strVal = v === null || v === undefined ? 'null' : String(v);
                      const isStatus = k.toLowerCase().includes('status');
                      const isCoords = k.toLowerCase().includes('latitude') || k.toLowerCase().includes('longitude') || k.toLowerCase().includes('bearing');
                      return (
                        <td key={cellIdx} style={{ padding: '10px 14px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          {isStatus ? (
                            <span className={`badge ${strVal === 'ACTIVE' || strVal === 'ASSIGNED' || strVal === 'AVAILABLE' ? 'badge-success' : strVal === 'DELIVERED' || strVal === 'COMPLETED' ? 'badge-info' : 'badge-warning'}`}>
                              {strVal}
                            </span>
                          ) : isCoords ? (
                            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#B45309' }}>
                              📍 {strVal}
                            </span>
                          ) : k === 'id' ? (
                            <span style={{ fontWeight: '800', color: 'var(--primary)' }}>#{strVal}</span>
                          ) : k.toLowerCase().includes('email') ? (
                            <span style={{ fontFamily: 'monospace', color: '#1E40AF' }}>{strVal}</span>
                          ) : (
                            <span>{strVal}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
