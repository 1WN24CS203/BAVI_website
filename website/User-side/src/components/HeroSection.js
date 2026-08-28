'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Award, 
  Layers, 
  Compass,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const canvasRef = useRef(null);
  const [designerDesigns, setDesignerDesigns] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Fetch designer uploaded highlighted designs from Supabase if active
    if (isSupabaseConfigured()) {
      supabase
        .from('highlighted_designs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .then(({ data, error }) => {
          if (data && data.length > 0) {
            setDesignerDesigns(data);
          }
        });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let particles = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    class AstryxParticle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.2 + 0.6;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.6 + 0.15;
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
        this.pulse = Math.random() * Math.PI * 2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += this.pulseSpeed;
        this.currentOpacity = this.opacity + Math.sin(this.pulse) * 0.2;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 192, 123, ${Math.max(0.05, this.currentOpacity)})`;
        ctx.fill();
      }
    }

    const particleCount = Math.min(window.innerWidth > 768 ? 60 : 30, 80);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new AstryxParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(229, 192, 123, ${0.06 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const hasDesigns = designerDesigns.length > 0;
  const currentDesign = hasDesigns ? designerDesigns[activeTab % designerDesigns.length] : null;

  return (
    <section className={styles.heroSection} id="hero-section">
      {/* Particle Background */}
      <canvas ref={canvasRef} className={styles.canvasBackground} />

      {/* Atmospheric Radial Gradients */}
      <div className={styles.glowOrbTop} />
      <div className={styles.glowOrbRight} />

      <div className={styles.container}>
        <div className={styles.heroGrid}>
          {/* Left Column: Hero Content */}
          <div className={styles.contentCol}>
            {/* Status Badge */}
            <div className={styles.statusBadge}>
              <span className={styles.badgePulseRing} />
              <Sparkles size={14} className={styles.badgeIcon} />
              <span>Architectural & Interior Design Practice</span>
            </div>

            {/* Main Headline */}
            <h1 className={styles.headline}>
              Visionary Architecture.{' '}
              <span className={styles.goldGradientText}>Bespoke</span> Interiors.
            </h1>

            <p className={styles.subtext}>
              Transforming structural blueprints into living environments. 
              We blend engineering precision, sustainable stone craftsmanship, and custom 
              finishes for discerning homeowners and commercial spaces.
            </p>

            {/* Action Buttons */}
            <div className={styles.buttonGroup}>
              <Link href="/contact" className={styles.primaryCta} id="hero-primary-cta">
                <span>Start Your Consultation</span>
                <ArrowRight size={18} />
              </Link>

              <Link href="/projects" className={styles.secondaryCta} id="hero-secondary-cta">
                <Compass size={17} />
                <span>Browse Portfolio</span>
              </Link>
            </div>

            {/* Authentic Brand Pillars */}
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>Architectural</div>
                <div className={styles.statLabel}>Excellence & Precision</div>
              </div>

              <div className={styles.statSeparator} />

              <div className={styles.statItem}>
                <div className={styles.statValue}>Transparent</div>
                <div className={styles.statLabel}>Milestone Tracking</div>
              </div>

              <div className={styles.statSeparator} />

              <div className={styles.statItem}>
                <div className={styles.statValue}>Direct Connect</div>
                <div className={styles.statLabel}>Verified Architect Portal</div>
              </div>
            </div>
          </div>

          {/* Right Column: Showcase Card */}
          <div className={styles.showcaseCol}>
            <div className={styles.showcaseCard}>
              {hasDesigns && currentDesign ? (
                <>
                  <div 
                    className={styles.showcaseImage}
                    style={{ backgroundImage: `url(${currentDesign.image_url})` }}
                  >
                    <div className={styles.imageOverlay} />
                    <div className={styles.topPill}>
                      <ShieldCheck size={14} />
                      <span>{currentDesign.category}</span>
                    </div>

                    <div className={styles.bottomCardInfo}>
                      <span className={styles.categoryPill}>{currentDesign.category}</span>
                      <h3 className={styles.showcaseTitle}>{currentDesign.title}</h3>
                      <div className={styles.showcaseMeta}>
                        <span>{currentDesign.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.tabsRow}>
                    {designerDesigns.map((item, idx) => (
                      <button
                        key={item.id || idx}
                        onClick={() => setActiveTab(idx)}
                        className={`${styles.tabBtn} ${activeTab === idx ? styles.tabBtnActive : ''}`}
                      >
                        <span className={styles.tabNum}>0{idx + 1}</span>
                        <span className={styles.tabLabel}>{item.category}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '50px 30px',
                  textAlign: 'center',
                  background: '#141414',
                  borderRadius: '16px',
                  border: '1px dashed rgba(201, 168, 76, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(201, 168, 76, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-gold)'
                  }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#f8f8f8', marginBottom: '6px' }}>
                      Designs Uploading Soon
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '320px', margin: '0 auto', lineHeight: '1.5' }}>
                      Our architects are curating verified blueprints and interior concepts. Check back soon or book a direct consultation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
