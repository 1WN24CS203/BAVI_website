'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global application error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>BAVI Portal — System Recovery</title>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#070709',
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}>
        <div style={{
          maxWidth: '560px',
          width: '90%',
          background: '#12131a',
          border: '1px solid rgba(229, 192, 123, 0.3)',
          borderRadius: '16px',
          padding: '36px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(229, 192, 123, 0.12)',
            color: '#e5c07b',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '20px',
          }}>
            ✦
          </div>

          <h2 style={{
            fontSize: '1.4rem',
            margin: '0 0 10px 0',
            color: '#f8fafc',
            fontWeight: 700,
          }}>
            System Resilience Safeguard Active
          </h2>

          <p style={{
            fontSize: '0.9rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            margin: '0 0 20px 0',
          }}>
            An unexpected client interruption was safely intercepted by the BAVI enterprise safeguard. Your session data remains preserved.
          </p>

          {error?.message && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.8rem',
              color: '#ef4444',
              fontFamily: 'monospace',
              marginBottom: '24px',
              textAlign: 'left',
              wordBreak: 'break-word',
              maxHeight: '100px',
              overflowY: 'auto',
            }}>
              {error.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => reset()}
              style={{
                background: 'linear-gradient(135deg, #f7e6be, #e5c07b, #af8938)',
                color: '#070709',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'opacity 150ms ease',
              }}
            >
              Reload & Recover
            </button>

            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                background: '#1a1c26',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Return to Command Center
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
