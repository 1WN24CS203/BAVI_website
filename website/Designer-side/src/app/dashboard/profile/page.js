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
  Building,
  MapPin
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import DesignerHeader from '@/components/Header';
import styles from './profile.module.css';

export default function DesignerProfilePage() {
  const { designer } = useDesignerAuth();

  const [formData, setFormData] = useState({
    full_name: designer?.full_name || 'Arun Bahubali',
    email: designer?.email || 'Interiorsbavi@gmail.com',
    phone: designer?.phone || '8277762487',
    specialization: designer?.specialization || 'Principal Architect & Visionary Interiors',
    bio: designer?.bio || '! WE BOND YOUR SPACE WITH BAHUBALI GRACE !',
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
                <label className={styles.formLabel}>Primary Mobile Number</label>
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
                <label className={styles.formLabel}>Studio Motto & Bio</label>
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

          {/* Security & Official Address Details */}
          <div className={styles.sideCol}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <ShieldCheck size={20} color="var(--color-gold)" />
                <h3 className={styles.cardTitle}>Authorization Token</h3>
              </div>
              <p className={styles.securityText}>
                Your company code is your exclusive authorization key for validating architectural blueprints and verifying milestone clearance.
              </p>
              <div className={styles.tokenBox}>
                <span className={styles.tokenLabel}>Verified Security Code:</span>
                <code className={styles.tokenValue}>{designer?.company_code}</code>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Building size={20} color="var(--color-gold)" />
                <h3 className={styles.cardTitle}>Official Studio Office</h3>
              </div>
              <p className={styles.securityText}>
                <strong>BAVI INTERIORS</strong><br />
                Bahubali Builders & Visionary Interiors<br />
                GURU Bhavana Backside, Ambikanagar, BM Road,<br />
                CHANNARAYAPATNA<br /><br />
                📞 Phone: 8277762487, 8660562173<br />
                ✉️ Email: Interiorsbavi@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
