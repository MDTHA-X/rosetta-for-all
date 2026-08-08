import React from 'react';

export default function App() {
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#800000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#ffffff',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      <h1
        style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: 0,
          textShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        Welcome to Rosetta , CSE-JU
      </h1>
    </div>
  );
}
