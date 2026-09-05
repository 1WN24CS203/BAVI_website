'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

export default function UserDashboardError({ error, reset }) {
  useEffect(() => {
    console.error('Customer dashboard error caught:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: '#141414',
        border: '1px solid rgba(201, 168, 76, 0.3)',
        borderRadius: '16px',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
      }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 8px 0', fontWeight: 700 }}>
          Dashboard Section Interrupted
        </h2>

        <p style={{ fontSize: '0.88rem', color: '#a0a0a0', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          An issue occurred while loading this section of your project portal. Your account and milestones are safe.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #c9a84c, #a8893d)',
              color: '#080808',
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
              background: '#1c1c1c',
              color: '#f8f8f8',
              border: '1px solid #333',
              padding: '10px 22px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            <LayoutDashboard size={15} />
            <span>Client Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
