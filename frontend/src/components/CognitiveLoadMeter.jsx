import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CognitiveLoadMeter = ({ externalLoad }) => {
  const [load, setLoad] = useState(50);
  const [status, setStatus] = useState('Optimal Focus');

  useEffect(() => {
    if (externalLoad !== undefined) {
      setLoad(externalLoad);
      if (externalLoad > 65) setStatus('High Cognitive Load');
      else if (externalLoad < 40) setStatus('Under-stimulated');
      else setStatus('Optimal Focus');
      return;
    }
    const interval = setInterval(() => {
      const newLoad = Math.floor(Math.random() * 40) + 30;
      setLoad(newLoad);
      if (newLoad > 65) setStatus('High Cognitive Load');
      else if (newLoad < 40) setStatus('Under-stimulated');
      else setStatus('Optimal Focus');
    }, 3000);
    return () => clearInterval(interval);
  }, [externalLoad]);

  const getColor = () => {
    if (load > 65) return 'var(--accent-red)';
    if (load < 40) return 'var(--accent-yellow)';
    return 'var(--accent-blue)';
  };

  return (
    <div className="glass-panel p-4 mt-4" style={{ width: '100%' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-secondary">Cognitive Load</span>
        <span className="text-xs" style={{ color: getColor() }}>{status}</span>
      </div>
      <div style={{ height: '8px', background: 'var(--panel-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${load}%` }}
          transition={{ type: 'spring', stiffness: 50 }}
          style={{ height: '100%', background: getColor(), borderRadius: 'var(--radius-full)' }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-secondary">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
};

export default CognitiveLoadMeter;
