'use client';

import { useState, useEffect } from 'react';
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
  MapPin,
  Clock,
  ArrowRight,
  X,
  AlertCircle,
  RefreshCw,
  Send,
  Lock,
  XCircle
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import DesignerHeader from '@/components/Header';
import styles from './profile.module.css';

export default function DesignerProfilePage() {
  const { 
    designer, 
    submitEmailChangeRequest, 
    getEmailChangeRequests, 
    cancelEmailChangeRequest 
  } = useDesignerAuth();

  const [formData, setFormData] = useState({
    full_name: designer?.full_name || 'Arun Bahubali',
    email: designer?.email || 'Interiorsbavi@gmail.com',
    phone: designer?.phone || '8277762487',
    specialization: designer?.specialization || 'Principal Architect & Visionary Interiors',
    bio: designer?.bio || '! WE BOND YOUR SPACE WITH BAHUBALI GRACE !',
  });

  const [saved, setSaved] = useState(false);

  // Email Change Request States
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: '',
    password: '',
    reason: '',
  });
  const [emailRequests, setEmailRequests] = useState([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  // Load user's email change requests
  const loadEmailRequests = () => {
    if (!designer) return;
    const all = getEmailChangeRequests();
    const userReqs = all.filter(
      r => (r.designerId === designer.id || r.currentEmail?.toLowerCase() === designer.email?.toLowerCase())
    );
    setEmailRequests(userReqs);
  };

  useEffect(() => {
    if (designer) {
      setFormData(prev => ({
        ...prev,
        full_name: designer.full_name || prev.full_name,
        email: designer.email || prev.email,
        phone: designer.phone || prev.phone,
        specialization: designer.specialization || prev.specialization,
        bio: designer.bio || prev.bio,
      }));
      loadEmailRequests();
    }
  }, [designer]);

  const pendingRequest = emailRequests.find(r => r.status === 'PENDING');
  const recentApproved = emailRequests.find(r => r.status === 'APPROVED');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleEmailRequestSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (emailForm.newEmail.trim().toLowerCase() !== emailForm.confirmEmail.trim().toLowerCase()) {
      setEmailError('The new email and confirmation email do not match.');
      return;
    }

    setEmailLoading(true);
    try {
      await submitEmailChangeRequest({
        newEmail: emailForm.newEmail,
        reason: emailForm.reason,
        password: emailForm.password,
      });

      setEmailSuccess('Email change request submitted! It will take effect once reviewed and approved by the Site Owner.');
      setEmailForm({ newEmail: '', confirmEmail: '', password: '', reason: '' });
      setShowEmailForm(false);
      loadEmailRequests();
      setTimeout(() => setEmailSuccess(''), 6000);
    } catch (err) {
      setEmailError(err.message || 'Failed to submit email change request.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this pending email change request?')) return;
    setCancellingId(requestId);
    try {
      await cancelEmailChangeRequest(requestId);
      loadEmailRequests();
      setEmailSuccess('Email change request was cancelled.');
      setTimeout(() => setEmailSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to cancel request.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <DesignerHeader 
        title="Architect Credentials & Security" 
        subtitle="Manage professional credentials, contact routes, verified company security codes, and email identity" 
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

            {emailSuccess && (
              <div className={styles.successBanner}>
                <CheckCircle2 size={16} />
                <span>{emailSuccess}</span>
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

              {/* Corporate Email Group with Request Change Option */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.formLabel}>Corporate Email (Login Username)</label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}>Official Login Identifier</span>
                </div>

                <div className={styles.emailInputRow}>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className={`${styles.formInput} ${styles.inputDisabled}`} 
                  />
                  {!pendingRequest && !showEmailForm && (
                    <button 
                      type="button" 
                      onClick={() => setShowEmailForm(true)}
                      className={styles.changeEmailTriggerBtn}
                      title="Request to update your corporate email address"
                    >
                      <Mail size={14} />
                      <span>Request Change</span>
                    </button>
                  )}
                </div>

                {/* Pending Email Change Alert Banner */}
                {pendingRequest && (
                  <div className={styles.pendingBanner}>
                    <div className={styles.bannerTop}>
                      <div className={styles.bannerTitleWrap}>
                        <Clock size={16} color="var(--color-gold)" />
                        <span className={styles.bannerTitle}>Email Change Request Pending</span>
                      </div>
                      <span className={`${styles.statusPill} ${styles.statusPending}`}>
                        Awaiting Owner Approval
                      </span>
                    </div>

                    <div className={styles.emailFlow}>
                      <span className={styles.oldEmailText}>{pendingRequest.currentEmail}</span>
                      <ArrowRight size={14} color="var(--color-gold)" />
                      <span className={styles.newEmailText}>{pendingRequest.requestedEmail}</span>
                    </div>

                    <div className={styles.bannerDetails}>
                      <div><strong>Reason:</strong> {pendingRequest.reason}</div>
                      <div><strong>Submitted on:</strong> {new Date(pendingRequest.requestedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ marginTop: '4px', color: '#999' }}>
                        ℹ️ Your current email remains active for login until approved by the Site Owner.
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleCancelRequest(pendingRequest.id)}
                      disabled={cancellingId === pendingRequest.id}
                      className={styles.cancelReqBtn}
                    >
                      <XCircle size={13} />
                      <span>{cancellingId === pendingRequest.id ? 'Cancelling...' : 'Cancel Request'}</span>
                    </button>
                  </div>
                )}

                {/* Email Change Request Form Drawer/Card */}
                {showEmailForm && !pendingRequest && (
                  <div className={styles.emailChangeCard}>
                    <div className={styles.emailChangeHeader}>
                      <span className={styles.emailChangeTitle}>
                        <Mail size={16} />
                        Request Email ID Change
                      </span>
                      <button 
                        type="button" 
                        onClick={() => { setShowEmailForm(false); setEmailError(''); }}
                        className={styles.closeFormBtn}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <p className={styles.emailChangeHelp}>
                      Submit an official request to update your login and corporate communications email. For security, all email modifications require review and approval by the Site Owner.
                    </p>

                    {emailError && (
                      <div className={styles.errorBanner}>
                        <AlertCircle size={16} />
                        <span>{emailError}</span>
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>New Corporate Email Address *</label>
                      <input 
                        type="email" 
                        placeholder="new.email@bavi.com"
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Confirm New Email Address *</label>
                      <input 
                        type="email" 
                        placeholder="Retype new email"
                        value={emailForm.confirmEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })}
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Current Account Password (for security verification) *</label>
                      <input 
                        type="password" 
                        placeholder="Enter your current password"
                        value={emailForm.password}
                        onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Reason for Email Change *</label>
                      <textarea 
                        rows={2}
                        placeholder="e.g., Domain update, typo correction during onboarding, corporate mailbox migration..."
                        value={emailForm.reason}
                        onChange={(e) => setEmailForm({ ...emailForm, reason: e.target.value })}
                        className={`${styles.formInput} ${styles.textarea}`}
                        required
                      />
                    </div>

                    <div className={styles.formActionRow}>
                      <button 
                        type="button" 
                        onClick={() => { setShowEmailForm(false); setEmailError(''); }}
                        className={styles.cancelFormBtn}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleEmailRequestSubmit}
                        disabled={emailLoading}
                        className={styles.submitEmailReqBtn}
                      >
                        <Send size={14} />
                        <span>{emailLoading ? 'Submitting Request...' : 'Submit to Owner for Approval'}</span>
                      </button>
                    </div>
                  </div>
                )}
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
