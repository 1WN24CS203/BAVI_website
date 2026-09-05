'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, CheckCircle2, Shield, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.headerAvatar}>
          {formData.full_name?.charAt(0) || 'U'}
        </div>
        <div>
          <span className={styles.badgeGold}>Client Account</span>
          <h2 className={styles.title}>{formData.full_name}</h2>
          <p className={styles.subtitle}>{formData.email} • Verified Client Profile</p>
        </div>
      </div>

      <div className={styles.formGrid}>
        {/* Personal Details Form */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Personal Information</h3>
          <p className={styles.cardSub}>Update your contact and billing details for project communication</p>

          {saved && (
            <div className={styles.successToast}>
              <CheckCircle2 size={18} color="var(--color-success)" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Legal Name</label>
              <div className={styles.inputWrap}>
                <User size={16} className={styles.inputIcon} />
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className={styles.formInput} 
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className={`${styles.formInput} ${styles.inputDisabled}`} 
                />
              </div>
              <span className={styles.helperText}>Email is linked to your primary login account.</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number</label>
              <div className={styles.inputWrap}>
                <Phone size={16} className={styles.inputIcon} />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={styles.formInput} 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Permanent / Billing Address</label>
              <div className={styles.inputWrap}>
                <MapPin size={16} className={styles.inputIcon} />
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={styles.formInput} 
                />
              </div>
            </div>

            <button type="submit" className={styles.saveBtn}>
              <Save size={16} />
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Security & Support Details */}
        <div className={styles.sideCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Shield size={20} className={styles.goldIcon} />
              <h3 className={styles.cardTitle}>Assigned Architect</h3>
            </div>
            <p className={styles.designerDesc}>
              Your assigned designer is directly responsible for your architectural blueprints, site inspections, and contractor milestone handoffs.
            </p>
            <div className={styles.designerBox}>
              <strong>{profile?.designer?.name || 'BAVI Architectural Studio'}</strong>
              <span>{profile?.designer?.title || 'Principal Architect & Studio Concierge'}</span>
              <span className={styles.designerCode}>Code: {profile?.designer?.code || 'BAVI-STUDIO'}</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Lock size={20} className={styles.goldIcon} />
              <h3 className={styles.cardTitle}>Account Security</h3>
            </div>
            <p className={styles.securityText}>
              Your customer account is protected with encrypted Supabase Auth sessions and SSL-encrypted Stripe communication.
            </p>
            <button className={styles.changePassBtn} onClick={() => alert('Password reset link sent to registered email.')}>
              Request Password Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
