'use client';

import { useState } from 'react';
import { Filter, X, Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard from '@/components/ProjectCard';
import { luxuryProjects } from '@/lib/projectsData';
import styles from './projects.module.css';

const categories = ['All', 'Residential', 'Commercial', 'Interior', 'Renovation'];

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = luxuryProjects.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
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
              <span>Astryx Architectural Portfolio</span>
            </div>

            <h1 className={styles.pageTitle}>
              Monuments of <span className={styles.goldText}>Distinction</span>
            </h1>

            <p className={styles.pageSubtitle}>
              Explore our curated portfolio of ultra-luxury villas, LEED platinum commercial hubs, 
              and bespoke penthouse interiors executed across South India.
            </p>

            {/* Astryx Search & Filter Bar */}
            <div className={styles.searchFilterContainer}>
              <div className={styles.searchBar}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by project name, location (e.g. Bengaluru, Whitefield)..."
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
                <p className={styles.emptyTitle}>No matching architectural works found</p>
                <p className={styles.emptySubtitle}>Try adjusting your search criteria or category filters.</p>
                <button 
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                  className={styles.emptyBtn}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
