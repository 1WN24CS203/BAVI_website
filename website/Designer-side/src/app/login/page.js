'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import styles from './login.module.css';

export default function DesignerLoginPage() {
  const router = useRouter();
  const { login } = useDesignerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const customerPortalUrl = process.env.NEXT_PUBLIC_SITE_URL || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password, companyCode);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your email, password, and security code.');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className={styles.brandTitle}>BAVI INTERIORS</h1>
            <span className={styles.brandTag}>Architect & Designer Command Portal</span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Notice Box */}
        <div className={styles.noticeBox}>
          <ShieldCheck size={18} className={styles.shieldIcon} />
          <div className={styles.noticeText}>
            <strong>Authorized Access Only:</strong> Valid security code and credentials required. Contact BAVI administration for portal access.
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Corporate Email</label>
            <div className={styles.inputWrapper}>
              <Mail size={17} className={styles.inputIcon} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@company.com"
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Portal Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={17} className={styles.inputIcon} />
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Security Code</span>
              <span className={styles.goldLabel}>(Assigned Token)</span>
            </label>
            <div className={styles.inputWrapper}>
              <KeyRound size={17} className={styles.inputIconGold} />
              <input 
                type="text" 
                required
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                placeholder="e.g. BAVI-DES-XXXX"
                className={`${styles.formInput} ${styles.inputGold}`}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <span>Validating Credentials...</span>
            ) : (
              <>
                <span>Access Command Dashboard</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#888' }}>
          Need architect portal access?{' '}
          <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
            Contact BAVI administration
          </span>
        </div>

        {/* Bottom Link */}
        <div className={styles.footerLink}>
          <a href={customerPortalUrl} target="_blank" rel="noopener noreferrer" className={styles.publicLink}>
            <span>Go to Customer Portal</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
