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
  X,
  FileText,
  Upload,
  PhoneCall,
  Target,
  PackageCheck,
  ClipboardCheck,
  HardHat,
  Shield,
  Wrench,
  Eye,
  UserCog,
  Lock,
  Crown,
  Activity,
  Building,
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import { Avatar, Badge, Divider, StatusDot, ScrollArea } from '@/components/astryx';
import styles from './Sidebar.module.css';

// Department-based navigation configuration
const NAV_CONFIG = {
  admin: {
    label: 'Owner / Administration',
    icon: Crown,
    items: [
      { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      { href: '/dashboard/approvals', label: 'Key & Access Approvals', icon: KeyRound },
      { href: '/dashboard/monitor', label: 'Activity Monitor', icon: Activity },
      { href: '/dashboard/employees', label: 'Employee Directory', icon: Users },
      { href: '/dashboard/permissions', label: 'Access Permissions', icon: Lock },
      { href: '/dashboard/projects', label: 'All Projects', icon: FolderKanban },
      { href: '/dashboard/callbacks', label: 'Callback Requests', icon: PhoneCall },
      { href: '/dashboard/consultations', label: 'Consultations', icon: CalendarDays },
      { href: '/dashboard/payments', label: 'Escrow & Billing', icon: CreditCard },
      { href: '/dashboard/designs', label: 'Signature Portfolio', icon: Sparkles },
      { href: '/dashboard/profile', label: 'Profile Settings', icon: UserCheck },
    ],
  },
  architecture: {
    label: 'Architecture & Design',
    icon: Building,
    items: [
      { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      { href: '/dashboard/projects', label: 'My Projects & Milestones', icon: FolderKanban },
      { href: '/dashboard/requirements', label: 'Client Requirements & SRS', icon: FileText },
      { href: '/dashboard/documents', label: 'Document Upload Center', icon: Upload },
      { href: '/dashboard/customers', label: 'My Client Directory', icon: Users },
      { href: '/dashboard/consultations', label: 'Consultation Calendar', icon: CalendarDays },
      { href: '/dashboard/payments', label: 'Escrow & Billing', icon: CreditCard },
      { href: '/dashboard/designs', label: 'Signature Portfolio', icon: Sparkles },
      { href: '/dashboard/profile', label: 'Architect Profile', icon: UserCheck },
    ],
  },
  construction: {
    label: 'Construction & Management',
    icon: HardHat,
    items: [
      { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      { href: '/dashboard/projects', label: 'Active Site Projects', icon: FolderKanban },
      { href: '/dashboard/materials', label: 'Material & Procurement', icon: PackageCheck },
      { href: '/dashboard/inspections', label: 'Quality Inspections', icon: ClipboardCheck },
      { href: '/dashboard/contractors', label: 'Contractor Registry', icon: HardHat },
      { href: '/dashboard/safety', label: 'Safety Compliance', icon: Shield },
      { href: '/dashboard/equipment', label: 'Equipment Tracker', icon: Wrench },
      { href: '/dashboard/profile', label: 'Engineer Profile', icon: UserCheck },
    ],
  },
  marketing: {
    label: 'Marketing & Sales',
    icon: Target,
    items: [
      { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
      { href: '/dashboard/callbacks', label: 'Callback Requests', icon: PhoneCall },
      { href: '/dashboard/leads', label: 'Lead Pipeline', icon: Target },
      { href: '/dashboard/consultations', label: 'Consultation Requests', icon: CalendarDays },
      { href: '/dashboard/customers', label: 'Client Directory', icon: Users },
      { href: '/dashboard/designs', label: 'Design Showcase', icon: Sparkles },
      { href: '/dashboard/profile', label: 'Profile', icon: UserCheck },
    ],
  },
};

export default function DesignerSidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { designer, logout } = useDesignerAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Determine department
  const department = designer?.isOwner ? 'admin' : (designer?.department || 'architecture');
  const config = NAV_CONFIG[department] || NAV_CONFIG.architecture;
  const DeptIcon = config.icon;

  return (
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
      {/* Brand Header */}
      <div className={styles.brand}>
        <div className={styles.brandLogoWrap}>
          <img src="/logo.png" alt="BAVI" className={styles.brandLogo} />
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandName}>BAVI INTERIORS</div>
          <div className={styles.brandSub}>{config.label}</div>
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
          <span>{designer?.isOwner ? 'Site Owner' : 'Portal Token'}</span>
        </div>
        <div className={styles.designerName}>{designer?.full_name || 'Architect'}</div>
        <div className={styles.companyCode}>
          {designer?.isOwner ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Crown size={12} style={{ color: '#c9a84c' }} />
              Owner Administration
            </span>
          ) : (
            <>Security Token: {designer?.company_code || '••••••••'}</>
          )}
        </div>
        <div className={styles.departmentTag}>
          <DeptIcon size={12} />
          <span>{config.label}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navMenu}>
        <ScrollArea maxHeight="calc(100vh - 340px)">
          {config.items.map((item) => {
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
        </ScrollArea>
      </nav>

      {/* Footer / Logout */}
      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <Avatar name={designer?.full_name} size="sm" />
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
