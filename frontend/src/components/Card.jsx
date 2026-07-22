import React from 'react';

const Card = ({ children, className = '', hover = false, glow = false, ...props }) => {
  const hoverClass = hover ? 'card-hover' : '';
  return (
    <div 
      className={`glass-panel ${hoverClass} ${className}`} 
      style={{ 
        padding: '1.5rem', 
        transition: 'var(--transition-smooth)',
        ...(glow && { boxShadow: 'var(--glass-shadow), var(--glow-blue)' })
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
