'use client';

import { Bell, ExternalLink, ShieldCheck, Menu } from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import styles from './Header.module.css';

export default function DesignerHeader({ title, subtitle, onToggleMobile }) {
  const { designer } = useDesignerAuth();
  const customerPortalUrl = process.env.NEXT_PUBLIC_SITE_URL || '/';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {onToggleMobile && (
          <button 
            className={styles.mobileMenuBtn}
            onClick={onToggleMobile}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
        )}
        <div>
          <h1 className={styles.title}>{title || 'Command Center'}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.right}>
        {/* Company Security Tag */}
        <div className={styles.securityTag}>
          <ShieldCheck size={14} className={styles.shieldIcon} />
          <span>Security Token: <strong>{designer?.company_code}</strong></span>
        </div>

        {/* Customer Site Link */}
        <a 
          href={customerPortalUrl}
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.clientSiteBtn}
        >
          <span>Open Client Portal</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </header>
  );
}
