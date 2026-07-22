import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'verifying' : 'pending'); // pending, verifying, success, error
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (token) {
      api.verifyEmail(token)
        .then(() => { setStatus('success'); setMessage('Your email has been verified!'); })
        .catch(err => { setStatus('error'); setMessage(err.message || 'Verification failed'); });
    }
  }, [token]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    try {
      await api.sendVerification();
      setMessage('Verification email sent! Check your inbox.');
      setCooldown(60);
    } catch (err) { setMessage(err.message); }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none" style={{ background: 'rgba(59, 130, 246, 0.15)', filter: 'blur(100px)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none" style={{ background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(100px)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 max-w-md w-full z-10 text-center">
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: status === 'success' ? 'rgba(16,185,129,0.1)' : status === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)' }}>
          {status === 'success' ? <CheckCircle size={28} style={{ color: '#10b981' }} /> :
           status === 'error' ? <XCircle size={28} style={{ color: '#ef4444' }} /> :
           status === 'verifying' ? <RefreshCw size={28} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} /> :
           <Mail size={28} style={{ color: 'var(--accent-blue)' }} />}
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {status === 'success' ? 'Email Verified!' :
           status === 'error' ? 'Verification Failed' :
           status === 'verifying' ? 'Verifying...' : 'Verify Your Email'}
        </h1>

        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {message || "We've sent a verification link to your email. Click the link to verify your account."}
        </p>

        {status === 'success' && <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>}
        {status === 'error' && <Button onClick={handleResend} disabled={cooldown > 0}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification'}</Button>}
        {status === 'pending' && <Button onClick={handleResend} disabled={cooldown > 0}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}</Button>}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
