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
  Crown
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import styles from './register.module.css';

export default function DesignerRegisterPage() {
  const router = useRouter();
  const { hasOwner, registerOwner, submitAccessRequest, checkRequestStatus } = useDesignerAuth();

  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'status'
  
  // Owner Setup Form State
  const [ownerData, setOwnerData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Principal Architect & Site Owner',
    bio: ''
  });

  // Designer Applicant Form State
  const [applicantData, setApplicantData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Luxury Villa Architect',
    councilRegNo: '',
    bio: ''
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

  // Handler for First Registration (Site Owner)
  const handleOwnerRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerOwner(ownerData);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Owner registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for Subsequent Registrations (New Designer Request)
  const handleDesignerRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitAccessRequest(applicantData);
      setSubmittedEmail(applicantData.email);
      setRequestSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
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
            <span className={styles.brandTag}>
              {!hasOwner ? 'Primary Site Owner Setup' : 'Architect & Designer Access Portal'}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        {error && (
          <div className={styles.errorBanner} style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* CASE 1: NO OWNER REGISTERED YET — FIRST REGISTRATION FLOW */}
        {!hasOwner ? (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.15) 0%, rgba(20, 20, 20, 0.9) 100%)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Crown size={24} color="var(--color-gold)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>
                  First Registration: Site Owner & Admin Setup
                </div>
                <div style={{ color: '#aaa', fontSize: '0.78rem', marginTop: '2px' }}>
                  No security key required for the founder. You will be registered as the primary administrator with full approval authority over all future designers.
                </div>
              </div>
            </div>

            <form onSubmit={handleOwnerRegister} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Owner Full Name *</label>
                  <div className={styles.inputWrapper}>
                    <User size={16} className={styles.inputIcon} />
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={ownerData.fullName}
                      onChange={(e) => setOwnerData({ ...ownerData, fullName: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Corporate / Business Email *</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input
                      type="email"
                      required
                      placeholder="owner@bavi.in"
                      value={ownerData.email}
                      onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Create Owner Password (min 6 chars) *</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••••••"
                      value={ownerData.password}
                      onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Contact Phone *</label>
                  <div className={styles.inputWrapper}>
                    <Phone size={16} className={styles.inputIcon} />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98450 XXXXX"
                      value={ownerData.phone}
                      onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Professional Title / Role</label>
                <div className={styles.inputWrapper}>
                  <Compass size={16} className={styles.inputIconGold} />
                  <input
                    type="text"
                    placeholder="Principal Architect & Founder"
                    value={ownerData.specialization}
                    onChange={(e) => setOwnerData({ ...ownerData, specialization: e.target.value })}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Bio / Vision Statement</label>
                <textarea
                  rows={2}
                  placeholder="! WE BOND YOUR SPACE WITH BAHUBALI GRACE !"
                  value={ownerData.bio}
                  onChange={(e) => setOwnerData({ ...ownerData, bio: e.target.value })}
                  className={styles.textarea}
                />
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? (
                  <span>Registering Owner Account...</span>
                ) : (
                  <>
                    <Crown size={17} />
                    <span>Complete Owner Setup & Access Dashboard</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* CASE 2: OWNER ALREADY EXISTS — NEW DESIGNERS SUBMIT ACCESS REQUESTS */
          <div>
            {/* Tabs */}
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

            {/* TAB 1: Request Security Key */}
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
                      Request Submitted to Site Owner!
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#bbb', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.6 }}>
                      Your application has been routed to the verified BAVI Site Owner. Once approved, you will receive a unique security key to access the command dashboard.
                    </p>
                    <div style={{
                      background: '#181818',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      color: 'var(--color-gold)',
                      marginBottom: '18px'
                    }}>
                      Check status anytime with: <strong>{submittedEmail}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button
                        type="button"
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
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleDesignerRequest} className={styles.form}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Full Legal Name *</label>
                        <div className={styles.inputWrapper}>
                          <User size={16} className={styles.inputIcon} />
                          <input
                            type="text"
                            required
                            placeholder="Your full name"
                            value={applicantData.fullName}
                            onChange={(e) => setApplicantData({ ...applicantData, fullName: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Corporate / Professional Email *</label>
                        <div className={styles.inputWrapper}>
                          <Mail size={16} className={styles.inputIcon} />
                          <input
                            type="email"
                            required
                            placeholder="architect@domain.com"
                            value={applicantData.email}
                            onChange={(e) => setApplicantData({ ...applicantData, email: e.target.value })}
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
                            value={applicantData.password}
                            onChange={(e) => setApplicantData({ ...applicantData, password: e.target.value })}
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
                            value={applicantData.phone}
                            onChange={(e) => setApplicantData({ ...applicantData, phone: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Department *</label>
                        <div className={styles.inputWrapper}>
                          <Compass size={16} className={styles.inputIconGold} />
                          <select
                            value={applicantData.department || 'architecture'}
                            onChange={(e) => setApplicantData({ ...applicantData, department: e.target.value })}
                            className={`${styles.formInput} ${styles.selectInput}`}
                            required
                          >
                            <option value="architecture">Architecture & Design</option>
                            <option value="construction">Construction & Management</option>
                            <option value="marketing">Marketing & Sales</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Requested Role</label>
                        <div className={styles.inputWrapper}>
                          <Award size={16} className={styles.inputIcon} />
                          <select
                            value={applicantData.requestedRole || 'designer'}
                            onChange={(e) => setApplicantData({ ...applicantData, requestedRole: e.target.value })}
                            className={`${styles.formInput} ${styles.selectInput}`}
                          >
                            <option value="designer">Designer / Architect</option>
                            <option value="engineer">Site Engineer</option>
                            <option value="manager">Project Manager</option>
                            <option value="marketer">Marketing Executive</option>
                            <option value="owner">Owner / Co-Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Specialization *</label>
                        <div className={styles.inputWrapper}>
                          <Compass size={16} className={styles.inputIconGold} />
                          <select
                            value={applicantData.specialization}
                            onChange={(e) => setApplicantData({ ...applicantData, specialization: e.target.value })}
                            className={`${styles.formInput} ${styles.selectInput}`}
                          >
                            <option value="Luxury Villa Architect">Luxury Villa Architect</option>
                            <option value="Head of Interior Architecture">Head of Interior Architecture</option>
                            <option value="Commercial & Institutional Lead">Commercial & Institutional Lead</option>
                            <option value="Heritage Restoration Specialist">Heritage Restoration Specialist</option>
                            <option value="BIM & 3D Visualization Engineer">BIM & 3D Visualization Engineer</option>
                            <option value="Site Supervision Engineer">Site Supervision Engineer</option>
                            <option value="Quality Assurance Engineer">Quality Assurance Engineer</option>
                            <option value="Procurement & Materials Manager">Procurement & Materials Manager</option>
                            <option value="Marketing & Business Development">Marketing & Business Development</option>
                            <option value="Safety & Compliance Officer">Safety & Compliance Officer</option>
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
                            value={applicantData.councilRegNo}
                            onChange={(e) => setApplicantData({ ...applicantData, councilRegNo: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Portfolio / Experience Summary</label>
                      <textarea
                        rows={2}
                        placeholder="Brief summary of professional experience, landmark projects, and credentials..."
                        value={applicantData.bio}
                        onChange={(e) => setApplicantData({ ...applicantData, bio: e.target.value })}
                        className={styles.textarea}
                      />
                    </div>

                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                      {loading ? (
                        <span>Submitting Request...</span>
                      ) : (
                        <>
                          <Sparkles size={17} />
                          <span>Submit Request to Site Owner</span>
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
                          {statusResult.specialization}
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
                            <span>Awaiting review and key approval by the BAVI Site Owner. Check back soon!</span>
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
                                Your Approved Security Key:
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
                            Application not approved: {statusResult.rejectionReason || 'Credentials could not be verified.'}
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
                        No application found for <strong>{statusEmail}</strong>. Please check spelling or submit a request above.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.loginRedirect} style={{ marginTop: '20px' }}>
          <span>Already registered?</span>
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
