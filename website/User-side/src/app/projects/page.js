'use client';

import { useState, useEffect } from 'react';
import { Filter, X, Sparkles, Search, SlidersHorizontal, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './projects.module.css';

const categories = ['All', 'Residential', 'Commercial', 'Interior', 'Renovation'];

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
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
            setProjects(data);
          } else {
            setProjects([]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const filtered = projects.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Page Header */}
        <section className={styles.pageHeader}>
          <div className={styles.container}>
            <div className={styles.headerBadge}>
              <Sparkles size={13} />
              <span>Architectural Portfolio</span>
            </div>

            <h1 className={styles.pageTitle}>
              Monuments of <span className={styles.goldText}>Distinction</span>
            </h1>

            <p className={styles.pageSubtitle}>
              Explore verified architectural portfolios, residential blueprints, and interior design showcases 
              curated directly by BAVI designers.
            </p>

            {/* Search & Filter Bar */}
            <div className={styles.searchFilterContainer}>
              <div className={styles.searchBar}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by project name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  id="project-search-input"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className={styles.clearSearchBtn}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className={styles.filterPills}>
                <SlidersHorizontal size={16} className={styles.filterIcon} />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
                    onClick={() => setActiveCategory(cat)}
                    id={`filter-${cat.toLowerCase()}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className={styles.gridSection}>
          <div className={styles.container}>
            <div className={styles.resultsInfo}>
              <span>Showing <strong>{filtered.length}</strong> signature projects</span>
              {activeCategory !== 'All' && (
                <button 
                  onClick={() => setActiveCategory('All')} 
                  className={styles.resetFilterBtn}
                >
                  Reset to All
                </button>
              )}
            </div>

            {filtered.length > 0 ? (
              <div className={styles.grid}>
                {filtered.map((project, index) => (
                  <ProjectCard key={project.id || `${project.title}-${index}`} project={project} index={index} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(201, 168, 76, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gold)',
                  margin: '0 auto 16px'
                }}>
                  <Clock size={32} />
                </div>
                <p className={styles.emptyTitle}>New Projects Uploading Soon</p>
                <p className={styles.emptySubtitle}>
                  Our designers are currently curating and uploading new architectural blueprints and interior design portfolios.
                </p>
                {(searchQuery || activeCategory !== 'All') && (
                  <button 
                    onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                    className={styles.emptyBtn}
                  >
                    Clear Search Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
