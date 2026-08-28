'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ShieldCheck, 
  Award, 
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

const milestones = [
  { year: '2012', title: 'Studio Inception', desc: 'Founded by Principal Architect Arun Bahubali with a focus on bioclimatic residential estates.' },
  { year: '2016', title: 'Commercial Expansion', desc: 'Executed landmark tech campuses and corporate headquarters in Bengaluru and Mysuru.' },
  { year: '2020', title: 'Turnkey Escrow Pioneer', desc: 'Introduced bank-guaranteed milestone escrow and live 24/7 site cameras for luxury builds.' },
  { year: '2024', title: 'Astryx Digital Portal', desc: 'Launched full client digital ecosystem uniting real-time blueprints, materials tracking, and payments.' }
];

const team = [
  {
    name: 'Arun Bahubali',
    role: 'Principal Architect & Founder',
    edu: 'B.Arch (SPA Delhi), M.Arch (TU Delft)',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    specialty: 'Monolithic Cantilevers & Passive Bioclimatic Architecture'
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Head of Interior Architecture',
    edu: 'Domus Academy Milan',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    specialty: 'Italian Bookmatched Marble & Fluted Acoustic Millwork'
  },
  {
    name: 'Vikramaditya Sengupta',
    role: 'Chief Structural Engineer',
    edu: 'IIT Madras (Structural Engineering)',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    specialty: 'Seismic Grade-5 Structural Dynamics & Post-Tensioned Slabs'
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
              <span>Architectural Pedigree</span>
            </div>
            <h1 className={styles.title}>
              Crafting Enduring Spaces with <span className={styles.goldText}>Vision & Integrity</span>
            </h1>
            <p className={styles.subtitle}>
              For over a decade, Bahubali Builders & Visionary Interiors (BAVI) has pioneered 
              luxury residential architecture, commercial landmark engineering, and bespoke interior design.
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
                  We believe architecture should harmonize raw materials — exposed basalt stone, 
                  brushed brass, and sustainable timber — into functional works of art.
                </p>
              </div>

              <div className={styles.philosophyCard}>
                <div className={styles.iconCircle}><ShieldCheck size={24} /></div>
                <h3 className={styles.cardTitle}>Uncompromised Trust</h3>
                <p className={styles.cardText}>
                  Transparent contracts, milestone-based bank escrow clearing, and live 24/7 IoT 
                  webcam feeds ensure clients possess full confidence at every build stage.
                </p>
              </div>

              <div className={styles.philosophyCard}>
                <div className={styles.iconCircle}><Layers size={24} /></div>
                <h3 className={styles.cardTitle}>Artisanal Precision</h3>
                <p className={styles.cardText}>
                  From custom Italian marble slab bookmatching to integrated acoustic smart panels, 
                  our master craftsmen deliver zero-tolerance European detailing.
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
              <h2 className={styles.sectionTitle}>The Visionary <span className={styles.goldText}>Architects</span></h2>
            </div>

            <div className={styles.teamGrid}>
              {team.map((member) => (
                <div key={member.name} className={styles.teamCard}>
                  <div className={styles.teamImgWrapper}>
                    <img src={member.image} alt={member.name} className={styles.teamImg} />
                    <div className={styles.teamImgOverlay} />
                  </div>
                  <div className={styles.teamBody}>
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <div className={styles.memberRole}>{member.role}</div>
                    <div className={styles.memberEdu}>{member.edu}</div>
                    <p className={styles.memberSpecialty}>{member.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className={styles.timelineSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.subBadge}>Milestones</span>
              <h2 className={styles.sectionTitle}>A Decade of <span className={styles.goldText}>Landmarks</span></h2>
            </div>

            <div className={styles.timelineGrid}>
              {milestones.map((m) => (
                <div key={m.year} className={styles.timelineCard}>
                  <div className={styles.timelineYear}>{m.year}</div>
                  <h3 className={styles.timelineTitle}>{m.title}</h3>
                  <p className={styles.timelineDesc}>{m.desc}</p>
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
