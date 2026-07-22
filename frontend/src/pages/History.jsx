import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { Search, Trash2, Clock, Award, Filter } from 'lucide-react';
import { api } from '../utils/api';

const History = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getInterviews();
        setInterviews(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.deleteInterview(id);
      setInterviews(prev => prev.filter(i => i._id !== id));
      setDeleteId(null);
    } catch (err) { console.error(err); }
  };

  const handleDeleteAll = async () => {
    try {
      await api.deleteAllInterviews();
      setInterviews([]);
      setShowDeleteAll(false);
    } catch (err) { console.error(err); }
  };

  const filtered = interviews
    .filter(i => {
      if (filter === 'completed') return i.status === 'completed';
      if (filter === 'active') return i.status === 'active';
      return true;
    })
    .filter(i => {
      if (!search) return true;
      return (i.title || '').toLowerCase().includes(search.toLowerCase()) ||
             (i.role || '').toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'highest') return (b.score || 0) - (a.score || 0);
      if (sort === 'lowest') return (a.score || 0) - (b.score || 0);
      return 0;
    });

  const relativeDate = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  const scoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 max-w-7xl mx-auto" style={{ paddingTop: '80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-6">Interview <span className="gradient-text">History</span></h1>

          {/* Search & Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input className="form-input" placeholder="Search interviews..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'completed', 'active'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`tab-btn ${filter === f ? 'active' : ''}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="form-input" style={{ width: 'auto', minWidth: '150px' }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
            {interviews.length > 0 && (
              <Button variant="danger" style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }} onClick={() => setShowDeleteAll(true)}>
                <Trash2 size={15} /> Delete All
              </Button>
            )}
          </div>

          {/* Interview Cards */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-spinner" /></div>
          ) : filtered.length === 0 ? (
            <Card className="text-center" style={{ padding: '4rem 2rem' }}>
              <Filter size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No interviews found</h2>
              <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Start your first interview to see it here!</p>
              <Button onClick={() => navigate('/interview')}>Start Interview</Button>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {filtered.map((interview, idx) => (
                <motion.div key={interview._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{interview.title || 'Untitled'}</h3>
                        <span 
                          className={`badge ${interview.status === 'completed' ? 'badge-green' : 'badge-yellow'}`}
                          style={interview.status === 'active' ? { cursor: 'pointer' } : {}}
                          onClick={() => interview.status === 'active' && navigate(`/interview/${interview._id}`)}
                          title={interview.status === 'active' ? 'Click to resume interview' : undefined}
                        >
                          {interview.status}
                        </span>
                      </div>
                      {interview.role && <span className="badge badge-blue" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{interview.role}</span>}
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {relativeDate(interview.createdAt)}</span>
                        {interview.score > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Award size={12} style={{ color: scoreColor(interview.score) }} /> <span style={{ color: scoreColor(interview.score), fontWeight: 600 }}>{interview.score}%</span></span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      {interview.status === 'completed' && <Button style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => navigate(`/results/${interview._id}`)}>View Results</Button>}
                      {interview.status === 'active' && (
                        <Button 
                          style={{ 
                            flex: 1, 
                            padding: '0.5rem', 
                            fontSize: '0.8rem',
                            background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)',
                            border: 'none',
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                          }} 
                          onClick={() => navigate(`/interview/${interview._id}`)}
                        >
                          Resume Interview
                        </Button>
                      )}
                      <Button variant="danger" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setDeleteId(interview._id)}><Trash2 size={14} /></Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Delete Confirmation */}
        {deleteId && (
          <div className="modal-overlay" onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel p-6" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Delete Interview?</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>This will permanently delete this interview and all related data.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="danger" onClick={() => handleDelete(deleteId)} style={{ flex: 1 }}>Delete</Button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteAll && (
          <div className="modal-overlay" onClick={() => setShowDeleteAll(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel p-6" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-red)' }}>Delete All Interviews?</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>This will permanently delete ALL your interviews, questions, and reports. This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={() => setShowDeleteAll(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="danger" onClick={handleDeleteAll} style={{ flex: 1 }}>Delete All</Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default History;
