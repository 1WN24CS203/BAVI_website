'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Clock, FolderKanban } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './FeaturedProjects.module.css';

const categories = ['All', 'Residential', 'Commercial', 'Interior', 'Renovation'];

export default function FeaturedProjects() {
  const [activeTab, setActiveTab] = useState('All');
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase
        .from('highlighted_designs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .then(({ data, error }) => {
          if (data && data.length > 0) {
            setDesigns(data);
          } else {
            setDesigns([]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const filtered = activeTab === 'All'
    ? designs
    : designs.filter(p => p.category?.toLowerCase() === activeTab.toLowerCase());

  return (
    <section className={styles.section} id="featured-projects">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.badge}>
              <Sparkles size={13} />
              <span>Architectural Showcase</span>
            </div>
            <h2 className={styles.title}>
              Signature <span className={styles.goldText}>Architectural</span> Works
            </h2>
            <p className={styles.subtitle}>
              Verified architectural projects and interior showcases curated directly by our designers.
            </p>
          </div>

          <Link href="/projects" className={styles.viewAllBtn} id="view-all-projects-btn">
            <span>View Full Gallery</span>
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

        {/* Responsive Projects Grid / Empty State */}
        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.slice(0, 6).map((project, index) => (
              <ProjectCard key={project.id || index} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--color-dark)',
            border: '1px dashed rgba(201, 168, 76, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '60px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            marginTop: '20px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(201, 168, 76, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold)'
            }}>
              <Clock size={28} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#f8f8f8', marginBottom: '8px' }}>
                New Projects Uploading Soon
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '440px', margin: '0 auto', lineHeight: '1.6' }}>
                Our architects are updating our latest completed projects and structural blueprints. Check back soon or request a custom consultation.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
