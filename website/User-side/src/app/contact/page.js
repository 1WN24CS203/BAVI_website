'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  CalendarCheck,
  Building2,
  Compass
} from 'lucide-react';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'Luxury Villa Architecture',
    budget: 'Flexible / Turnkey',
    location: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const publicCallback = {
      id: 'cb-pub-' + Date.now(),
      name: formData.name.trim(),
      clientName: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      is_client: false,
      isClient: false,
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      created_at: new Date().toISOString(),
      status: 'pending',
      priority: 'normal',
      subject: formData.projectType,
      message: `${formData.message ? formData.message + ' | ' : ''}Location: ${formData.location || 'Not specified'}`,
    };

    try {
      const stored = localStorage.getItem('bavi_callback_requests');
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem('bavi_callback_requests', JSON.stringify([publicCallback, ...existing]));
    } catch (err) {
      console.warn('Failed to save public callback:', err);
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Header */}
        <section className={styles.headerSection}>
          <div className={styles.container}>
            <div className={styles.badge}>
              <Sparkles size={13} />
              <span>BAVI INTERIORS • Inquiry Concierge</span>
            </div>
            <h1 className={styles.title}>
              Schedule Your Private <span className={styles.goldText}>Design Consultation</span>
            </h1>
            <p className={styles.subtitle}>
              ! WE BOND YOUR SPACE WITH BAHUBALI GRACE !<br />
              Connect with our master architects to review plot feasibility, structural blueprints, and custom interior execution.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className={styles.contentSection}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {/* Left Column: Official Contact Cards */}
              <div className={styles.infoCol}>
                <div className={styles.conciergeCard}>
                  <div className={styles.conciergeHeader}>
                    <img src="/logo.png" alt="BAVI" className={styles.conciergeLogo} />
                    <div>
                      <h3 className={styles.conciergeTitle}>BAVI INTERIORS</h3>
                      <span className={styles.conciergeSub}>Bahubali Builders & Visionary Interiors</span>
                    </div>
                  </div>

                  <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                      <MapPin size={18} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Studio Address</div>
                        <div className={styles.infoValue}>
                          GURU Bhavana Backside, Ambikanagar, BM Road, CHANNARAYAPATNA
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Phone size={18} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Direct Contact Numbers</div>
                        <div className={styles.infoValue}>
                          <a href="tel:8277762487" className={styles.infoLink}>+91 8277762487</a> (Primary)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          Alt Lines: 8660562173, 6362979162,<br />8660614227, 7022330698
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Mail size={18} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Official Email</div>
                        <a href="mailto:Interiorsbavi@gmail.com" className={styles.infoLink}>Interiorsbavi@gmail.com</a>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Clock size={18} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Consultation Hours</div>
                        <div className={styles.infoValue}>Mon – Sat: 09:30 AM – 07:00 PM (By Appointment)</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.trustBadge}>
                    <ShieldCheck size={16} className={styles.trustIcon} />
                    <span>Verified Architectural & Interior Design Studio</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Form Card */}
              <div className={styles.formCol}>
                <div className={styles.formCard}>
                  {submitted ? (
                    <div className={styles.successState}>
                      <div className={styles.successIconWrap}>
                        <CheckCircle2 size={48} className={styles.successIcon} />
                      </div>
                      <h3 className={styles.successTitle}>Consultation Request Received</h3>
                      <p className={styles.successText}>
                        Thank you, <strong>{formData.name}</strong>. BAVI Interiors has received 
                        your inquiry for <strong>{formData.projectType}</strong> in <strong>{formData.location || 'Channarayapatna'}</strong>.
                      </p>
                      <p className={styles.successSubtext}>
                        We will reach out to you via phone at <strong>{formData.phone}</strong> shortly.
                      </p>
                      <button 
                        onClick={() => setSubmitted(false)} 
                        className={styles.newInquiryBtn}
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                      <h3 className={styles.formHeaderTitle}>Project Consultation Form</h3>
                      <p className={styles.formHeaderSub}>Please provide details about your property or project.</p>

                      <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="Primary mobile number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={styles.input}
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Service Discipline</label>
                          <select
                            value={formData.projectType}
                            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                            className={styles.select}
                          >
                            <option value="Luxury Villa Architecture">Luxury Villa Architecture</option>
                            <option value="Bespoke Interior Design">Bespoke Interior Design</option>
                            <option value="Modular Kitchen & Wardrobe">Modular Kitchen & Wardrobe</option>
                            <option value="Turnkey House Construction">Turnkey House Construction</option>
                            <option value="3D Elevation & Blueprint">3D Elevation & Blueprint</option>
                          </select>
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Location / Plot Details *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Channarayapatna / Mysuru / Hassan"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className={styles.input}
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Project Requirements / Vision</label>
                        <textarea
                          rows={4}
                          placeholder="Describe your desired layout, square footage, timber preferences, or specific interior concepts..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className={styles.textarea}
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className={styles.submitBtn}
                      >
                        <CalendarCheck size={18} />
                        <span>{loading ? 'Submitting Inquiry...' : 'Submit Consultation Request'}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
