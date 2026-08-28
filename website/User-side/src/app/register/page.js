'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import styles from '../login/login.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Unable to connect. Please check your internet connection.');
    } finally {
      setLoading(false);
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
            <div className={styles.logoBrand}>BAVI</div>
            <div className={styles.logoSub}>Builders & Visionary Interiors</div>
          </div>
        </Link>
        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>
            Join <span className={styles.gold}>BAVI</span>
          </h1>
          <p className={styles.brandText}>
            Create your account to access your personalized dashboard, track your 
            project, and connect with your assigned designer.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureDot} />
              Personalized project dashboard
            </div>
            <div className={styles.feature}>
              <span className={styles.featureDot} />
              Direct designer communication
            </div>
            <div className={styles.feature}>
              <span className={styles.featureDot} />
              Transparent payment tracking
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle size={60} color="var(--color-success)" style={{ marginBottom: '20px' }} />
              <h2 className={styles.formTitle} style={{ marginBottom: '10px' }}>Check Your Email</h2>
              <p className={styles.formSubtitle} style={{ marginBottom: '30px' }}>
                We&apos;ve sent a verification link to <strong style={{ color: 'var(--color-gold)' }}>{formData.email}</strong>. 
                Please verify your email to continue.
              </p>
              <Link href="/login" className={styles.link}>
                Go to Login →
              </Link>
            </div>
          ) : (
            <>
              <h2 className={styles.formTitle}>Create Account</h2>
              <p className={styles.formSubtitle}>Fill in your details to get started</p>

              <form onSubmit={handleSubmit} className={styles.form} id="register-form">
                <div className={styles.formGroup}>
                  <label htmlFor="reg-name" className={styles.formLabel}>Full Name</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      id="reg-name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reg-email" className={styles.formLabel}>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      type="email"
                      id="reg-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reg-phone" className={styles.formLabel}>Phone Number</label>
                  <div className={styles.inputWrapper}>
                    <Phone size={18} className={styles.inputIcon} />
                    <input
                      type="tel"
                      id="reg-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reg-password" className={styles.formLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="reg-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Min. 6 characters"
                      required
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reg-confirm" className={styles.formLabel}>Confirm Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      type="password"
                      id="reg-confirm"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
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
                  id="register-submit"
                >
                  {loading ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className={styles.divider}><span>or</span></div>

              <p className={styles.signupLink}>
                Already have an account?{' '}
                <Link href="/login" className={styles.link}>Sign in</Link>
              </p>

              <Link href="/" className={styles.backLink}>← Back to Home</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
