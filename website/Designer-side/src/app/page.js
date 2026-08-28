'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDesignerAuth } from '@/context/AuthContext';

export default function DesignerRootPage() {
  const router = useRouter();
  const { designer, loading } = useDesignerAuth();

  useEffect(() => {
    if (!loading) {
      if (designer) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [designer, loading, router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--color-black)',
      color: 'var(--color-gold)'
    }}>
      Loading Designer Portal...
    </div>
  );
}
