'use client';

import { useState } from 'react';
import { 
  UserCheck, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Award, 
  KeyRound, 
  Save, 
  CheckCircle2,
  Building
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import DesignerHeader from '@/components/Header';
import styles from './profile.module.css';

export default function DesignerProfilePage() {
  const { designer } = useDesignerAuth();

  const [formData, setFormData] = useState({
    full_name: designer?.full_name || 'Arun Bahubali',
    email: designer?.email || 'arun.designer@bavi.in',
    phone: designer?.phone || '+91 98450 12345',
    specialization: designer?.specialization || 'Principal Architect & Luxury Villa Specialist',
    bio: designer?.bio || 'Over 14 years shaping iconic luxury residential structures and villas in Karnataka.',
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <DesignerHeader 
        title="Architect Credentials & Security" 
        subtitle="Manage professional credentials, contact routes, and verified company security codes" 
      />

      <div className={styles.container}>
        <div className={styles.headerCard}>
          <div className={styles.avatar}>
            {formData.full_name.charAt(0)}
          </div>
          <div>
            <div className={styles.codePill}>
              <KeyRound size={13} />
              <span>Token: {designer?.company_code}</span>
            </div>
            <h2 className={styles.title}>{formData.full_name}</h2>
            <p className={styles.subtitle}>{formData.specialization}</p>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Profile Form */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Professional Credentials</h3>
            <p className={styles.cardSub}>Information displayed on client project cards and verified blueprints</p>

            {saved && (
              <div className={styles.toast}>
                <CheckCircle2 size={18} color="var(--color-success)" />
                <span>Designer credentials updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Professional Name</label>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className={styles.formInput} 
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Corporate Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className={`${styles.formInput} ${styles.inputDisabled}`} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Direct Mobile / WhatsApp</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={styles.formInput} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Design Specialization</label>
                <input 
                  type="text" 
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className={styles.formInput} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Professional Biography</label>
                <textarea 
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className={`${styles.formInput} ${styles.textarea}`} 
                />
              </div>

              <button type="submit" className={styles.saveBtn}>
                <Save size={16} />
                <span>Save Architect Profile</span>
              </button>
            </form>
          </div>

          {/* Security & Authorization Details */}
          <div className={styles.sideCol}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <ShieldCheck size={20} color="var(--color-gold)" />
                <h3 className={styles.cardTitle}>Authorization Token</h3>
              </div>
              <p className={styles.securityText}>
                Your company code is your exclusive authorization key for validating architectural blueprints and releasing escrow funds.
              </p>
              <div className={styles.tokenBox}>
                <span className={styles.tokenLabel}>Verified Security Code:</span>
                <code className={styles.tokenValue}>{designer?.company_code}</code>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Building size={20} color="var(--color-gold)" />
                <h3 className={styles.cardTitle}>BAVI Company Office</h3>
              </div>
              <p className={styles.securityText}>
                Bahubali Builders & Visionary Interiors HQ<br />
                HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
