'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  AlertTriangle,
  ExternalLink,
  Info
} from 'lucide-react';
import styles from './register.module.css';

export default function DesignerRegisterPage() {
  const customerPortalUrl = process.env.NEXT_PUBLIC_SITE_URL || '/';

  return (
    <div className={styles.container}>
      {/* Background Decor */}
      <div className={styles.bgGlow} />
      <div className={styles.gridOverlay} />

      <div className={styles.card}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <img src="/logo.png" alt="BAVI" className={styles.logo} />
          <div>
            <h1 className={styles.brandTitle}>BAVI</h1>
            <span className={styles.brandTag}>Architect & Designer Portal</span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Registration Closed Notice */}
        <div className={styles.tokenNotice}>
          <div className={styles.tokenTop}>
            <Lock size={16} className={styles.shieldIcon} />
            <span>Registration Status</span>
          </div>
          <div style={{ 
            padding: '16px', 
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            <AlertTriangle size={36} color="var(--color-gold)" style={{ marginBottom: '12px' }} />
            <h3 style={{ 
              color: '#f8f8f8', 
              fontFamily: 'var(--font-heading)', 
              fontSize: '1.15rem',
              marginBottom: '8px'
            }}>
              Architect Registration is Closed
            </h3>
            <p style={{ maxWidth: '380px', margin: '0 auto 12px' }}>
              New designer and architect accounts are provisioned by BAVI administration only. 
              If you need portal access, please contact the BAVI team directly.
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--color-gold)',
              opacity: 0.8
            }}>
              <Info size={14} />
              <span>Existing architects can sign in below</span>
            </div>
          </div>
        </div>

        {/* Direct to Login */}
        <Link 
          href="/login" 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark, #b8960a))',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: '8px',
            textDecoration: 'none',
            marginTop: '8px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <ShieldCheck size={17} />
          <span>Sign In with Existing Credentials</span>
          <ArrowRight size={17} />
        </Link>

        <div className={styles.loginRedirect} style={{ marginTop: '16px' }}>
          <span>Already have a security token?</span>
          <Link href="/login" className={styles.loginLink}>Access Architect Portal</Link>
        </div>

        {/* Bottom Link */}
        <div className={styles.footerLink}>
          <a href={customerPortalUrl} target="_blank" rel="noopener noreferrer" className={styles.publicLink}>
            <span>Visit Customer Portal</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
