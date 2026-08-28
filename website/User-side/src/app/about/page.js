'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  Compass, 
  Layers, 
  Users, 
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import Link from 'next/link';
import styles from './about.module.css';

const brandPillars = [
  { 
    title: 'Architectural Excellence', 
    desc: 'Bioclimatic residential estates and contemporary commercial spaces designed for sustainability and longevity.' 
  },
  { 
    title: 'Direct Escrow Transparency', 
    desc: 'Bank and UPI QR milestone payments cleared directly as construction stages are verified.' 
  },
  { 
    title: 'Real-Time Client Dashboard', 
    desc: 'Track structural blueprints, municipal sanction status, and consultation schedules through your dedicated portal.' 
  }
];

const team = [
  {
    name: 'Arun Bahubali',
    role: 'Principal Architect',
    specialty: 'Luxury Villa Architecture & Structural Engineering'
  },
  {
    name: 'Ananya Hegde',
    role: 'Head of Visionary Interior Design',
    specialty: 'Contemporary Italian Interiors & Custom Millwork'
  }
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <div className={styles.badge}>
              <Sparkles size={13} />
              <span>Architectural Practice</span>
            </div>
            <h1 className={styles.title}>
              Crafting Enduring Spaces with <span className={styles.goldText}>Vision & Integrity</span>
            </h1>
            <p className={styles.subtitle}>
              Bahubali Builders & Visionary Interiors (BAVI) provides dedicated 
              residential architecture, turnkey construction, and interior design solutions.
            </p>
          </div>
        </section>

        {/* Philosophy Grid */}
        <section className={styles.philosophySection}>
          <div className={styles.container}>
            <div className={styles.philosophyGrid}>
              <div className={styles.philosophyCard}>
                <div className={styles.iconCircle}><Compass size={24} /></div>
                <h3 className={styles.cardTitle}>Structural Poetry</h3>
                <p className={styles.cardText}>
                  We harmonize raw materials — stone, glass, and sustainable timber — into functional living environments.
                </p>
              </div>

              <div className={styles.philosophyCard}>
                <div className={styles.iconCircle}><ShieldCheck size={24} /></div>
                <h3 className={styles.cardTitle}>Uncompromised Trust</h3>
                <p className={styles.cardText}>
                  Transparent contracts and direct milestone payment verification ensure clients possess full confidence.
                </p>
              </div>

              <div className={styles.philosophyCard}>
                <div className={styles.iconCircle}><Layers size={24} /></div>
                <h3 className={styles.cardTitle}>Artisanal Precision</h3>
                <p className={styles.cardText}>
                  From custom marble selection to false ceiling coves, our designers deliver clean European detailing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className={styles.teamSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.subBadge}>Design Leadership</span>
              <h2 className={styles.sectionTitle}>Our Master <span className={styles.goldText}>Architects</span></h2>
            </div>

            <div className={styles.teamGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {team.map((member) => (
                <div key={member.name} className={styles.teamCard} style={{ padding: '24px', background: 'var(--color-dark)', border: '1px solid var(--color-dark-border)', borderRadius: '12px' }}>
                  <div className={styles.teamBody}>
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <div className={styles.memberRole} style={{ color: 'var(--color-gold)', fontWeight: 600, margin: '4px 0' }}>{member.role}</div>
                    <p className={styles.memberSpecialty}>{member.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className={styles.timelineSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.subBadge}>Platform Standards</span>
              <h2 className={styles.sectionTitle}>The BAVI <span className={styles.goldText}>Commitment</span></h2>
            </div>

            <div className={styles.timelineGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {brandPillars.map((p, idx) => (
                <div key={p.title} className={styles.timelineCard}>
                  <div className={styles.timelineYear}>0{idx + 1}</div>
                  <h3 className={styles.timelineTitle}>{p.title}</h3>
                  <p className={styles.timelineDesc}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
