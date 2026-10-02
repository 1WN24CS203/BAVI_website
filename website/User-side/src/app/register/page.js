'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PhoneCall, ShieldCheck, Clock, CheckCircle2, User, Phone, Mail, 
  MapPin, Building, ArrowRight, AlertCircle, Sparkles, KeyRound,
  FileCheck2, CheckCircle, Search, HelpCircle, Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from '../login/login.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { submitBookingInquiry, checkBookingStatus } = useAuth();
  
  const [activeTab, setActiveTab] = useState('booking'); // 'booking' | 'status'
  
  // Booking Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    projectType: 'Luxury Villa Architecture',
    budget: '₹50 Lakhs - ₹1 Crore',
    location: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [error, setError] = useState('');

  // Status Search State
  const [statusQuery, setStatusQuery] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await submitBookingInquiry(formData);
      setSubmitted(true);
      setSubmitMsg(res.message);
    } catch (err) {
      setError(err.message || 'Failed to submit consultation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusCheck = async (e) => {
    e.preventDefault();
    if (!statusQuery.trim()) return;
    setStatusLoading(true);
    try {
      const res = await checkBookingStatus(statusQuery);
      setStatusResult(res);
    } catch (err) {
      setStatusResult({ status: 'ERROR', message: 'Unable to query status at this time.' });
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgPattern} />
      <div className={styles.bgGlow} />

      {/* Brand Side */}
      <div className={styles.brandSide}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.png" alt="BAVI" className={styles.logoImage} />
          <div>
            <div className={styles.logoBrand}>BAVI INTERIORS</div>
            <div className={styles.logoSub}>Bahubali Builders & Visionary Interiors</div>
          </div>
        </Link>

        <div className={styles.brandContent}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(201, 168, 76, 0.12)',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '0.78rem',
            color: '#c9a84c',
            fontWeight: 600,
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}>
            <ShieldCheck size={14} /> Concierge Client Onboarding
          </div>

          <h1 className={styles.brandTitle}>
            Project Booking &amp; <span className={styles.gold}>Client Access</span>
          </h1>

          <p className={styles.brandText}>
            ! WE BOND YOUR SPACE WITH BAHUBALI GRACE !<br /><br />
            To uphold rigorous architectural excellence, <strong>BAVI client accounts are provisioned exclusively</strong> following a verified callback consultation and an approved project commission.
          </p>

          {/* 4-Step Process Journey */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                background: 'rgba(201, 168, 76, 0.15)',
                color: '#c9a84c',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0
              }}>1</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#f0f0f0' }}>Book Consultation &amp; Request Callback</strong>
                <p style={{ fontSize: '0.75rem', color: '#909090', margin: 0 }}>Submit your architectural vision, site location, and budget range.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                background: 'rgba(201, 168, 76, 0.15)',
                color: '#c9a84c',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0
              }}>2</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#f0f0f0' }}>Architect Callback Conversation</strong>
                <p style={{ fontSize: '0.75rem', color: '#909090', margin: 0 }}>Our Senior Architect contacts you within 24h to finalize scope and requirements.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                background: 'rgba(201, 168, 76, 0.15)',
                color: '#c9a84c',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0
              }}>3</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#f0f0f0' }}>Project Approved &amp; Credentials Mailed</strong>
                <p style={{ fontSize: '0.75rem', color: '#909090', margin: 0 }}>Designer verifies project booking, generates your Client ID &amp; password, and dispatches them to your email.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                background: 'rgba(201, 168, 76, 0.15)',
                color: '#c9a84c',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0
              }}>4</div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#f0f0f0' }}>Log In &amp; Co-Pilot Construction</strong>
                <p style={{ fontSize: '0.75rem', color: '#909090', margin: 0 }}>Sign in to approve milestone stages, raise queries, and inspect site blueprints.</p>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#a0a0a0' }}>
            Already received credentials from your designer?{' '}
            <Link href="/login" style={{ color: '#c9a84c', fontWeight: 600, textDecoration: 'underline' }}>
              Sign In to Portal →
            </Link>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className={styles.formSide} style={{ overflowY: 'auto', maxHeight: '100vh', padding: '40px 20px' }}>
        <div className={styles.formCard} style={{ maxWidth: '540px' }}>

          {/* Tab Selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('booking'); setSubmitted(false); }}
              style={{
                background: activeTab === 'booking' ? '#c9a84c' : 'transparent',
                color: activeTab === 'booking' ? '#000' : '#a0a0a0',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '7px',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <PhoneCall size={16} /> Book Project Consultation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              style={{
                background: activeTab === 'status' ? '#c9a84c' : 'transparent',
                color: activeTab === 'status' ? '#000' : '#a0a0a0',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '7px',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Search size={16} /> Check Booking Status
            </button>
          </div>

          {activeTab === 'booking' ? (
            <>
              {submitted ? (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '12px',
                  padding: '30px 24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
                    Consultation &amp; Booking Submitted!
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#ccc', lineHeight: '1.6', marginBottom: '20px' }}>
                    {submitMsg}
                  </p>
                  
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px dashed rgba(201, 168, 76, 0.35)',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    textAlign: 'left',
                    marginBottom: '20px',
                    fontSize: '0.82rem',
                    color: '#ddd'
                  }}>
                    <div style={{ color: '#c9a84c', fontWeight: 600, marginBottom: '4px' }}>Next Immediate Steps:</div>
                    1. A BAVI Senior Architect will call you at <strong>{formData.phone}</strong>.<br />
                    2. Requirements &amp; budget will be reviewed.<br />
                    3. Your <strong>Client ID</strong> and <strong>temporary password</strong> will be mailed directly from our Designer Studio.
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link
                      href="/login"
                      style={{
                        background: '#c9a84c',
                        color: '#000',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textDecoration: 'none'
                      }}
                    >
                      Go to Client Sign In →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      style={{
                        background: 'transparent',
                        color: '#aaa',
                        border: '1px solid #444',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Submit Another
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className={styles.formTitle}>Book Consultation</h2>
                  <p className={styles.formSubtitle}>
                    Initiate your project commission. Accounts are provisioned after callback approval.
                  </p>

                  <form onSubmit={handleBookingSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Legal Name *</label>
                      <div className={styles.inputWrapper}>
                        <User size={18} className={styles.inputIcon} />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={styles.formInput}
                          placeholder="e.g. Anand Hegde"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Primary Phone *</label>
                        <div className={styles.inputWrapper}>
                          <Phone size={18} className={styles.inputIcon} />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={styles.formInput}
                            placeholder="+91 98765 43210"
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email for Credentials *</label>
                        <div className={styles.inputWrapper}>
                          <Mail size={18} className={styles.inputIcon} />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.formInput}
                            placeholder="anand@gmail.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Commission Type</label>
                        <div className={styles.inputWrapper}>
                          <Building size={18} className={styles.inputIcon} />
                          <select
                            name="projectType"
                            value={formData.projectType}
                            onChange={handleChange}
                            className={styles.formInput}
                            style={{ background: '#12131a', color: '#fff' }}
                          >
                            <option value="Luxury Villa Architecture">Luxury Villa Architecture</option>
                            <option value="Commercial Interior Design">Commercial Interior Design</option>
                            <option value="Penthouse Renovation">Penthouse Renovation</option>
                            <option value="Complete Turnkey Construction">Complete Turnkey Construction</option>
                            <option value="Landscape & Facade Design">Landscape & Facade Design</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Estimated Budget</label>
                        <div className={styles.inputWrapper}>
                          <Layers size={18} className={styles.inputIcon} />
                          <select
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            className={styles.formInput}
                            style={{ background: '#12131a', color: '#fff' }}
                          >
                            <option value="₹25 Lakhs - ₹50 Lakhs">₹25 Lakhs - ₹50 Lakhs</option>
                            <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                            <option value="₹1 Crore - ₹3 Crores">₹1 Crore - ₹3 Crores</option>
                            <option value="₹3 Crores+ (Ultra Luxury)">₹3 Crores+ (Ultra Luxury)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Site Address / Plot City *</label>
                      <div className={styles.inputWrapper}>
                        <MapPin size={18} className={styles.inputIcon} />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className={styles.formInput}
                          placeholder="e.g. Indiranagar, Bengaluru / Channarayapatna"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Project Vision &amp; Notes</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className={styles.formInput}
                        rows={3}
                        placeholder="Briefly describe your vision, number of floors, timeline, or specific preferences..."
                        style={{ height: 'auto', padding: '10px 14px' }}
                      />
                    </div>

                    {error && (
                      <div className={styles.errorMsg}>
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className={styles.spinner} />
                      ) : (
                        <>
                          <PhoneCall size={18} />
                          Request Callback &amp; Project Commission
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            /* Status Check Tab */
            <div>
              <h2 className={styles.formTitle}>Check Booking Status</h2>
              <p className={styles.formSubtitle}>
                Enter the email address or phone number submitted during your project booking.
              </p>

              <form onSubmit={handleStatusCheck} style={{ marginBottom: '20px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email or Phone Number</label>
                  <div className={styles.inputWrapper}>
                    <Search size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      value={statusQuery}
                      onChange={(e) => setStatusQuery(e.target.value)}
                      className={styles.formInput}
                      placeholder="e.g. anand@gmail.com or 9845012345"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={statusLoading}
                >
                  {statusLoading ? 'Checking...' : 'Check Status'}
                </button>
              </form>

              {statusResult && (
                <div style={{
                  background: statusResult.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(201, 168, 76, 0.1)',
                  border: `1px solid ${statusResult.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(201, 168, 76, 0.4)'}`,
                  borderRadius: '10px',
                  padding: '18px',
                  fontSize: '0.86rem',
                  lineHeight: '1.6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {statusResult.status === 'APPROVED' ? (
                      <CheckCircle2 color="#22c55e" size={20} />
                    ) : (
                      <Clock color="#c9a84c" size={20} />
                    )}
                    <strong style={{ color: statusResult.status === 'APPROVED' ? '#22c55e' : '#c9a84c' }}>
                      {statusResult.status === 'APPROVED' ? 'Project Commission Approved' : 'In Review / In Process'}
                    </strong>
                  </div>
                  <p style={{ color: '#e0e0e0', margin: '0 0 12px 0' }}>{statusResult.message}</p>

                  {statusResult.client_code && (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase' }}>Issued Client ID</div>
                      <div style={{ fontSize: '1.05rem', color: '#c9a84c', fontWeight: 700, letterSpacing: '1px' }}>
                        {statusResult.client_code}
                      </div>
                    </div>
                  )}

                  {statusResult.status === 'APPROVED' && (
                    <Link
                      href="/login"
                      style={{
                        display: 'inline-block',
                        background: '#c9a84c',
                        color: '#000',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      Sign In With Issued Password →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p className={styles.signupLink} style={{ margin: 0 }}>
              Already received your designer-issued credentials?{' '}
              <Link href="/login" className={styles.link}>Sign In Here</Link>
            </p>
          </div>

          <Link href="/" className={styles.backLink}>← Back to Home Studio</Link>
        </div>
      </div>
    </div>
  );
}
