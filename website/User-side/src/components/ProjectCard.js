'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Calendar, Layers, Sparkles } from 'lucide-react';
import styles from './ProjectCard.module.css';

const fallbackImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
];

export default function ProjectCard({ project, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(
    project?.image && project?.image.startsWith('http') 
      ? project.image 
      : fallbackImages[index % fallbackImages.length]
  );

  const {
    id = `project-${index}`,
    title = 'Modern Architectural Residence',
    category = 'Residential',
    location = 'Sadashivanagar, Bengaluru',
    year = '2024',
    area = '8,500 sq.ft',
    description = 'Contemporary architectural masterpiece with sustainable materials and luxury interior craftsmanship.'
  } = project || {};

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`project-card-${index}`}
    >
      {/* Visual Canvas Area */}
      <div className={styles.imageContainer}>
        <img
          src={imgSrc}
          alt={title}
          className={`${styles.image} ${isHovered ? styles.imageHovered : ''}`}
          onError={() => setImgSrc(fallbackImages[index % fallbackImages.length])}
          loading="lazy"
        />

        <div className={styles.overlayGradient} />

        {/* Category Pill */}
        <div className={styles.categoryBadge}>
          <Sparkles size={12} className={styles.sparkleIcon} />
          <span>{category}</span>
        </div>

        {/* Floating Action Button */}
        <Link 
          href="/projects" 
          className={`${styles.actionCircle} ${isHovered ? styles.actionCircleActive : ''}`}
          aria-label={`View details for ${title}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* Card Content & Metadata */}
      <div className={styles.cardBody}>
        <div className={styles.locationRow}>
          <MapPin size={13} className={styles.metaIcon} />
          <span>{location}</span>
        </div>

        <h3 className={styles.title}>{title}</h3>

        <p className={styles.descriptionText}>
          {description}
        </p>

        <div className={styles.metaFooter}>
          <div className={styles.metaChip}>
            <Calendar size={13} className={styles.metaIcon} />
            <span>{year}</span>
          </div>

          <div className={styles.metaChip}>
            <Layers size={13} className={styles.metaIcon} />
            <span>{area}</span>
          </div>

          <span className={styles.verifiedTag}>Turnkey Delivery</span>
        </div>
      </div>

      {/* Bottom Astryx Gold Border Line */}
      <div className={`${styles.bottomAuraLine} ${isHovered ? styles.bottomAuraActive : ''}`} />
    </div>
  );
}
