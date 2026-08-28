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
  ExternalLink,
  UserPlus
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password, companyCode);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify email, password, and security company code.');
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
            <strong>Architect Access:</strong> Validated security company code required for project milestone approvals and bill management.
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
                placeholder="Interiorsbavi@gmail.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter portal password"
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <span>Unique Company Code</span>
              <span className={styles.goldLabel}>(Security Token)</span>
            </label>
            <div className={styles.inputWrapper}>
              <KeyRound size={17} className={styles.inputIconGold} />
              <input 
                type="text" 
                required
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                placeholder="e.g. BAVI-DES-7890"
                className={`${styles.formInput} ${styles.inputGold}`}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <span>Validating Security Token...</span>
            ) : (
              <>
                <span>Access Command Dashboard</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#888' }}>
          Need designer authorization? <Link href="/register" style={{ color: 'var(--color-gold)', fontWeight: 600, textDecoration: 'underline' }}>Register New Architect Account</Link>
        </div>

        {/* Bottom Link */}
        <div className={styles.footerLink}>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className={styles.publicLink}>
            <span>Go to Customer Portal (Port 3000)</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
