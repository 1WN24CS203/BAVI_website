'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDesignerAuth } from '@/context/AuthContext';
import DesignerSidebar from '@/components/Sidebar';
import styles from './DashboardLayout.module.css';

export default function DesignerDashboardLayout({ children }) {
  const router = useRouter();
  const { designer, loading } = useDesignerAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !designer) {
      router.push('/login');
    }
  }, [designer, loading, router]);

  if (loading || !designer) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <DesignerSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={styles.contentArea}>
        {/* Pass down mobile toggle capability */}
        <div className={styles.innerContent}>
          {children}
        </div>
      </div>

      {mobileOpen && (
        <div 
          className={styles.mobileBackdrop} 
          onClick={() => setMobileOpen(false)} 
        />
      )}
    </div>
  );
}
