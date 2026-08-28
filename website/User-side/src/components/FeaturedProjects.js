'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Filter } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { luxuryProjects } from '@/lib/projectsData';
import styles from './FeaturedProjects.module.css';

const categories = ['All Masterpieces', 'Residential', 'Commercial', 'Interior', 'Renovation'];

export default function FeaturedProjects() {
  const [activeTab, setActiveTab] = useState('All Masterpieces');

  const filtered = activeTab === 'All Masterpieces'
    ? luxuryProjects
    : luxuryProjects.filter(p => p.category === activeTab);

  return (
    <section className={styles.section} id="featured-projects">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.badge}>
              <Sparkles size={13} />
              <span>Curated Portfolio</span>
            </div>
            <h2 className={styles.title}>
              Signature <span className={styles.goldText}>Architectural</span> Works
            </h2>
            <p className={styles.subtitle}>
              A showcase of luxury residences, high-performance commercial spaces, and bespoke interiors.
            </p>
          </div>

          <Link href="/projects" className={styles.viewAllBtn} id="view-all-projects-btn">
            <span>View Full Portfolio ({luxuryProjects.length})</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className={styles.filterBar}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`${styles.filterBtn} ${activeTab === cat ? styles.filterBtnActive : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Responsive Projects Grid */}
        <div className={styles.grid}>
          {filtered.slice(0, 6).map((project, index) => (
            <ProjectCard key={project.id || index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
