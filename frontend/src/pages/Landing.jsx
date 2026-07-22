import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { BrainCircuit, Eye, Activity, ShieldCheck, Video, ArrowRight } from 'lucide-react';

// Sub-Component: SimulatorDemoTour (Option 2 - Mock Dashboard Slideshow/Animation)
const SimulatorDemoTour = ({ navigate }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "1. Calibration & Setup",
      description: "AI calibrates your camera, microphone, and background lighting.",
      content: (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          {/* Mock Camera Feed with Scanning Laser */}
          <div className="relative w-48 h-32 rounded-lg border-2 border-dashed border-indigo-500/50 bg-indigo-950/20 flex items-center justify-center overflow-hidden mb-4 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            {/* Pulsing scanning line */}
            <div 
              className="absolute left-0 w-full h-[2px] bg-indigo-400" 
              style={{
                animation: 'scanLine 2s linear infinite',
                boxShadow: '0 0 8px #818cf8'
              }}
            />
            {/* Silhouette / Camera icon */}
            <div className="text-indigo-400 flex flex-col items-center gap-1 animate-pulse">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span className="text-[10px] uppercase font-mono tracking-wider">Webcam Active</span>
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-400 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            System Ready. Click Enter Simulator to start.
          </div>
        </div>
      )
    },
    {
      title: "2. Live AI Interactive Interview",
      description: "Answer adaptive questions while AI monitors speech pace, posture, and vocabulary.",
      content: (
        <div className="flex flex-col h-full p-6 justify-between">
          {/* Question Box */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-left">
            <div className="text-[9px] uppercase font-bold text-indigo-400 mb-1">Question 2 of 5</div>
            <div className="text-xs text-white font-medium leading-snug">"How do you handle state optimization in large React applications?"</div>
          </div>

          {/* Voice Waveform Animation */}
          <div className="flex items-center justify-center gap-1 my-3 h-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((val, idx) => (
              <div 
                key={idx} 
                className="w-1 rounded-full bg-indigo-500" 
                style={{ 
                  height: `${val * 4}px`,
                  animation: `waveform 1.2s ease-in-out infinite alternate`,
                  animationDelay: `${idx * 0.08}s`
                }}
              />
            ))}
          </div>

          {/* Real-time Analytics Overlay */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
              <div className="text-[8px] text-secondary uppercase">Speech Pace</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">135 WPM</div>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
              <div className="text-[8px] text-secondary uppercase">Posture</div>
              <div className="text-xs font-bold text-blue-400 mt-0.5">Stable (95%)</div>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
              <div className="text-[8px] text-secondary uppercase">Eye Contact</div>
              <div className="text-xs font-bold text-purple-400 mt-0.5">Focus: Active</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Comprehensive Diagnostics",
      description: "Get detailed transparency scores, strengths, improvement areas, and a radar skill chart.",
      content: (
        <div className="flex flex-col h-full p-6 justify-between">
          <div className="flex gap-4 items-center justify-center">
            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/5"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeWidth="3.5"
                  strokeDasharray="85, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(52, 211, 153, 0.4))' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-base font-extrabold text-white">85</span>
                <span className="text-[8px] text-secondary">Overall</span>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="flex-1 space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Strength: React Optimization
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                Action: Increase algorithms depth
              </div>
            </div>
          </div>

          {/* Quick Stats list */}
          <div className="mt-2 p-2 rounded bg-white/5 border border-white/5 text-[10px] text-secondary text-left leading-normal">
            📊 AI parsed <span className="text-white font-medium">1,820 words</span>, analyzed posture stability, and benchmarked your scores against 1,200+ industry candidates.
          </div>
        </div>
      )
    }
  ];

  // Auto transition step every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row h-[320px] bg-black/60 relative overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      
      {/* CSS Keyframes injected directly for mock animations */}
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes waveform {
          from { transform: scaleY(1); }
          to { transform: scaleY(2.2); }
        }
      `}</style>

      {/* Left side: Guide / Navigation */}
      <div className="md:w-2/5 p-5 border-r border-white/10 flex flex-col justify-between bg-white/[0.01]">
        <div className="space-y-4">
          {steps.map((s, idx) => (
            <div 
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`p-3 rounded-lg border cursor-pointer transition-smooth text-left ${
                currentStep === idx 
                  ? 'bg-indigo-500/10 border-indigo-500/30' 
                  : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <h4 className={`text-xs font-semibold ${currentStep === idx ? 'text-white' : 'text-secondary'}`}>{s.title}</h4>
              {currentStep === idx && (
                <p className="text-[10px] text-secondary mt-1 leading-normal">{s.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Step Indicators */}
        <div className="flex gap-1.5 justify-center md:justify-start mt-4">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              onClick={() => setCurrentStep(idx)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-smooth ${currentStep === idx ? 'bg-indigo-500 w-4' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>

      {/* Right side: Interactive Visualizer display */}
      <div className="flex-1 bg-gradient-to-br from-indigo-950/20 via-black/40 to-black/80 relative overflow-hidden">
        {steps[currentStep].content}
      </div>
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden flex flex-col items-center justify-center p-6 text-center" style={{ paddingTop: '100px' }}>
      
      {/* Floating Navbar */}
      <nav style={{
        position: 'fixed',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 3rem)',
        maxWidth: '1000px',
        height: '56px',
        borderRadius: 'var(--radius-full)',
        background: 'rgba(22, 22, 35, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 1000,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <BrainCircuit size={18} style={{ color: 'var(--accent-blue)' }} />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>AI Interview</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" style={{ padding: '0.35rem 1.1rem', fontSize: '0.75rem', borderRadius: '100px' }} onClick={() => navigate('/login')}>Login</Button>
          <Button style={{ padding: '0.35rem 1.1rem', fontSize: '0.75rem', borderRadius: '100px' }} onClick={() => navigate('/register')}>Register</Button>
        </div>
      </nav>

      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 text-sm text-blue-400" style={{ border: '1px solid rgba(99, 102, 241, 0.25)', background: 'rgba(99, 102, 241, 0.05)' }}>
          <BrainCircuit size={16} />
          <span style={{ fontWeight: '600', fontSize: '0.8rem', letterSpacing: '0.02em' }}>Next-Gen AI Interview Technology</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight" style={{ lineHeight: '1.1', letterSpacing: '-0.04em' }}>
          Master the Interview.<br/>
          <span className="animated-gradient-text">Impress the Algorithm.</span>
        </h1>
        
        <p className="text-lg text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
          The only AI simulator that analyzes your cognitive load, body language, and speech patterns to prepare you for the toughest tech interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <motion.div 
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Button onClick={() => navigate('/dashboard')} style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}>
              Enter Simulator <ArrowRight size={16}/>
            </Button>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Button variant="secondary" style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }} onClick={() => setIsDemoOpen(true)}>
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl z-10 w-full"
      >
        <motion.div 
          whileHover={{ y: -6, scale: 1.02, boxShadow: '0 12px 30px rgba(99,102,241,0.12)', borderColor: 'rgba(99,102,241,0.3)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="glass-panel p-6 text-left"
          style={{ borderRadius: '16px' }}
        >
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400" style={{ border: '1px solid rgba(59, 130, 246, 0.15)' }}>
            <Eye size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Micro-Expression Analysis</h3>
          <p className="text-sm text-secondary leading-relaxed">Real-time tracking of eye contact, posture, and confidence metrics.</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -6, scale: 1.02, boxShadow: '0 12px 30px rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.3)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="glass-panel p-6 text-left"
          style={{ borderRadius: '16px' }}
        >
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 text-purple-400" style={{ border: '1px solid rgba(168, 85, 247, 0.15)' }}>
            <Activity size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Cognitive Load Mapping</h3>
          <p className="text-sm text-secondary leading-relaxed">Detects hesitation and processing delays to refine your answer delivery.</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -6, scale: 1.02, boxShadow: '0 12px 30px rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="glass-panel p-6 text-left"
          style={{ borderRadius: '16px' }}
        >
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400" style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Recruiter-View Dashboards</h3>
          <p className="text-sm text-secondary leading-relaxed">See exactly what hiring managers see with our predictive scoring engine.</p>
        </motion.div>
      </motion.div>

      {/* How It Works Section */}
      <div className="my-24 max-w-5xl z-10 w-full text-center">
        <h2 className="text-3xl font-extrabold mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>How It Works</h2>
        <p className="text-sm text-secondary mb-12 max-w-lg mx-auto">Get ready for your dream technology interview in 3 simple steps</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Choose Role & Personality', desc: 'Select from 8 technical domains and configure AI interviewer personalities ranging from strict to friendly.' },
            { step: '02', title: 'Complete Practice Session', desc: 'Participate in a dynamic Q&A session with active posture tracking, eye-contact detection, and voice analysis.' },
            { step: '03', title: 'Get Diagnostic Report', desc: 'Receive a recruiter-grade evaluation highlighting your technical strengths, communication clarity, and custom practice path.' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="relative p-6 glass-panel text-left"
              style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--panel-border)' }}
            >
              <div className="text-5xl font-extrabold mb-4" style={{ 
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'var(--font-heading)',
                opacity: 0.8
              }}>
                {item.step}
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
              <p className="text-xs text-secondary leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 mt-20 py-12 z-10" style={{ background: 'rgba(22, 22, 35, 0.3)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          {/* Brand Column */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <BrainCircuit size={18} style={{ color: 'var(--accent-blue)' }} /> AI Interview
            </h3>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              Empowering candidates globally to crack high-stakes technology and leadership interviews using predictive AI modeling and real-time response diagnostics.
            </p>
            {/* Social Media Links */}
            <div className="flex gap-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-smooth" title="GitHub">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-smooth" title="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-secondary hover:text-white hover:bg-white/10 transition-smooth" title="Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* New Column: Domains */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3" style={{ color: 'var(--text-primary)' }}>Domains</h4>
            <ul className="text-xs text-secondary space-y-2 animate-pulse-none" style={{ listStyle: 'none', padding: 0 }}>
              <li className="hover:text-white cursor-pointer transition-smooth">Frontend Engineering</li>
              <li className="hover:text-white cursor-pointer transition-smooth">Backend Engineering</li>
              <li className="hover:text-white cursor-pointer transition-smooth">Fullstack Development</li>
              <li className="hover:text-white cursor-pointer transition-smooth">Mobile Development</li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3" style={{ color: 'var(--text-primary)' }}>Resources</h4>
            <ul className="text-xs text-secondary space-y-2" style={{ listStyle: 'none', padding: 0 }}>
              <li className="hover:text-white cursor-pointer transition-smooth">System Design Guide</li>
              <li className="hover:text-white cursor-pointer transition-smooth">Behavioral STAR Matrix</li>
              <li className="hover:text-white cursor-pointer transition-smooth">Practice Questions</li>
            </ul>
          </div>

          {/* Platform Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3" style={{ color: 'var(--text-primary)' }}>Platform</h4>
            <ul className="text-xs text-secondary space-y-2" style={{ listStyle: 'none', padding: 0 }}>
              <li className="hover:text-white cursor-pointer transition-smooth" onClick={() => navigate('/login')}>Login</li>
              <li className="hover:text-white cursor-pointer transition-smooth" onClick={() => navigate('/register')}>Register</li>
              <li className="hover:text-white cursor-pointer transition-smooth" onClick={() => navigate('/dashboard')}>Simulator</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 border-t border-white/5 mt-8 pt-6 flex justify-between items-center text-xs text-secondary flex-wrap gap-4">
          <p>© {new Date().getFullYear()} AI Interview Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-smooth">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-smooth">Terms of Service</span>
          </div>
        </div>
      </footer>

      {/* Demo Video Modal */}
      {isDemoOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsDemoOpen(false)}
          style={{ zIndex: 2100 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel overflow-hidden w-full max-w-3xl"
            style={{ 
              background: 'var(--panel-bg-solid)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), var(--glow-blue)'
            }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                AI Simulator Demo Tour
              </h3>
              <button 
                onClick={() => setIsDemoOpen(false)}
                className="text-secondary hover:text-white transition-smooth"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', outline: 'none' }}
              >
                &times;
              </button>
            </div>

            {/* Mock Dashboard Walkthrough Simulation */}
            <SimulatorDemoTour navigate={navigate} />

            {/* Modal Footer */}
            <div className="p-4 bg-white/5 flex justify-between items-center">
              <div className="text-xs text-secondary text-left">
                Experience real-time speech pace mapping, expressions tracking, and AI grading.
              </div>
              <Button style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem' }} onClick={() => { setIsDemoOpen(false); navigate('/dashboard'); }}>
                Start Simulator
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Landing;
