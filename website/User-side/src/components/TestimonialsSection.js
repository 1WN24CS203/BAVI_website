'use client';

import { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './TestimonialsSection.module.css';

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    role: 'Managing Director, Sharma Tech Holdings',
    project: 'Sadashivanagar Villa (12,500 sq.ft)',
    quote: 'BAVI executed our luxury villa from bare earth to turnkey handover flawlessly. The live site cameras and milestone escrow system gave us total peace of mind. Arun and his architectural team are unmatched.',
    rating: 5,
    city: 'Bengaluru'
  },
  {
    id: 2,
    name: 'Pooja Reddy',
    role: 'Co-Founder & Creative Director',
    project: 'Whitefield Penthouse (6,200 sq.ft)',
    quote: 'The interior craftsmanship is sensational. The fluted walnut panels, Italian bookmatched marble, and concealed cove lighting transformed our penthouse into a private sanctuary. Truly world-class.',
    rating: 5,
    city: 'Bengaluru'
  },
  {
    id: 3,
    name: 'Vikramaditya Rao',
    role: 'Heritage Property Investor',
    project: 'Jayalakshmipuram Bungalow Restoration',
    quote: 'Restoring a 70-year-old family estate is fraught with structural risks, but BAVI treated our heritage with immense reverence while modernizing the electrical and acoustic infrastructure seamlessly.',
    rating: 5,
    city: 'Mysuru'
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className={styles.section} id="testimonials">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={13} />
            <span>Client Endorsements</span>
          </div>
          <h2 className={styles.title}>
            Trusted by Leaders & <span className={styles.goldText}>Visionaries</span>
          </h2>
          <p className={styles.subtitle}>
            Read firsthand accounts of how we deliver architectural distinction and luxury interior perfection.
          </p>
        </div>

        {/* Carousel / Grid View */}
        <div className={styles.testimonialsGrid}>
          {testimonials.map((item, idx) => (
            <div key={item.id} className={styles.testimonialCard}>
              <div className={styles.cardHeader}>
                <div className={styles.starsRow}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={15} className={styles.starIcon} fill="currentColor" />
                  ))}
                </div>
                <Quote size={24} className={styles.quoteIcon} />
              </div>

              <p className={styles.quoteText}>"{item.quote}"</p>

              <div className={styles.cardFooter}>
                <div className={styles.avatarCircle}>
                  {item.name.charAt(0)}
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.authorName}>{item.name}</span>
                    <ShieldCheck size={14} className={styles.verifiedIcon} title="Verified Client" />
                  </div>
                  <div className={styles.authorRole}>{item.role}</div>
                  <div className={styles.projectTag}>{item.project} • {item.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
