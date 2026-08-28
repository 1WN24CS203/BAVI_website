'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from '../login/login.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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
      await signup(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <div className={styles.logoBrand}>BAVI INTERIORS</div>
            <div className={styles.logoSub}>Bahubali Builders & Visionary Interiors</div>
          </div>
        </Link>
        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>
            Register <span className={styles.gold}>Account</span>
          </h1>
          <p className={styles.brandText}>
            ! WE BOND YOUR SPACE WITH BAHUBALI GRACE !<br /><br />
            Create your client account to access your personalized project dashboard, track construction milestones, and communicate with your designer.
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
          <h2 className={styles.formTitle}>Create Client Account</h2>
          <p className={styles.formSubtitle}>Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className={styles.form} id="register-form">
            <div className={styles.formGroup}>
              <label htmlFor="reg-name" className={styles.formLabel}>Full Name *</label>
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
              <label htmlFor="reg-email" className={styles.formLabel}>Email Address *</label>
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
              <label htmlFor="reg-password" className={styles.formLabel}>Password *</label>
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
              <label htmlFor="reg-confirm" className={styles.formLabel}>Confirm Password *</label>
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
                  Register Account
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

          <Link href="/" className={styles.backLink}>← Back to Home Studio</Link>
        </div>
      </div>
    </div>
  );
}
