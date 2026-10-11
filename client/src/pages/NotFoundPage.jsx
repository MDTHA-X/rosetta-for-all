import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

export default function NotFoundPage() {
  return (
    <div className="auth-wrapper">
      <Card className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🧭</div>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>404 - Page Not Found</h1>
        <p style={{ color: 'var(--dc-text-muted)', marginBottom: 24 }}>
          The page or route you requested does not exist in the Rosetta workspace.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="primary">
            Return to Rosetta
          </Button>
        </Link>
      </Card>
    </div>
  );
}
