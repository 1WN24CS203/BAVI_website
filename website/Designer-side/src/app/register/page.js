'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  KeyRound,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import styles from './register.module.css';

export default function DesignerRegisterPage() {
  const router = useRouter();
  const { register } = useDesignerAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Principal Luxury Villa Architect',
    councilRegNo: '',
    bio: '',
  });

  const [autoCode] = useState(`BAVI-DES-${Math.floor(1000 + Math.random() * 9000)}`);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        ...formData,
        companyCode: autoCode
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check form parameters.');
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
            <h1 className={styles.brandTitle}>BAVI</h1>
            <span className={styles.brandTag}>Architect & Designer Onboarding</span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Security Token Banner */}
        <div className={styles.tokenNotice}>
          <div className={styles.tokenTop}>
            <ShieldCheck size={16} className={styles.shieldIcon} />
            <span>Assigned Security Token</span>
          </div>
          <div className={styles.tokenDisplay}>
            <code>{autoCode}</code>
            <span className={styles.tokenLabel}>Auto-Generated Verified Key</span>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Legal Name *</label>
              <div className={styles.inputWrapper}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Rao"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Corporate Email *</label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  required
                  placeholder="architect@bavi.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Portal Password *</label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number *</label>
              <div className={styles.inputWrapper}>
                <Phone size={16} className={styles.inputIcon} />
                <input
                  type="tel"
                  required
                  placeholder="+91 98450 XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Architectural Discipline *</label>
              <div className={styles.inputWrapper}>
                <Compass size={16} className={styles.inputIconGold} />
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className={`${styles.formInput} ${styles.selectInput}`}
                >
                  <option value="Principal Luxury Villa Architect">Principal Luxury Villa Architect</option>
                  <option value="Head of Interior Architecture">Head of Interior Architecture</option>
                  <option value="Commercial & Institutional Lead">Commercial & Institutional Lead</option>
                  <option value="Heritage Restoration Specialist">Heritage Restoration Specialist</option>
                  <option value="BIM & 3D Visualization Engineer">BIM & 3D Visualization Engineer</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Council Reg. No. (COA)</label>
              <div className={styles.inputWrapper}>
                <Award size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="CA/2024/XXXXX"
                  value={formData.councilRegNo}
                  onChange={(e) => setFormData({ ...formData, councilRegNo: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Professional Bio & Credentials</label>
            <textarea
              rows={3}
              placeholder="Brief summary of architectural experience, major landmark commissions, and institutional credentials..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className={styles.textarea}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <span>Validating & Onboarding Architect...</span>
            ) : (
              <>
                <Sparkles size={17} />
                <span>Complete Architect Onboarding</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className={styles.loginRedirect}>
          <span>Already authorized?</span>
          <Link href="/login" className={styles.loginLink}>Sign in with Security Token</Link>
        </div>

        {/* Bottom Link */}
        <div className={styles.footerLink}>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className={styles.publicLink}>
            <span>Switch to Customer Portal (Port 3000)</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
