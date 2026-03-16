import React from 'react';

export const FloatingParticles = () => {
  return (
    <div className="sparkle-bg">
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="floating-dot"
          style={{
            '--duration': `${10 + Math.random() * 25}s`,
            '--delay': `${Math.random() * 15}s`,
            '--left': `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 3}px`,
            height: `${1 + Math.random() * 3}px`,
            background: Math.random() > 0.5 ? '#fff' : '#00f3ff',
            boxShadow: Math.random() > 0.5
              ? '0 0 10px rgba(255, 255, 255, 0.8)'
              : '0 0 15px rgba(0, 243, 255, 0.6)',
            opacity: 0.1 + Math.random() * 0.4
          } as React.CSSProperties}
        />
      ))}
      <div className="glow-overlay" style={{ top: '10%', left: '5%', opacity: 0.2 }} />
      <div className="glow-overlay" style={{ bottom: '10%', right: '5%', opacity: 0.15, background: 'radial-gradient(circle, rgba(188, 19, 254, 0.05) 0%, transparent 70%)' }} />
    </div>
  );
};
