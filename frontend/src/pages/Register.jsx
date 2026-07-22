import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none" style={{ background: 'rgba(59, 130, 246, 0.15)', filter: 'blur(100px)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none" style={{ background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(100px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel p-8 max-w-md w-full z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Create <span className="gradient-text">Account</span>
          </h1>
          <p className="text-sm text-secondary">Start mastering your interview skills</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-secondary mb-1 block">Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-secondary mb-1 block">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-secondary mb-1 block">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: 'not-allowed', padding: '0.75rem 1.5rem' } : { padding: '0.75rem 1.5rem' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserPlus size={16} /> Create Account
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="gradient-text font-semibold" style={{ cursor: 'pointer', textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
