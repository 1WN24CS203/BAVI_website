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
    budget: '₹2 Cr - ₹5 Cr',
    location: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
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
              <span>Architectural Commission Inquiries</span>
            </div>
            <h1 className={styles.title}>
              Schedule Your Private <span className={styles.goldText}>Design Consultation</span>
            </h1>
            <p className={styles.subtitle}>
              Connect directly with Principal Architect Arun Bahubali to review plot feasibility, 
              budget architecture, and master planning.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className={styles.contentSection}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {/* Left Column: Contact Cards */}
              <div className={styles.infoCol}>
                <div className={styles.conciergeCard}>
                  <div className={styles.conciergeHeader}>
                    <img src="/logo.png" alt="BAVI" className={styles.conciergeLogo} />
                    <div>
                      <h3 className={styles.conciergeTitle}>Studio Concierge</h3>
                      <span className={styles.conciergeSub}>Sadashivanagar Studio</span>
                    </div>
                  </div>

                  <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                      <MapPin size={18} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Studio Address</div>
                        <div className={styles.infoValue}>#42, 8th Main, Sadashivanagar, Bengaluru, KA 560080</div>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Phone size={18} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Direct Line</div>
                        <a href="tel:+919845012345" className={styles.infoLink}>+91 98450 12345</a>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Mail size={18} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Inquiries</div>
                        <a href="mailto:concierge@bavi.in" className={styles.infoLink}>concierge@bavi.in</a>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Clock size={18} className={styles.infoIcon} />
                      <div>
                        <div className={styles.infoLabel}>Consultation Hours</div>
                        <div className={styles.infoValue}>Mon – Sat: 09:30 AM – 06:30 PM (By Prior Appointment)</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.trustBadge}>
                    <ShieldCheck size={16} className={styles.trustIcon} />
                    <span>Non-Disclosure Agreement (NDA) Protected Consultation</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Astryx Form Card */}
              <div className={styles.formCol}>
                <div className={styles.formCard}>
                  {submitted ? (
                    <div className={styles.successState}>
                      <div className={styles.successIconWrap}>
                        <CheckCircle2 size={48} className={styles.successIcon} />
                      </div>
                      <h3 className={styles.successTitle}>Consultation Request Confirmed</h3>
                      <p className={styles.successText}>
                        Thank you, <strong>{formData.name}</strong>. Our senior architectural concierge has received 
                        your commission brief for <strong>{formData.projectType}</strong> in <strong>{formData.location || 'Bengaluru'}</strong>.
                      </p>
                      <p className={styles.successSubtext}>
                        We will reach out to you via phone at <strong>{formData.phone}</strong> within 2 business hours.
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
                      <h3 className={styles.formHeaderTitle}>Commission Feasibility Form</h3>
                      <p className={styles.formHeaderSub}>Please provide project parameters for review.</p>

                      <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rajesh Sharma"
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
                            placeholder="+91 98450 XXXXX"
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
                          placeholder="client@luxury.in"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Commission Discipline</label>
                          <select
                            value={formData.projectType}
                            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                            className={styles.select}
                          >
                            <option value="Luxury Villa Architecture">Luxury Villa Architecture</option>
                            <option value="Bespoke Penthouse Interior">Bespoke Penthouse Interior</option>
                            <option value="Commercial Landmark HQ">Commercial Landmark HQ</option>
                            <option value="Heritage Estate Restoration">Heritage Estate Restoration</option>
                          </select>
                        </div>

                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Estimated Budget Horizon</label>
                          <select
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            className={styles.select}
                          >
                            <option value="₹1 Cr - ₹2 Cr">₹1 Cr - ₹2 Cr</option>
                            <option value="₹2 Cr - ₹5 Cr">₹2 Cr - ₹5 Cr</option>
                            <option value="₹5 Cr - ₹15 Cr">₹5 Cr - ₹15 Cr</option>
                            <option value="₹15 Cr+">₹15 Cr+</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Site Location / Plot Details *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sadashivanagar / Whitefield / Mysuru"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Vision / Architectural Requirements</label>
                        <textarea
                          rows={4}
                          placeholder="Describe your desired aesthetic, square footage, specific amenities (e.g. infinity pool, wine cellar, home cinema)..."
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
                        <span>{loading ? 'Transmitting Commission...' : 'Request Private Consultation'}</span>
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
