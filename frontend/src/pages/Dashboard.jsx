import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import SkillRadarChart from '../components/SkillRadarChart';
import { Video, BarChart2, Briefcase, Plus, Settings, User, LogOut, Copy, Sparkles, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isRecruiterView, setIsRecruiterView] = useState(false);
  const [stats, setStats] = useState(null);
  const [recruiterData, setRecruiterData] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Cheat Sheet states
  const [cheatTopic, setCheatTopic] = useState('');
  const [cheatSheet, setCheatSheet] = useState('');
  const [cheatLoading, setCheatLoading] = useState(false);
  const [cheatCopied, setCheatCopied] = useState(false);

  const handleGenerateCheatSheet = async (e) => {
    e.preventDefault();
    if (!cheatTopic.trim()) return;
    setCheatLoading(true);
    setCheatSheet('');
    try {
      const res = await api.generateCheatSheet({ topic: cheatTopic });
      if (res.success) {
        setCheatSheet(res.data);
      }
    } catch (err) {
      console.error('Failed to generate cheat sheet:', err);
    } finally {
      setCheatLoading(false);
    }
  };

  const handleCopyCheatSheet = async () => {
    if (!cheatSheet) return;
    try {
      await navigator.clipboard.writeText(cheatSheet);
      setCheatCopied(true);
      setTimeout(() => setCheatCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy cheat sheet:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recruiterRes] = await Promise.all([
          api.getDashboardStats(),
          api.getRecruiterView(),
        ]);
        setStats(statsRes.data || statsRes);
        setRecruiterData(recruiterRes);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner" />
          <p className="text-secondary text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = stats?.user?.name || 'User';
  const readinessScore = stats?.user?.readinessScore || '—';
  const recentInterviews = stats?.recentInterviews || [];
  const progress = stats?.user?.progress || {};
  const technicalProgress = progress.technical ?? 85;
  const behavioralProgress = progress.behavioral ?? 70;
  const bodyLanguageProgress = progress.bodyLanguage ?? 92;

  const technicalSkills = recruiterData?.data?.technicalSkills ?? recruiterData?.technicalSkills ?? 92;
  const communication = recruiterData?.data?.communication ?? recruiterData?.communication ?? 88;
  const confidence = recruiterData?.data?.confidence ?? recruiterData?.confidence ?? 76;
  const aiInsights = recruiterData?.data?.aiInsights || recruiterData?.aiInsights || [
    '🟢 Excellent system design breakdown.',
    '🟢 High eye-contact maintained during technical explanation.',
    '🟡 Slight hesitation detected during behavioral questions.',
  ];
  const hireRecommendation = recruiterData?.data?.hireSuggestion || recruiterData?.data?.hireRecommendation || recruiterData?.hireRecommendation || 'HIRE SUGGESTED';

  return (
    <>
    <Navbar />
    <div className="min-h-screen p-8 max-w-5xl mx-auto" style={{ paddingTop: '80px' }}>
      
      {/* Premium Hero Card */}
      <div 
        className="glass-panel p-6 mb-8 relative overflow-hidden" 
        style={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.06) 50%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05), inset 0 0 80px rgba(99, 102, 241, 0.05)'
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.1)', padding: '0.35rem 0.8rem', borderRadius: '100px', marginBottom: '1rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Interview Platform</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ 
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, var(--text-primary), rgba(255,255,255,0.7))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}>
            Welcome back, {userName}
          </h1>
          <p className="text-sm text-secondary" style={{ maxWidth: '480px', lineHeight: '1.5' }}>
            Keep practicing to build muscle memory, reduce behavioral anxiety, and master complex system design interviews with live AI tracking.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Button onClick={() => navigate('/interview')}>
              <Plus size={16} /> Start New Interview
            </Button>
            <div className="glass-panel px-4 py-2 flex items-center gap-2 cursor-pointer" 
              onClick={() => setIsRecruiterView(!isRecruiterView)}
              style={{ borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ 
                width: '32px', 
                height: '16px', 
                borderRadius: '9999px', 
                position: 'relative', 
                transition: 'background-color 0.3s ease', 
                background: isRecruiterView ? 'var(--accent-purple)' : 'rgba(255,255,255,0.15)', 
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'inline-block',
                verticalAlign: 'middle'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '2px', 
                  left: isRecruiterView ? '18px' : '2px', 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: '#fff', 
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                }} />
              </div>
              <span className="text-xs font-semibold">{isRecruiterView ? 'Recruiter View' : 'Candidate View'}</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="glass-panel px-4 py-2 flex items-center gap-2 cursor-pointer text-xs font-semibold"
              style={{ borderRadius: 'var(--radius-full)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)', background: 'rgba(239, 68, 68, 0.05)' }}
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>

        {/* Dynamic SVG Circular Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '20px', border: '1px solid var(--panel-border)' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="32" stroke="var(--panel-border)" strokeWidth="6" fill="transparent" />
              <circle 
                cx="40" cy="40" r="32" 
                stroke="url(#readinessGrad)" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={(2 * Math.PI * 32) - ((parseInt(readinessScore) || 0) / 100) * (2 * Math.PI * 32)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <defs>
                <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {readinessScore}%
            </div>
          </div>
          <div>
            <p className="text-xs text-secondary font-bold uppercase tracking-wider" style={{ marginBottom: '2px' }}>Readiness</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Interview Ready</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {!isRecruiterView && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel p-4 flex items-center gap-4" style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
              <Video size={18} style={{ color: '#6366f1' }}/>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{recentInterviews.length}</p>
              <p className="text-xs text-secondary">Practice Sessions Completed</p>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4" style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
              <BarChart2 size={18} style={{ color: '#a855f7' }}/>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {recentInterviews.length > 0 
                  ? `${Math.round(recentInterviews.reduce((sum, item) => sum + (parseInt(item.score) || 0), 0) / recentInterviews.length)}/100`
                  : '—'}
              </p>
              <p className="text-xs text-secondary">Average Session Score</p>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4" style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <Briefcase size={18} style={{ color: '#10b981' }}/>
            </div>
            <div>
              <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)', maxWidth: '180px' }}>
                {recentInterviews[0]?.title ? recentInterviews[0].title.split(' - ')[0] : 'None'}
              </p>
              <p className="text-xs text-secondary">Last Active Role Focus</p>
            </div>
          </div>
        </div>
      )}

      {isRecruiterView ? (
        // Recruiter View Dashboard
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><User size={18}/> Candidate Evaluation</h2>
                <div className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">{hireRecommendation}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                  <p className="text-xs text-secondary mb-1">Technical Skills</p>
                  <p className="text-xl font-bold">{technicalSkills}/100</p>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                  <p className="text-xs text-secondary mb-1">Communication</p>
                  <p className="text-xl font-bold">{communication}/100</p>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                  <p className="text-xs text-secondary mb-1">Confidence</p>
                  <p className="text-xl font-bold">{confidence}/100</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-2">AI Insights</h3>
              <ul className="text-sm text-secondary gap-2 flex flex-col">
                {aiInsights.map((insight, i) => (
                  <li key={i} className="flex items-center gap-2">{insight}</li>
                ))}
              </ul>
            </Card>
          </div>
          <div>
            <Card className="h-full flex flex-col">
              <h2 className="text-lg font-semibold mb-2">Skill Heatmap</h2>
              <p className="text-xs text-secondary mb-4">Comparing baseline vs interview performance.</p>
              <div className="flex-1 flex items-center justify-center -mt-4">
                <SkillRadarChart data={recruiterData?.skillRadarData} />
              </div>
            </Card>
          </div>
        </motion.div>
      ) : (
        // Candidate View Dashboard
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <Card style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Video size={18} style={{ color: 'var(--accent-blue)' }}/> Recent Interviews
              </h2>
              <div className="flex flex-col gap-1">
                {recentInterviews.length > 0 ? recentInterviews.map((int, i) => (
                  <div key={int._id || int.id || i} 
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-smooth"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      marginBottom: '0.75rem', 
                      border: '1px solid var(--panel-border)', 
                      borderRadius: '12px',
                      padding: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        color: 'var(--accent-blue)',
                        fontWeight: '700',
                        fontSize: '1rem',
                        textTransform: 'uppercase'
                      }}>
                        {int.title ? int.title.charAt(0) : 'I'}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{int.title}</p>
                        <p className="text-xs text-secondary" style={{ marginTop: '2px' }}>{int.date || 'Recent'} • {int.duration || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {int.status === 'active' ? (
                        <div style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          color: '#f59e0b',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          minWidth: '76px',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/interview/${int._id || int.id}`)}
                        title="Click to resume interview"
                        >
                          Active
                        </div>
                      ) : (
                        <div style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: 'var(--radius-full)',
                          background: (int.score || 0) >= 80 
                            ? 'rgba(16, 185, 129, 0.08)' 
                            : (int.score || 0) >= 60 
                              ? 'rgba(245, 158, 11, 0.08)' 
                              : 'rgba(239, 68, 68, 0.08)',
                          border: `1px solid ${
                            (int.score || 0) >= 80 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : (int.score || 0) >= 60 
                                ? 'rgba(245, 158, 11, 0.2)' 
                                : 'rgba(239, 68, 68, 0.2)'
                          }`,
                          color: (int.score || 0) >= 80 
                            ? '#10b981' 
                            : (int.score || 0) >= 60 
                              ? '#f59e0b' 
                              : '#ef4444',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          minWidth: '76px'
                        }}>
                          {int.score ? `${int.score}/100` : '—'}
                        </div>
                      )}

                      {int.status === 'active' ? (
                        <Button 
                          style={{ 
                            padding: '0.45rem 1rem', 
                            fontSize: '0.8rem', 
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)',
                            border: 'none',
                            color: '#fff',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                          }} 
                          onClick={() => navigate(`/interview/${int._id || int.id}`)}
                        >
                          Resume
                        </Button>
                      ) : (
                        <Button variant="outline" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '10px' }} onClick={() => navigate(`/results/${int._id || int.id}`)}>View Details</Button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-secondary text-sm">
                    <p>No interviews yet. Start your first one!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col h-full" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BarChart2 size={18} style={{ color: 'var(--accent-blue)' }}/> Progress
              </h2>
              <div className="flex-1 flex flex-col justify-center gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2" style={{ fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Technical Skills</span>
                    <span style={{ color: 'var(--accent-blue)' }}>{technicalProgress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${technicalProgress}%`, background: 'linear-gradient(90deg, #6366f1, #3b82f6)', borderRadius: '9999px', transition: 'width 0.5s ease-out' }}/>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2" style={{ fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Behavioral</span>
                    <span style={{ color: 'var(--accent-purple)' }}>{behavioralProgress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${behavioralProgress}%`, background: 'linear-gradient(90deg, #a855f7, #ec4899)', borderRadius: '9999px', transition: 'width 0.5s ease-out' }}/>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2" style={{ fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Body Language</span>
                    <span style={{ color: 'var(--accent-green)' }}>{bodyLanguageProgress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${bodyLanguageProgress}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '9999px', transition: 'width 0.5s ease-out' }}/>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* AI Cheat Sheet Generator widget */}
      {!isRecruiterView && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8">
          <Card style={{ padding: '1.75rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Sparkles size={18} style={{ color: 'var(--accent-purple)' }}/> AI Interview Prep Notes & Cheat Sheet
                </h2>
                <p className="text-xs text-secondary mt-1">
                  Instantly generate key concept summaries, interview questions, code snippets, and key terminology for any topic.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateCheatSheet} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter a topic (e.g. React Lifecycle, SQL Joins, System Design Patterns)..."
                value={cheatTopic}
                onChange={(e) => setCheatTopic(e.target.value)}
                className="flex-1 p-3 rounded-lg text-sm border"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'var(--panel-border)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  minWidth: '280px'
                }}
              />
              <Button type="submit" disabled={cheatLoading || !cheatTopic.trim()} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', minWidth: '150px' }}>
                {cheatLoading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="loading-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                    Generating...
                  </span>
                ) : 'Generate Notes'}
              </Button>
            </form>

            {cheatLoading && (
              <div className="flex flex-col gap-4 py-8 items-center justify-center">
                <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem', borderWidth: '3px' }} />
                <p className="text-sm text-secondary animate-pulse">Formulating expert notes and interview templates...</p>
              </div>
            )}

            {cheatSheet && !cheatLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-xl border relative" style={{ background: 'rgba(0, 0, 0, 0.25)', borderColor: 'var(--panel-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen size={14} /> Generated Notes: {cheatTopic}
                  </span>
                  <Button variant="outline" onClick={handleCopyCheatSheet} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Copy size={12} /> {cheatCopied ? 'Copied!' : 'Copy Markdown'}
                  </Button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-500/20" style={{ textAlign: 'left' }}>
                  {renderMarkdown(cheatSheet)}
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};

