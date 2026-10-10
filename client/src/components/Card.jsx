import React from 'react';

export default function Card({ children, className = '', style = {}, glow = false, ...props }) {
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        ...(glow ? { animation: 'pulseGlow 4s infinite ease-in-out' } : {}),
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
