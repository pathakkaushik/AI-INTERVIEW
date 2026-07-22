import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { Shield, Users, BarChart2, Activity, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const Admin = () => {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({});
  const [interviews, setInterviews] = useState([]);
  const [interviewsPagination, setInterviewsPagination] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (tab === 'dashboard') {
      setLoading(true);
      api.getAdminStats().then(res => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'users') {
      setLoading(true);
      api.getAdminUsers(1, search).then(res => { setUsers(res.data || []); setUsersPagination(res.pagination || {}); }).catch(console.error).finally(() => setLoading(false));
    }
  }, [tab, search]);

  useEffect(() => {
    if (tab === 'interviews') {
      setLoading(true);
      api.getAdminInterviews(1).then(res => { setInterviews(res.data || []); setInterviewsPagination(res.pagination || {}); }).catch(console.error).finally(() => setLoading(false));
    }
  }, [tab]);

  const loadUsersPage = (page) => {
    setLoading(true);
    api.getAdminUsers(page, search).then(res => { setUsers(res.data || []); setUsersPagination(res.pagination || {}); }).catch(console.error).finally(() => setLoading(false));
  };

  const loadInterviewsPage = (page) => {
    setLoading(true);
    api.getAdminInterviews(page).then(res => { setInterviews(res.data || []); setInterviewsPagination(res.pagination || {}); }).catch(console.error).finally(() => setLoading(false));
  };

  const handleToggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await api.updateUserRole(userId, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      setDeleteTarget(null);
    } catch (err) { console.error(err); }
  };

  const handleDeleteInterview = async (id) => {
    try {
      await api.deleteAnyInterview(id);
      setInterviews(prev => prev.filter(i => i._id !== id));
      setDeleteTarget(null);
    } catch (err) { console.error(err); }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#3b82f6' },
    { label: 'Total Interviews', value: stats?.totalInterviews || 0, icon: BarChart2, color: '#8b5cf6' },
    { label: 'Avg Score', value: `${stats?.avgScore || 0}%`, icon: Activity, color: '#10b981' },
    { label: 'Active Today', value: stats?.activeToday || 0, icon: Activity, color: '#f59e0b' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 max-w-7xl mx-auto" style={{ paddingTop: '80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-6" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={28} style={{ color: 'var(--accent-purple)' }} /> Admin <span className="gradient-text">Panel</span>
          </h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            {['dashboard', 'users', 'interviews'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab === t ? 'active' : ''}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {tab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {statCards.map((card, i) => (
                <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card style={{ textAlign: 'center' }}>
                    <card.icon size={28} style={{ color: card.color, margin: '0 auto 0.75rem' }} />
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{card.value}</p>
                    <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{card.label}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input className="form-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem', maxWidth: '400px' }} />
              </div>
              {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div> : (
                <Card>
                  <div className="table-container">
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Score</th><th>Joined</th><th>Actions</th></tr></thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id}>
                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                            <td className="text-secondary">{u.email}</td>
                            <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span></td>
                            <td>{u.readinessScore || 0}</td>
                            <td className="text-secondary">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleToggleRole(u._id, u.role)} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                                {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                              </button>
                              <button onClick={() => setDeleteTarget({ type: 'user', id: u._id, name: u.name })} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {usersPagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
                      <button onClick={() => loadUsersPage(usersPagination.page - 1)} disabled={usersPagination.page <= 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronLeft size={18} /></button>
                      <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Page {usersPagination.page} of {usersPagination.pages}</span>
                      <button onClick={() => loadUsersPage(usersPagination.page + 1)} disabled={usersPagination.page >= usersPagination.pages} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronRight size={18} /></button>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}

          {/* Interviews Tab */}
          {tab === 'interviews' && (
            <>
              {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div> : (
                <Card>
                  <div className="table-container">
                    <table className="admin-table">
                      <thead><tr><th>Title</th><th>User</th><th>Score</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                      <tbody>
                        {interviews.map(i => (
                          <tr key={i._id}>
                            <td style={{ fontWeight: 600 }}>{i.title || 'Untitled'}</td>
                            <td className="text-secondary">{i.userId?.name || 'Unknown'}</td>
                            <td>{i.score || 0}%</td>
                            <td><span className={`badge ${i.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}>{i.status}</span></td>
                            <td className="text-secondary">{new Date(i.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button onClick={() => setDeleteTarget({ type: 'interview', id: i._id })} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {interviewsPagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
                      <button onClick={() => loadInterviewsPage(interviewsPagination.page - 1)} disabled={interviewsPagination.page <= 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronLeft size={18} /></button>
                      <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Page {interviewsPagination.page} of {interviewsPagination.pages}</span>
                      <button onClick={() => loadInterviewsPage(interviewsPagination.page + 1)} disabled={interviewsPagination.page >= interviewsPagination.pages} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronRight size={18} /></button>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </motion.div>

        {/* Delete Confirmation */}
        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel p-6" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Delete {deleteTarget.type}?</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {deleteTarget.type === 'user' ? `This will delete ${deleteTarget.name} and all their data.` : 'This will permanently delete this interview.'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="danger" onClick={() => deleteTarget.type === 'user' ? handleDeleteUser(deleteTarget.id) : handleDeleteInterview(deleteTarget.id)} style={{ flex: 1 }}>Delete</Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default Admin;
