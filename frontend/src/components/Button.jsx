import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = {
    padding: '0.7rem 1.4rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    letterSpacing: '-0.01em',
  };

  const variants = {
    primary: {
      background: 'var(--accent-gradient)',
      color: '#fff',
      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1)',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.04)',
      color: 'var(--text-primary)',
      border: '1px solid var(--panel-border)',
      boxShadow: 'var(--glass-shadow)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--accent-blue)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.08)',
      color: 'var(--accent-red)',
      border: '1px solid rgba(239, 68, 68, 0.15)',
    }
  };

  const { style, ...otherProps } = props;

  const customStyles = {
    ...baseStyles,
    ...variants[variant],
    ...(style || {})
  };

  return (
    <button 
      className={`btn-${variant} ${className}`} 
      style={customStyles}
      {...otherProps}
    >
      {children}
    </button>
  );
};

export default Button;
