'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppError({ error, reset }) {
  useEffect(() => {
    console.error('Route error caught:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--astryx-bg-primary, #070709)',
      color: 'var(--astryx-text-primary, #f8fafc)',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: 'var(--astryx-surface-1, #12131a)',
        border: '1px solid rgba(229, 192, 123, 0.25)',
        borderRadius: '16px',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          color: '#ef4444',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '16px',
        }}>
          ⚠
        </div>

        <h2 style={{ fontSize: '1.3rem', margin: '0 0 8px 0', color: '#fff', fontWeight: 700 }}>
          Portal View Safely Recovered
        </h2>

        <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 20px 0' }}>
          A client-side issue occurred in this section. The BAVI safety boundary caught the exception so your dashboard remains protected.
        </p>

        {error?.message && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.78rem',
            color: '#ef4444',
            fontFamily: 'monospace',
            marginBottom: '20px',
            textAlign: 'left',
            wordBreak: 'break-word',
            maxHeight: '90px',
            overflowY: 'auto',
          }}>
            {error.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            style={{
              background: 'linear-gradient(135deg, #f7e6be, #e5c07b, #af8938)',
              color: '#070709',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Retry View
          </button>

          <Link
            href="/dashboard"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Command Center
          </Link>
        </div>
      </div>
    </div>
  );
}
