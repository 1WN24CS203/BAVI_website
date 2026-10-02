'use client';

import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Lock, CheckCircle2, Shield, Save, 
  KeyRound, Send, AlertCircle, Clock, Sparkles, Check, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { profile, updateProfile, updatePassword, requestPasswordChange, getClientPasswordRequests } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const [saved, setSaved] = useState(false);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    reason: 'Updating to my private confidential password',
  });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
      loadRequests();
    }
  }, [profile]);

  const loadRequests = () => {
    const list = getClientPasswordRequests();
    if (profile?.email) {
      setMyRequests(list.filter(r => r.client_email?.toLowerCase() === profile.email.toLowerCase()));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordRequestSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await (updatePassword || requestPasswordChange)({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
        reason: passData.reason,
      });
      setPassSuccess(res.message);
      setPassData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        reason: 'Updating to my private confidential password',
      });
      loadRequests();
      setTimeout(() => {
        setShowPasswordModal(false);
        setPassSuccess('');
      }, 4000);
    } catch (err) {
      setPassError(err.message || 'Failed to submit password change request.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.headerAvatar}>
          {formData.full_name?.charAt(0) || 'U'}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className={styles.badgeGold}>Verified Client Account</span>
            <span style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '0.72rem',
              fontWeight: 600
            }}>
              Designer Approved
            </span>
          </div>
          <h2 className={styles.title}>{formData.full_name}</h2>
          <p className={styles.subtitle}>
            {formData.email} • Client ID: <strong>{profile?.client_code || profile?.id || 'BAVI-CLIENT'}</strong>
          </p>
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
              <label className={styles.formLabel}>Email Address (Account ID)</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className={`${styles.formInput} ${styles.inputDisabled}`} 
                />
              </div>
              <span className={styles.helperText}>Email is linked to your primary project commission.</span>
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
          {/* Assigned Architect */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Shield size={20} className={styles.goldIcon} />
              <h3 className={styles.cardTitle}>Assigned Architect</h3>
            </div>
            <p className={styles.designerDesc}>
              Your assigned designer is directly responsible for your blueprints, site inspections, and contractor milestone signoffs.
            </p>
            <div className={styles.designerBox}>
              <strong>{profile?.designer?.name || 'Ar. Rajesh Bahubali'}</strong>
              <span>{profile?.designer?.title || 'Principal Architect & Studio Director'}</span>
              <span className={styles.designerCode}>Code: {profile?.designer?.code || 'BAVI-ARCH-001'}</span>
            </div>
          </div>

          {/* Account Security & Password Notification */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Lock size={20} className={styles.goldIcon} />
              <h3 className={styles.cardTitle}>Credentials &amp; Security</h3>
            </div>
            <p className={styles.securityText}>
              Your initial password was issued by your designer upon project approval. You may change your password at any time — it takes effect immediately. Your designer is automatically notified for security transparency.
            </p>

            {myRequests.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#c9a84c', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Recent Credential Change Requests:
                </div>
                {myRequests.slice(0, 3).map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#ccc' }}>Password Changed</span>
                    <span style={{
                      color: (r.status === 'APPLIED' || r.status === 'APPROVED') ? '#22c55e' : (r.status === 'REJECTED' ? '#ef4444' : '#eab308'),
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {(r.status === 'APPLIED' || r.status === 'APPROVED') && <Check size={12} />}
                      {r.status === 'PENDING' && <Clock size={12} />}
                      {r.status === 'APPLIED' ? 'Applied ✓' : r.status === 'PENDING' ? 'Pending' : r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button 
              className={styles.changePassBtn} 
              onClick={() => { setShowPasswordModal(true); setPassError(''); setPassSuccess(''); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <KeyRound size={16} />
              <span>Change My Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#12131a',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <KeyRound size={22} color="#c9a84c" />
                <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>Change Password</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#aaa', lineHeight: '1.5', marginBottom: '20px' }}>
              Enter your current password and choose a new one. Your password updates <strong style={{ color: '#c9a84c' }}>immediately</strong> — no approval needed. Your designer is automatically notified for security transparency.
            </p>

            {passSuccess && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                color: '#22c55e',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                color: '#ef4444',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#bbb', marginBottom: '6px' }}>
                  Current / Temporary Password
                </label>
                <input
                  type="password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#1a1b24',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#bbb', marginBottom: '6px' }}>
                  Desired New Password (min. 6 characters)
                </label>
                <input
                  type="password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#1a1b24',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#bbb', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#1a1b24',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#bbb', marginBottom: '6px' }}>
                  Note to Designer / Reason for Update
                </label>
                <input
                  type="text"
                  value={passData.reason}
                  onChange={(e) => setPassData({...passData, reason: e.target.value})}
                  placeholder="e.g. Updating to personal confidential password"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#1a1b24',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={passLoading}
                  style={{
                    flex: 1,
                    background: '#c9a84c',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={16} />
                  {passLoading ? 'Updating...' : 'Update My Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    background: 'transparent',
                    color: '#aaa',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    padding: '12px 18px',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
