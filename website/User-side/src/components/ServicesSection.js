'use client';

import { 
  Compass, 
  Home, 
  Building2, 
  Paintbrush, 
  Hammer, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import styles from './ServicesSection.module.css';

const services = [
  {
    icon: Compass,
    title: 'Architectural Design',
    badge: 'Core Specialty',
    description: 'Bespoke residential villas, commercial landmarks, and institutional campuses engineered with 3D BIM visualization and solar passive design.',
    features: ['Structural Blueprints', '3D Photorealistic BIM', 'Vastu & Climate Modeling']
  },
  {
    icon: Paintbrush,
    title: 'Luxury Interior Architecture',
    badge: 'Artisanal Finish',
    description: 'Curated living spaces with Italian marble detailing, acoustic brass work, concealed cove lighting, and custom European millwork.',
    features: ['Custom Millwork', 'Ambient Lighting Plans', 'Imported Material Sourcing']
  },
  {
    icon: Home,
    title: 'Turnkey Villa Construction',
    badge: 'Full Oversight',
    description: 'End-to-end site development from foundation excavation to turnkey handover with live IoT webcam site tracking and escrow milestones.',
    features: ['Live Site Feeds', 'Escrow Milestone Clearing', 'Zero-Defect Quality Checks']
  },
  {
    icon: Hammer,
    title: 'Heritage Renovation & Restoration',
    badge: 'Restoration',
    description: 'Modernizing classical bungalows and commercial hubs while meticulously preserving heritage stone facades and historic woodwork.',
    features: ['Structural Retrofitting', 'Historic Facade Care', 'Modern MEP Integration']
  }
];

export default function ServicesSection() {
  return (
    <section className={styles.section} id="services">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <Sparkles size={13} className={styles.badgeIcon} />
            <span>Master Crafts & Disciplines</span>
          </div>

          <h2 className={styles.title}>
            Architectural Solutions Built for{' '}
            <span className={styles.goldText}>Generations</span>
          </h2>

          <p className={styles.subtitle}>
            From initial conceptual sketches to white-glove site delivery, we unite structural engineering 
            with refined interior artistry under a single guaranteed contract.
          </p>
        </div>

        {/* Services Responsive Grid */}
        <div className={styles.grid}>
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={service.title} 
                className={styles.card}
                id={`service-card-${index}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconCircle}>
                    <Icon size={24} className={styles.icon} />
                  </div>
                  <span className={styles.cardBadge}>{service.badge}</span>
                </div>

                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>

                <ul className={styles.featureList}>
                  {service.features.map((feat) => (
                    <li key={feat} className={styles.featureItem}>
                      <ShieldCheck size={14} className={styles.checkIcon} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/contact" className={styles.cardCta}>
                  <span>Inquire Discipline</span>
                  <ArrowRight size={14} className={styles.cardArrow} />
                </Link>

                <div className={styles.cardHoverGlow} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
