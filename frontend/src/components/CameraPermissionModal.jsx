import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertTriangle } from 'lucide-react';
import Button from './Button';

const CameraPermissionModal = ({ isOpen, onAllow, onSkip, error }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1rem'
        }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-panel"
          style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem 2rem' }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1.5rem',
            background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Camera size={28} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Camera & Microphone Access
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            We need access to your camera and microphone for a realistic interview simulation experience.
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#f87171'
            }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={onSkip} style={{ flex: 1 }}>Skip (Text Only)</Button>
            <Button onClick={onAllow} style={{ flex: 1 }}>Allow Access</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraPermissionModal;
