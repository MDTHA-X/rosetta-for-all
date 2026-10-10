import React from 'react';

export default function LoadingSpinner({ size = 20, message = '' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span
        className="spinner"
        style={{
          width: size,
          height: size,
          borderWidth: size > 24 ? 3 : 2
        }}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <span style={{ fontSize: '0.9rem', color: 'var(--dc-text-muted)' }}>
          {message}
        </span>
      )}
    </div>
  );
}
