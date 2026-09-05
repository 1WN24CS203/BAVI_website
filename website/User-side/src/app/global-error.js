'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Customer Portal global error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>BAVI — Recovery</title>
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
          maxWidth: '540px',
          width: '90%',
          background: '#12131a',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          borderRadius: '16px',
          padding: '36px 30px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(201, 168, 76, 0.12)',
            color: '#c9a84c',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            marginBottom: '18px',
          }}>
            ✦
          </div>

          <h2 style={{ fontSize: '1.35rem', margin: '0 0 10px 0', color: '#fff', fontWeight: 700 }}>
            Session Recovered
          </h2>

          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            A temporary client exception was safely handled. Please reload to restore full functionality.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => reset()}
              style={{
                background: 'linear-gradient(135deg, #c9a84c, #a8893d)',
                color: '#080808',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>

            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: '#181818',
                color: '#f8fafc',
                border: '1px solid #333',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
