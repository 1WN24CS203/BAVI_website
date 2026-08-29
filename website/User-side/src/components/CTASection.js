'use client';

import Link from 'next/link';
import { ArrowRight, PhoneCall, Sparkles, ShieldCheck, CalendarCheck } from 'lucide-react';
import styles from './CTASection.module.css';

export default function CTASection() {
  return (
    <section className={styles.section} id="cta-section">
      <div className={styles.container}>
        <div className={styles.ctaCard}>
          {/* Background Glow */}
          <div className={styles.glowAura} />

          <div className={styles.content}>
            <div className={styles.badge}>
              <Sparkles size={13} />
              <span>Private Commissions Open for 2024-2025</span>
            </div>

            <h2 className={styles.title}>
              Ready to Construct Your{' '}
              <span className={styles.goldText}>Architectural Legacy?</span>
            </h2>

            <p className={styles.subtitle}>
              Schedule a confidential 1-on-1 design consultation with our Principal Architect & engineering team. 
              We review site constraints, budget horizons, and bespoke material palettes.
            </p>

            <div className={styles.actions}>
              <Link href="/contact" className={styles.primaryBtn} id="cta-book-consultation">
                <CalendarCheck size={18} />
                <span>Book Architecture Consultation</span>
                <ArrowRight size={16} />
              </Link>

              <a href="tel:+918277762487" className={styles.callBtn} id="cta-call-direct">
                <PhoneCall size={17} />
                <span>+91 82777 62487</span>
              </a>
            </div>

            <div className={styles.footerRow}>
              <div className={styles.guaranteeItem}>
                <ShieldCheck size={16} className={styles.checkIcon} />
                <span>Zero Cost Conceptual Feasibility Review</span>
              </div>
              <div className={styles.guaranteeItem}>
                <ShieldCheck size={16} className={styles.checkIcon} />
                <span>Bank-Secured Milestone Escrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
