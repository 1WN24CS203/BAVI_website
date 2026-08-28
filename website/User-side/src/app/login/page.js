'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth, DEMO_CUSTOMERS } from '@/context/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('rajesh.sharma@example.com');
  const [password, setPassword] = useState('Customer@123');
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
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demo) => {
    setEmail(demo.email);
    setPassword('Customer@123');
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
            <div className={styles.logoBrand}>BAVI</div>
            <div className={styles.logoSub}>Builders & Visionary Interiors</div>
          </div>
        </Link>
        <div className={styles.brandContent}>
          <h1 className={styles.brandTitle}>
            Welcome <span className={styles.gold}>Back</span>
          </h1>
          <p className={styles.brandText}>
            Access your project dashboard, track progress, manage consultations, 
            and stay connected with your designer.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureDot} />
              Track project progress in real-time
            </div>
            <div className={styles.feature}>
              <span className={styles.featureDot} />
              Book and manage consultations
            </div>
            <div className={styles.feature}>
              <span className={styles.featureDot} />
              Secure payment processing
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Sign In</h2>
          <p className={styles.formSubtitle}>Enter your credentials to access your dashboard</p>

          {/* Quick Demo Credentials */}
          <div style={{
            background: 'rgba(201, 168, 76, 0.08)',
            border: '1px dashed rgba(201, 168, 76, 0.3)',
            borderRadius: '6px',
            padding: '10px',
            marginBottom: '16px'
          }}>
            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              fontWeight: 700,
              letterSpacing: '0.5px',
              marginBottom: '6px'
            }}>One-Click Demo Clients:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {DEMO_CUSTOMERS.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => handleQuickDemo(c)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    background: email === c.email ? 'var(--color-gold)' : 'var(--color-dark)',
                    color: email === c.email ? 'var(--color-black)' : 'var(--color-text-secondary)',
                    fontWeight: email === c.email ? 700 : 500,
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {c.full_name.split(' ')[0]} ({c.designer?.name?.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

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
            Don&apos;t have an account?{' '}
            <Link href="/register" className={styles.link}>Create one</Link>
          </p>

          <Link href="/" className={styles.backLink}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
