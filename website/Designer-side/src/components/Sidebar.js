'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CalendarDays, 
  CreditCard, 
  Sparkles, 
  UserCheck, 
  LogOut,
  ShieldCheck,
  KeyRound,
  X
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/dashboard/approvals', label: 'Key & Access Approvals', icon: KeyRound },
  { href: '/dashboard/customers', label: 'My Client Directory', icon: Users },
  { href: '/dashboard/projects', label: 'Project Milestones', icon: FolderKanban },
  { href: '/dashboard/consultations', label: 'Consultation Calendar', icon: CalendarDays },
  { href: '/dashboard/payments', label: 'Escrow & Billing', icon: CreditCard },
  { href: '/dashboard/designs', label: 'Signature Portfolio', icon: Sparkles },
  { href: '/dashboard/profile', label: 'Architect Profile', icon: UserCheck },
];

export default function DesignerSidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { designer, logout } = useDesignerAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
      {/* Brand Header */}
      <div className={styles.brand}>
        <div className={styles.brandLogoWrap}>
          <img src="/logo.png" alt="BAVI" className={styles.brandLogo} />
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandName}>BAVI INTERIORS</div>
          <div className={styles.brandSub}>Architect Command Center</div>
        </div>
        {onClose && (
          <button 
            className={styles.mobileCloseBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Designer Active Verification Badge */}
      <div className={styles.designerBadge}>
        <div className={styles.badgeHeader}>
          <ShieldCheck size={14} className={styles.shieldIcon} />
          <span>Architect Portal Token</span>
        </div>
        <div className={styles.designerName}>{designer?.full_name || 'Architect'}</div>
        <div className={styles.companyCode}>Security Token: {designer?.company_code || '••••••••'}</div>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navMenu}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={onClose}
            >
              <Icon size={18} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
              {isActive && <div className={styles.activePill} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <div className={styles.avatar}>
            {designer?.full_name?.charAt(0) || 'A'}
          </div>
          <div className={styles.textWrap}>
            <span className={styles.footerName}>{designer?.full_name || 'Architect'}</span>
            <span className={styles.footerEmail}>{designer?.email || 'Interiorsbavi@gmail.com'}</span>
          </div>
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
  );
}