const parseInlineStyles = (text) => {
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-extrabold text-white">{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeLines = [];
  let codeLanguage = '';

  return lines.map((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeContent = codeLines.join('\n');
        codeLines = [];
        return (
          <pre 
            key={index} 
            className="p-4 rounded-lg my-3 font-mono text-xs overflow-x-auto text-left"
            style={{ background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#38bdf8' }}
          >
            {codeLanguage && (
              <div className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-2 select-none border-b border-white/5 pb-1">
                {codeLanguage}
              </div>
            )}
            <code>{codeContent}</code>
          </pre>
        );
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3);
        return null;
      }
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return null;
    }

    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-xl font-extrabold mt-6 mb-3 text-white border-b border-white/10 pb-2">{parseInlineStyles(line.slice(2))}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-lg font-bold mt-5 mb-2 text-white border-b border-white/5 pb-1">{parseInlineStyles(line.slice(3))}</h2>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-base font-semibold mt-4 mb-2 text-indigo-300">{parseInlineStyles(line.slice(4))}</h3>;
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.trim().slice(2);
      return (
        <ul key={index} className="list-disc pl-5 my-1 text-sm text-secondary text-left font-body">
          <li>{parseInlineStyles(content)}</li>
        </ul>
      );
    }

    if (!line.trim()) {
      return <div key={index} className="h-2" />;
    }

    return <p key={index} className="text-sm text-secondary leading-relaxed my-2 text-left">{parseInlineStyles(line)}</p>;
  });
};

export default Dashboard;
