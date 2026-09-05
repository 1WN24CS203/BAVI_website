'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function UserAppError({ error, reset }) {
  useEffect(() => {
    console.error('Customer Portal route error caught:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#0a0a0a',
      color: '#f8f8f8',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: '#141414',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        borderRadius: '16px',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(201, 168, 76, 0.12)',
          color: '#c9a84c',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '16px',
        }}>
          ✦
        </div>

        <h2 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', color: '#fff', fontWeight: 700 }}>
          View Interrupted
        </h2>

        <p style={{ fontSize: '0.88rem', color: '#a0a0a0', lineHeight: 1.6, margin: '0 0 20px 0' }}>
          This page encountered a temporary interruption. The BAVI safety boundary caught the issue.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #a8893d)',
              color: '#080808',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>

          <Link
            href="/"
            style={{
              background: '#1c1c1c',
              color: '#f8f8f8',
              border: '1px solid #333',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
