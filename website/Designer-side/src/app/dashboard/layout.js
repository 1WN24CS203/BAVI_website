'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDesignerAuth } from '@/context/AuthContext';
import DesignerSidebar from '@/components/Sidebar';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/astryx';
import styles from './DashboardLayout.module.css';

// Route permissions mapping
const DEPARTMENT_ALLOWED_PREFIXES = {
  architecture: [
    '/dashboard',
    '/dashboard/projects',
    '/dashboard/requirements',
    '/dashboard/documents',
    '/dashboard/customers',
    '/dashboard/consultations',
    '/dashboard/payments',
    '/dashboard/designs',
    '/dashboard/profile',
  ],
  construction: [
    '/dashboard',
    '/dashboard/projects',
    '/dashboard/materials',
    '/dashboard/inspections',
    '/dashboard/contractors',
    '/dashboard/safety',
    '/dashboard/equipment',
    '/dashboard/profile',
  ],
  marketing: [
    '/dashboard',
    '/dashboard/callbacks',
    '/dashboard/leads',
    '/dashboard/consultations',
    '/dashboard/customers',
    '/dashboard/designs',
    '/dashboard/profile',
  ],
};

export default function DesignerDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
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

  // Cross-Access Check: Owners have unrestricted access.
  const isOwner = !!designer.isOwner || designer.department === 'admin' || designer.role === 'owner';
  const dept = designer.department || 'architecture';
  const allowedList = DEPARTMENT_ALLOWED_PREFIXES[dept] || DEPARTMENT_ALLOWED_PREFIXES.architecture;

  // Check if current route is allowed
  const isRouteAllowed = isOwner || allowedList.some(r => pathname === r || pathname.startsWith(r + '/'));

  return (
    <div className={styles.layout}>
      <DesignerSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={styles.contentArea}>
        <div className={styles.innerContent}>
          {isRouteAllowed ? (
            children
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70vh',
              textAlign: 'center',
              padding: '40px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                marginBottom: '20px'
              }}>
                <ShieldAlert size={32} />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
                Department Isolation Boundary Enforced
              </h2>
              <p style={{ maxWidth: '480px', color: '#888', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
                You are currently logged into the <strong style={{ color: 'var(--astryx-gold-light)' }}>{dept.toUpperCase()}</strong> department.
                To protect confidentiality and operational integrity, cross-department access to this module is strictly restricted. Only Site Owners can monitor across all departments.
              </p>
              <Button
                variant="primary"
                icon={<ArrowLeft size={16} />}
                onClick={() => router.push('/dashboard')}
              >
                Return to My Department Command Center
              </Button>
            </div>
          )}
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
