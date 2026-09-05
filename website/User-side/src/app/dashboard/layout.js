'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  MapPin, 
  CalendarDays, 
  CreditCard, 
  Star, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Phone, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Bell,
  FileText,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './DashboardLayout.module.css';

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/dashboard/project', label: 'My Project & Blueprints', icon: FolderKanban },
  { href: '/dashboard/requirements', label: 'My Requirements & SRS', icon: FileText },
  { href: '/dashboard/site', label: 'Live Site Tracking', icon: MapPin },
  { href: '/dashboard/consultations', label: 'Consultations', icon: CalendarDays },
  { href: '/dashboard/payments', label: 'Escrow & Billing', icon: CreditCard },
  { href: '/dashboard/reviews', label: 'Reviews & Feedback', icon: Star },
  { href: '/dashboard/profile', label: 'Client Profile', icon: User },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [callbackLoading, setCallbackLoading] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    if (!loading && !profile) {
      router.push('/login');
    }
  }, [pathname, profile, loading, router]);

  const handleRequestCallback = () => {
    setCallbackLoading(true);
    const newCallback = {
      id: 'cb-' + Date.now(),
      name: profile?.full_name || 'Valued Client',
      clientName: profile?.full_name || 'Valued Client',
      phone: profile?.phone || '+91 99800 11223',
      email: profile?.email || 'client@bavi.in',
      is_client: true,
      isClient: true,
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      created_at: new Date().toISOString(),
      status: 'pending',
      priority: 'urgent',
      subject: 'Priority Client Assistance',
      message: `Direct callback requested from Client Dashboard by ${profile?.full_name || 'Client'}.`,
    };

    try {
      const stored = localStorage.getItem('bavi_callback_requests');
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem('bavi_callback_requests', JSON.stringify([newCallback, ...existing]));
    } catch (err) {
      console.warn(err);
    }

    setTimeout(() => {
      setCallbackLoading(false);
      setCallbackRequested(true);
      setTimeout(() => setCallbackRequested(false), 5000);
    }, 400);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return null;
  }

  // Assigned lead architect info — displayed in client sidebar
  const designer = profile?.designer || {
    name: 'BAVI Architectural Studio',
    title: 'Client Concierge & Advisory',
    phone: '8277762487',
    code: 'BAVI-STUDIO'
  };

  const currentPage = navItems.find(item => item.href === pathname)?.label || 'Command Center';

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Top Header */}
      <div className={styles.mobileTopBar}>
        <Link href="/" className={styles.mobileLogo}>
          <img src="/logo.png" alt="BAVI" className={styles.mobileLogoImg} />
          <div>
            <span className={styles.mobileBrandName}>BAVI INTERIORS</span>
            <span className={styles.mobileBrandTag}>Client Portal</span>
          </div>
        </Link>
        <button 
          className={styles.mobileToggleBtn}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          id="dashboard-mobile-toggle"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand Area */}
        <div className={styles.brandArea}>
          <Link href="/" className={styles.logoLink}>
            <img src="/logo.png" alt="BAVI" className={styles.brandLogo} />
            <div>
              <div className={styles.brandName}>BAVI INTERIORS</div>
              <div className={styles.brandTag}>Client Portal</div>
            </div>
          </Link>
          <button 
            className={styles.sidebarCloseBtn}
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
                {isActive && <div className={styles.activePill} />}
              </Link>
            );
          })}
        </nav>

        {/* Assigned Architect Card */}
        <div className={styles.designerCard}>
          <div className={styles.designerHeader}>
            <ShieldCheck size={14} className={styles.designerBadgeIcon} />
            <span>Assigned Lead Architect</span>
          </div>
          <div className={styles.designerName}>{designer.name}</div>
          <div className={styles.designerTitle}>{designer.title}</div>
          <div className={styles.designerCode}>Token: {designer.code}</div>
          <a href={`tel:${designer.phone}`} className={styles.designerContactBtn}>
            <Phone size={13} />
            <span>Direct Concierge Call</span>
          </a>
        </div>

        {/* User Info & Logout Footer */}
        <div className={styles.userFooter}>
          <div className={styles.userAvatar}>
            {profile?.full_name?.charAt(0) || 'C'}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{profile?.full_name || 'Client'}</div>
            <div className={styles.userEmail}>{profile?.email || 'client@bavi.in'}</div>
          </div>
          <button 
            onClick={handleLogout} 
            className={styles.logoutBtn}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageHeading}>{currentPage}</h1>
            <p className={styles.pageSubheading}>
              BAVI Interiors client management portal
            </p>
          </div>
          <div className={styles.headerRight} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleRequestCallback}
              disabled={callbackLoading || callbackRequested}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--astryx-gold, #c9a84c)',
                background: callbackRequested ? 'rgba(74, 222, 128, 0.2)' : 'rgba(201, 168, 76, 0.15)',
                color: callbackRequested ? '#4ade80' : 'var(--astryx-gold-light, #e0c57b)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: callbackLoading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <PhoneCall size={14} />
              <span>{callbackRequested ? 'Callback Requested!' : 'Request Call Back'}</span>
            </button>

            <Link href="/" className={styles.publicSiteLink} target="_blank">
              <span>View Public Studio</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        {callbackRequested && (
          <div style={{
            background: 'rgba(74, 222, 128, 0.12)',
            border: '1px solid #4ade80',
            color: '#4ade80',
            padding: '10px 18px',
            borderRadius: '8px',
            margin: '0 32px 16px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Callback request registered! Our marketing & concierge team has been alerted with top priority.</span>
            <button onClick={() => setCallbackRequested(false)} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Page View Container */}
        <div className={styles.pageContainer}>
          {children}
        </div>
      </main>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className={styles.mobileBackdrop} 
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
