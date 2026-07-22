import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { api } from '../utils/api';

const Leaderboard = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('all');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard(period)
      .then(res => setLeaders(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const rankStyle = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown size={24} style={{ color: '#f59e0b' }} />;
    if (rank === 2) return <Medal size={24} style={{ color: '#94a3b8' }} />;
    if (rank === 3) return <Medal size={24} style={{ color: '#cd7f32' }} />;
    return null;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 max-w-5xl mx-auto" style={{ paddingTop: '80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 className="text-3xl font-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Trophy size={32} style={{ color: '#f59e0b' }} /> Leader<span className="gradient-text">board</span>
            </h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'month', 'week'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`tab-btn ${period === p ? 'active' : ''}`}>
                  {p === 'all' ? 'All Time' : p === 'month' ? 'This Month' : 'This Week'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-spinner" /></div>
          ) : leaders.length === 0 ? (
            <Card className="text-center" style={{ padding: '4rem' }}>
              <TrendingUp size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
              <h2 style={{ fontWeight: 600 }}>No data yet</h2>
              <p className="text-secondary">Complete interviews to appear on the leaderboard!</p>
            </Card>
          ) : (
            <>
              {/* Top 3 Podium */}
              <div style={{ display: 'grid', gridTemplateColumns: top3.length >= 3 ? '1fr 1.2fr 1fr' : `repeat(${top3.length}, 1fr)`, gap: '1rem', marginBottom: '2rem', alignItems: 'end' }}>
                {top3.length >= 2 && (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className={rankStyle(2)} style={{ textAlign: 'center', padding: '1.5rem' }}>
                      {rankIcon(2)}
                      <h3 style={{ fontWeight: 600, marginTop: '0.5rem', fontSize: '1rem' }}>{top3[1].name}</h3>
                      <p style={{ fontSize: '2rem', fontWeight: 700, color: '#94a3b8' }}>{top3[1].readinessScore}</p>
                      <p className="text-secondary" style={{ fontSize: '0.75rem' }}>{top3[1].totalInterviews} interviews</p>
                    </Card>
                  </motion.div>
                )}
                {top3.length >= 1 && (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className={rankStyle(1)} style={{ textAlign: 'center', padding: '2rem' }}>
                      {rankIcon(1)}
                      <h3 style={{ fontWeight: 700, marginTop: '0.5rem', fontSize: '1.25rem' }}>{top3[0].name}</h3>
                      <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f59e0b' }}>{top3[0].readinessScore}</p>
                      <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{top3[0].totalInterviews} interviews • {top3[0].topSkill}</p>
                    </Card>
                  </motion.div>
                )}
                {top3.length >= 3 && (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className={rankStyle(3)} style={{ textAlign: 'center', padding: '1.5rem' }}>
                      {rankIcon(3)}
                      <h3 style={{ fontWeight: 600, marginTop: '0.5rem', fontSize: '1rem' }}>{top3[2].name}</h3>
                      <p style={{ fontSize: '2rem', fontWeight: 700, color: '#cd7f32' }}>{top3[2].readinessScore}</p>
                      <p className="text-secondary" style={{ fontSize: '0.75rem' }}>{top3[2].totalInterviews} interviews</p>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Rest of leaderboard */}
              {rest.length > 0 && (
                <Card>
                  <div className="table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Rank</th><th>Name</th><th>Score</th><th>Interviews</th><th>Top Skill</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rest.map(entry => (
                          <tr key={entry._id} style={entry._id === user?._id || entry._id === user?.id ? { background: 'rgba(59,130,246,0.05)', borderLeft: '3px solid var(--accent-blue)' } : {}}>
                            <td style={{ fontWeight: 600 }}>#{entry.rank}</td>
                            <td>{entry.name} {(entry._id === user?._id || entry._id === user?.id) && <span className="badge badge-blue" style={{ marginLeft: '0.5rem' }}>You</span>}</td>
                            <td style={{ fontWeight: 600 }}>{entry.readinessScore}</td>
                            <td>{entry.totalInterviews}</td>
                            <td>{entry.topSkill}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Leaderboard;
