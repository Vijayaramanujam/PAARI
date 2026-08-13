import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserCheck, ShieldAlert, BarChart3, Users, Settings, Filter, ShieldCheck, Check, Trash2, Ban } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'reports'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching system users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/analytics/charts');
      setChartData(res.data);
    } catch(err) {
      console.error('Error fetching analytics charts', err);
      // Fallback chart analytics structure
      setChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        kgsSavedData: [120, 240, 480, 720, 1100, 1420],
        deliveriesData: [6, 12, 18, 25, 34, 46]
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.put(`/api/admin/users/${userId}/toggle-status`);
      setUsers(users.map(u => u.id === userId ? { ...u, status: res.data.status } : u));
    } catch (err) {
      console.error('Failed to change user validation status', err);
    }
  };

  // Compile Chart data for UI
  const getRenderData = () => {
    if (!chartData) return { labels: [], datasets: [] };
    return {
      labels: chartData.labels,
      datasets: [
        {
          label: 'Weight Rescued (kg)',
          data: chartData.kgsSavedData,
          backgroundColor: '#E65F2B',
          borderRadius: 8,
        },
        {
          label: 'Runs Dispatched',
          data: chartData.deliveriesData,
          backgroundColor: '#0F3B2E',
          borderRadius: 8,
        }
      ]
    };
  };

  return (
    <div className="animated-fade" style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', background: 'var(--background)' }}>
      
      {/* Sub Header Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '30px' }}>
        <div>
          <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Administration Panel</span>
          <h2 className="text-editorial" style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>System Control Board</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>Audit network partners, change approval tokens, and monitor macro metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <Users size={16} /> Partner Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={activeTab === 'reports' ? 'glass-button' : 'glass-button-secondary'}
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <BarChart3 size={16} /> Impact Analysis Systems
          </button>
        </div>
      </div>

      {/* VIEW: Accounts Audit Board */}
      {activeTab === 'users' && (
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>Authorized Network Partners Directory</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Updating directory feed...</div>
          ) : (
            <div className="glass-panel" style={{ padding: '0px', overflowX: 'auto', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#FAF6EE', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '18px 24px', fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>NAME & ORGANISATION</th>
                    <th style={{ padding: '18px 24px', fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>EMAIL / CONTACT</th>
                    <th style={{ padding: '18px 24px', fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>NETWORK ROLE</th>
                    <th style={{ padding: '18px 24px', fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>VALIDATION STATUS</th>
                    <th style={{ padding: '18px 24px', fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem', textAlign: 'right' }}>OPERATIONAL OPTION</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role Ref ID: #{u.id}</div>
                      </td>
                      <td style={{ padding: '18px 24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <div>{u.email}</div>
                        <div>{u.phone}</div>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-error' : u.role === 'DONOR' ? 'badge-success' : u.role === 'VOLUNTEER' ? 'badge-warning' : 'badge-info'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px' }}>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.7rem' }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '99px',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              background: u.status === 'ACTIVE' ? 'var(--accent-light)' : 'var(--primary-light)',
                              color: u.status === 'ACTIVE' ? 'var(--accent)' : 'var(--primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {u.status === 'ACTIVE' ? (
                              <>
                                <Ban size={12} /> Suspend Partner
                              </>
                            ) : (
                              <>
                                <Check size={12} /> Approve Partner
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW: Charts Analytical Board */}
      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start' }}>
          
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>Network Flow Growth Performance</h3>
            {chartData ? (
              <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
                <Bar
                  data={getRenderData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            family: 'Plus Jakarta Sans',
                            weight: '700'
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          drawBorder: false
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '50px 0' }}>Assembling chart geometry logs...</div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '800', color: 'var(--primary)' }}>System Operations Overview</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#FAF6EE', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <ShieldCheck size={36} color="var(--primary)" />
                <div>
                  <h4 style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.95rem' }}>Active Security Policies</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>Role verification guarantees JWT tokens are parsed correctly on controllers.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#FAF6EE', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <BarChart3 size={36} color="var(--accent)" />
                <div>
                  <h4 style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.95rem' }}>Ecosystem Carbon Reduction</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>Organic waste prevention stops methane production at city dumps.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
