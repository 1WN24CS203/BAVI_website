'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('Dashboard section error caught:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '65vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: 'rgba(26, 28, 38, 0.75)',
        border: '1px solid rgba(229, 192, 123, 0.3)',
        borderRadius: '16px',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          color: '#ef4444',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <ShieldAlert size={30} />
        </div>

        <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 8px 0', fontWeight: 700 }}>
          Dashboard Module Safeguard Triggered
        </h2>

        <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 20px 0' }}>
          This module encountered an issue while rendering. The Astryx enterprise isolation boundary has protected the remainder of your workspace.
        </p>

        {error?.message && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '0.78rem',
            color: '#f87171',
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #f7e6be, #e5c07b, #af8938)',
              color: '#070709',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} />
            <span>Reload Module</span>
          </button>

          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={15} />
            <span>Command Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
