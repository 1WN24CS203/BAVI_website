'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials or register a new account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bgPattern} />
      <div className={styles.bgGlow} />

      {/* Left Branding */}
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
            Welcome <span className={styles.gold}>Back</span>
          </h1>
          <p className={styles.brandText}>
            ! WE BOND YOUR SPACE WITH BAHUBALI GRACE !<br /><br />
            Sign in to access your project dashboard, track milestone roadmaps, manage consultations, 
            and view verified tax bills.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureDot} />
              Track construction milestones in real-time
            </div>
            <div className={styles.feature}>
              <span className={styles.featureDot} />
              Book and manage design consultations
            </div>
            <div className={styles.feature}>
              <span className={styles.featureDot} />
              Pay milestone bills via Phone / UPI QR
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Client Sign In</h2>
          <p className={styles.formSubtitle}>Enter your account credentials to access your dashboard</p>

          <form onSubmit={handleSubmit} className={styles.form} id="login-form">
            <div className={styles.formGroup}>
              <label htmlFor="login-email" className={styles.formLabel}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.formInput}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="login-password" className={styles.formLabel}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter your password"
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
              id="login-submit"
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <p className={styles.signupLink}>
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className={styles.link}>Register New Account</Link>
          </p>

          <Link href="/" className={styles.backLink}>← Back to Home Studio</Link>
        </div>
      </div>
    </div>
  );
}
