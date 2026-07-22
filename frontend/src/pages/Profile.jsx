import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Trash2, BarChart2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    api.getProfileStats().then(res => setStats(res.data)).catch(console.error);
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleUpdateProfile = async () => {
    setLoading('profile');
    try {
      const res = await api.updateProfile({ name, email });
      updateUser(res.data);
      showMessage('Profile updated!');
    } catch (err) { showMessage(err.message, 'error'); }
    finally { setLoading(''); }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { showMessage('Passwords do not match', 'error'); return; }
    setLoading('password');
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showMessage('Password changed!');
    } catch (err) { showMessage(err.message, 'error'); }
    finally { setLoading(''); }
  };

  const handleSendVerification = async () => {
    setLoading('verify');
    try {
      await api.sendVerification();
      showMessage('Verification email sent! Check your inbox.');
    } catch (err) { showMessage(err.message, 'error'); }
    finally { setLoading(''); }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      logout();
    } catch (err) { showMessage(err.message, 'error'); }
  };

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 max-w-6xl mx-auto" style={{ paddingTop: '80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-6">Profile & <span className="gradient-text">Settings</span></h1>

          {message.text && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem',
              background: message.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
              border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
              color: message.type === 'error' ? '#f87171' : '#34d399',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />} {message.text}
            </motion.div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '1.5rem' }}>
            {/* Left Column: Profile Card */}
            <div>
              <Card style={{ textAlign: 'center' }}>
                <div className="avatar-circle" style={{ margin: '0 auto 1rem' }}>{initials}</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h2>
                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{user?.email}</p>
                <span className={`badge ${user?.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{user?.role || 'user'}</span>

                {stats && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      <span className="text-secondary"><BarChart2 size={12} style={{ display: 'inline', marginRight: 4 }} />Interviews</span>
                      <span style={{ fontWeight: 600 }}>{stats.totalInterviews}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      <span className="text-secondary">Avg Score</span>
                      <span style={{ fontWeight: 600 }}>{stats.avgScore}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span className="text-secondary"><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />Member Since</span>
                      <span style={{ fontWeight: 600 }}>{new Date(stats.memberSince).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Edit Profile */}
              <Card>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={18} /> Edit Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div><label className="text-secondary" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} /></div>
                  <div><label className="text-secondary" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Email</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                  <Button onClick={handleUpdateProfile} disabled={loading === 'profile'} style={{ alignSelf: 'flex-start' }}>
                    {loading === 'profile' ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Card>

              {/* Change Password */}
              <Card>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={18} /> Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input className="form-input" type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  <input className="form-input" type="password" placeholder="New Password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <input className="form-input" type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  <Button onClick={handleChangePassword} disabled={loading === 'password'} style={{ alignSelf: 'flex-start' }}>
                    {loading === 'password' ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </Card>

              {/* Email Verification */}
              <Card>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={18} /> Email Verification</h3>
                {user?.isEmailVerified ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.875rem' }}>
                    <CheckCircle size={18} /> Email verified
                  </div>
                ) : (
                  <div>
                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Your email is not yet verified. Verify to secure your account.</p>
                    <Button variant="outline" onClick={handleSendVerification} disabled={loading === 'verify'}>
                      {loading === 'verify' ? 'Sending...' : 'Send Verification Email'}
                    </Button>
                  </div>
                )}
              </Card>

              {/* Danger Zone */}
              <Card style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trash2 size={18} /> Danger Zone</h3>
                <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>This will permanently delete your account and all data.</p>
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete Account</Button>
              </Card>
            </div>
          </div>
        </motion.div>

        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-panel p-6" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Delete Account?</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>This cannot be undone. All interviews, results, and data will be lost.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="danger" onClick={handleDeleteAccount} style={{ flex: 1 }}>Delete Forever</Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
