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
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Check,
  Copy,
  ChevronRight,
  Building2
} from 'lucide-react';
import { useDesignerAuth, MASTER_DESIGNERS } from '@/context/AuthContext';
import styles from './register.module.css';

export default function DesignerRegisterPage() {
  const router = useRouter();
  const { submitAccessRequest, checkRequestStatus } = useDesignerAuth();

  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'status'
  
  // Request Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Principal Luxury Villa Architect',
    councilRegNo: '',
    bio: '',
    approverId: MASTER_DESIGNERS[0].id,
    approverName: MASTER_DESIGNERS[0].full_name + ' (Principal Architect & Founder)'
  });

  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Status Search State
  const [statusEmail, setStatusEmail] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [statusChecked, setStatusChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  const customerPortalUrl = process.env.NEXT_PUBLIC_SITE_URL || '/';

  const handleApproverChange = (e) => {
    const selectedId = e.target.value;
    const approver = MASTER_DESIGNERS.find(d => d.id === selectedId) || MASTER_DESIGNERS[0];
    setFormData({
      ...formData,
      approverId: approver.id,
      approverName: `${approver.full_name} (${approver.specialization})`
    });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitAccessRequest(formData);
      setSubmittedEmail(formData.email);
      setRequestSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = (e) => {
    e.preventDefault();
    if (!statusEmail) return;
    const res = checkRequestStatus(statusEmail);
    setStatusResult(res);
    setStatusChecked(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <span className={styles.brandTag}>Architect & Designer Access Portal</span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Owner / Master Architect Quick Notice */}
        <div style={{
          background: 'rgba(201, 168, 76, 0.08)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="var(--color-gold)" />
            <div style={{ fontSize: '0.82rem', color: '#ccc' }}>
              <strong style={{ color: '#fff' }}>Site Owner / Master Architect?</strong> Pre-authorized access is enabled.
            </div>
          </div>
          <Link 
            href="/login" 
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--color-gold)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              borderBottom: '1px dashed var(--color-gold)',
              paddingBottom: '1px'
            }}
          >
            <span>Direct Sign In</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Tabs: Request Key vs Check Status */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('request'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'request' ? 'var(--color-gold)' : 'transparent',
              color: activeTab === 'request' ? '#000' : '#888',
              fontWeight: activeTab === 'request' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <KeyRound size={15} />
            <span>Request Security Key</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('status'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'status' ? 'var(--color-gold)' : 'transparent',
              color: activeTab === 'status' ? '#000' : '#888',
              fontWeight: activeTab === 'status' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={15} />
            <span>Check Approval Status</span>
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner} style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: Request Security Key Form */}
        {activeTab === 'request' && (
          <>
            {requestSubmitted ? (
              <div style={{
                background: 'rgba(74, 222, 128, 0.08)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={42} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                  Application Submitted Successfully!
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#bbb', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.6 }}>
                  Your access request has been routed to <strong>{formData.approverName}</strong> for architectural verification and key approval.
                </p>
                <div style={{
                  background: '#181818',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  color: 'var(--color-gold)',
                  marginBottom: '18px'
                }}>
                  Track status anytime with your email: <strong>{submittedEmail}</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      setStatusEmail(submittedEmail);
                      setActiveTab('status');
                      const res = checkRequestStatus(submittedEmail);
                      setStatusResult(res);
                      setStatusChecked(true);
                    }}
                    style={{
                      padding: '10px 18px',
                      background: 'var(--color-gold)',
                      color: '#000',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    View Status Tracking
                  </button>
                  <button
                    onClick={() => {
                      setRequestSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        password: '',
                        phone: '',
                        specialization: 'Principal Luxury Villa Architect',
                        councilRegNo: '',
                        bio: '',
                        approverId: MASTER_DESIGNERS[0].id,
                        approverName: MASTER_DESIGNERS[0].full_name + ' (Principal Architect & Founder)'
                      });
                    }}
                    style={{
                      padding: '10px 18px',
                      background: 'transparent',
                      color: '#aaa',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className={styles.form}>
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
                        placeholder="architect@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Portal Password (min 6 chars) *</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={16} className={styles.inputIcon} />
                      <input
                        type="password"
                        required
                        minLength={6}
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

                {/* Approver Selection */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <span>Request Key Approval From Registered Lead *</span>
                    <span className={styles.goldLabel}>(Authorized Architect)</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <ShieldCheck size={16} className={styles.inputIconGold} />
                    <select
                      value={formData.approverId}
                      onChange={handleApproverChange}
                      className={`${styles.formInput} ${styles.selectInput}`}
                    >
                      {MASTER_DESIGNERS.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} — {d.specialization} {d.isOwner ? '(Founder / Lead)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Experience & Landmark Commissions</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly state your portfolio links, landmark villa projects, or firm credentials..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className={styles.textarea}
                  />
                </div>

                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? (
                    <span>Submitting Key Request...</span>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      <span>Submit Request for Security Key</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}

        {/* TAB 2: Check Approval Status */}
        {activeTab === 'status' && (
          <div style={{ padding: '8px 0' }}>
            <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <div className={styles.inputWrapper} style={{ flex: 1 }}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  required
                  placeholder="Enter your application email..."
                  value={statusEmail}
                  onChange={(e) => setStatusEmail(e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '0 20px',
                  background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark, #b8960a))',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Check
              </button>
            </form>

            {statusChecked && (
              <>
                {statusResult ? (
                  <div style={{
                    background: '#161616',
                    border: '1px solid ' + (
                      statusResult.status === 'APPROVED' ? 'rgba(74, 222, 128, 0.4)' :
                      statusResult.status === 'PENDING' ? 'rgba(201, 168, 76, 0.4)' :
                      'rgba(248, 113, 113, 0.4)'
                    ),
                    borderRadius: '10px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>Application ID: {statusResult.id}</span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: statusResult.status === 'APPROVED' ? 'rgba(74, 222, 128, 0.15)' :
                                    statusResult.status === 'PENDING' ? 'rgba(201, 168, 76, 0.15)' :
                                    'rgba(248, 113, 113, 0.15)',
                        color: statusResult.status === 'APPROVED' ? 'var(--color-success)' :
                               statusResult.status === 'PENDING' ? 'var(--color-gold)' :
                               '#f87171',
                        border: '1px solid ' + (
                          statusResult.status === 'APPROVED' ? 'rgba(74, 222, 128, 0.3)' :
                          statusResult.status === 'PENDING' ? 'rgba(201, 168, 76, 0.3)' :
                          'rgba(248, 113, 113, 0.3)'
                        )
                      }}>
                        {statusResult.status}
                      </span>
                    </div>

                    <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: '0 0 4px' }}>{statusResult.fullName}</h4>
                    <div style={{ fontSize: '0.82rem', color: '#aaa', marginBottom: '14px' }}>
                      {statusResult.specialization} • Assigned Approver: <strong>{statusResult.approverName}</strong>
                    </div>

                    {statusResult.status === 'PENDING' && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        background: 'rgba(201, 168, 76, 0.08)',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        color: '#ddd'
                      }}>
                        <Clock size={18} color="var(--color-gold)" />
                        <span>Awaiting verification and key approval by {statusResult.approverName}. Check back soon!</span>
                      </div>
                    )}

                    {statusResult.status === 'APPROVED' && (
                      <div>
                        <div style={{
                          background: 'rgba(74, 222, 128, 0.08)',
                          border: '1px solid rgba(74, 222, 128, 0.25)',
                          borderRadius: '8px',
                          padding: '14px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '6px' }}>
                            Your Approved Unique Security Key:
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#0d0d0d',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            border: '1px dashed var(--color-gold)'
                          }}>
                            <code style={{ fontSize: '1.1rem', color: 'var(--color-gold)', fontWeight: 700, letterSpacing: '1px' }}>
                              {statusResult.generatedCode}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(statusResult.generatedCode)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: copied ? 'var(--color-success)' : '#aaa',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.78rem'
                              }}
                            >
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                              <span>{copied ? 'Copied!' : 'Copy Key'}</span>
                            </button>
                          </div>
                        </div>

                        <Link
                          href="/login"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px',
                            background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark, #b8960a))',
                            color: '#000',
                            fontWeight: 700,
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.9rem'
                          }}
                        >
                          <span>Sign In to Dashboard with Key</span>
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}

                    {statusResult.status === 'REJECTED' && (
                      <div style={{
                        padding: '12px',
                        background: 'rgba(248, 113, 113, 0.1)',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        color: '#f87171'
                      }}>
                        Application not approved: {statusResult.rejectionReason || 'COA credentials could not be validated.'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    background: '#141414',
                    borderRadius: '8px',
                    color: '#888',
                    fontSize: '0.85rem'
                  }}>
                    No application found for <strong>{statusEmail}</strong>. Please check spelling or submit a new key request above.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className={styles.loginRedirect} style={{ marginTop: '20px' }}>
          <span>Already authorized with a key?</span>
          <Link href="/login" className={styles.loginLink}>Sign in to Command Dashboard</Link>
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
