import React from 'react';

export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const iconMap = {
    error: '⚠️',
    success: '✅',
    info: 'ℹ️',
    warning: '⚡'
  };

  return (
    <div className={`alert alert-${type} fade-in`} role="alert">
      <span style={{ fontSize: '1.1rem' }}>{iconMap[type] || '•'}</span>
      <span style={{ flex: 1, wordBreak: 'break-word' }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '2px 6px',
            opacity: 0.7
          }}
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
