import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Menu, X, LogOut, Shield, LayoutDashboard, Clock, Trophy, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/history', label: 'History', icon: Clock },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Admin', icon: Shield });
  }

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'var(--accent-gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: '#fff',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
          }}>
            AI
          </div>
          <span className="hide-mobile" style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
            fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Interview
          </span>
        </NavLink>

        {/* Desktop Nav Links */}
        <div className="hide-mobile" style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-full)',
          padding: '0.25rem', border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
            >
              <link.icon size={14} style={{ opacity: 0.7 }} />
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />

          {/* User Avatar */}
          <div className="hide-mobile" style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.3rem 0.75rem 0.3rem 0.3rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            cursor: 'default'
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'var(--accent-gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700, color: '#fff'
            }}>
              {initials}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {user?.name || 'User'}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hide-mobile"
            style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.12)',
              color: '#f87171', borderRadius: 'var(--radius-full)',
              padding: '0.4rem 0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.8rem', fontWeight: 500,
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(239, 68, 68, 0.12)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(239, 68, 68, 0.06)'; }}
          >
            <LogOut size={13} /> Logout
          </button>

          {/* Mobile Hamburger */}
          <button
            className="show-mobile-only"
            onClick={() => setMobileOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-primary)', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)', padding: '0.4rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Slide Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'var(--accent-gradient)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, color: '#fff'
                  }}>AI</div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Menu</span>
                </div>
                <button onClick={() => setMobileOpen(false)} style={{
                  background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '8px',
                  padding: '0.3rem', display: 'flex'
                }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem' }}
                  >
                    <link.icon size={16} style={{ opacity: 0.6 }} />
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--panel-border)', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--accent-gradient)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, color: '#fff'
                  }}>{initials}</div>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user?.email || ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.12)',
                    color: '#f87171', borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.4rem', fontSize: '0.85rem', fontWeight: 500
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
