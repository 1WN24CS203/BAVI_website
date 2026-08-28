'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight, 
  PhoneCall, 
  ShieldCheck,
  LayoutDashboard,
  CalendarCheck
} from 'lucide-react';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Portfolio' },
  { href: '/about', label: 'Our Legacy' },
  { href: '/contact', label: 'Consultation' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is active
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <header className={`${styles.headerWrapper} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navbarContainer}>
        {/* Brand Logo */}
        <Link href="/" className={styles.brandLogo} id="nav-brand-logo">
          <div className={styles.logoImageWrap}>
            <img 
              src="/logo.png" 
              alt="BAVI Luxury Interiors" 
              className={styles.logoImage}
            />
            <span className={styles.logoBadgePing} />
          </div>
          <div className={styles.brandInfo}>
            <span className={styles.brandTitle}>BAVI</span>
            <span className={styles.brandSubtitle}>Builders & Visionary Interiors</span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className={styles.desktopNav} aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span>{link.label}</span>
                {isActive && <span className={styles.activeGlowDot} />}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Pills */}
        <div className={styles.actionGroup}>
          <Link href="/contact" className={styles.consultationBtn} id="nav-consultation-btn">
            <CalendarCheck size={16} />
            <span>Book Consultation</span>
          </Link>

          <Link href="/login" className={styles.clientPortalBtn} id="nav-login-btn">
            <LayoutDashboard size={15} />
            <span>Client Portal</span>
            <ChevronRight size={13} className={styles.arrowIcon} />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className={`${styles.mobileToggle} ${isMobileOpen ? styles.toggleOpen : ''}`}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          id="mobile-nav-toggle"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Astryx Full-Screen Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${isMobileOpen ? styles.mobileDrawerOpen : ''}`}>
        <div className={styles.drawerBackdrop} onClick={() => setIsMobileOpen(false)} />
        <div className={styles.drawerCard}>
          <div className={styles.drawerHeader}>
            <div className={styles.drawerBrand}>
              <img src="/logo.png" alt="BAVI" className={styles.drawerLogo} />
              <div>
                <div className={styles.drawerBrandName}>BAVI</div>
                <div className={styles.drawerBrandTag}>Luxury Architectural Studio</div>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileOpen(false)} 
              className={styles.drawerCloseBtn}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.drawerBadge}>
            <ShieldCheck size={14} className={styles.drawerShield} />
            <span>Verified Luxury Architectural Practice</span>
          </div>

          <nav className={styles.drawerNav}>
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.drawerLink} ${isActive ? styles.drawerLinkActive : ''}`}
                  style={{ animationDelay: `${0.06 * (idx + 1)}s` }}
                >
                  <div className={styles.drawerLinkText}>
                    <span className={styles.drawerLinkNum}>0{idx + 1}</span>
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight size={18} className={styles.drawerChevron} />
                </Link>
              );
            })}
          </nav>

          <div className={styles.drawerActions}>
            <Link href="/contact" className={styles.drawerCtaPrimary}>
              <CalendarCheck size={18} />
              <span>Book Priority Consultation</span>
            </Link>

            <Link href="/login" className={styles.drawerCtaSecondary}>
              <LayoutDashboard size={18} />
              <span>Sign In to Client Portal</span>
            </Link>

            <div className={styles.drawerHotline}>
              <PhoneCall size={14} />
              <span>Direct Concierge: +91 98450 12345</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
