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
  Play
} from 'lucide-react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  const heroShowcases = [
    {
      title: 'Skyline Villa Retreat',
      category: 'Residential Estate',
      area: '12,500 sq.ft',
      location: 'Bengaluru',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      stat: 'Turnkey Luxury'
    },
    {
      title: 'The Celestial Penthouse',
      category: 'Luxury Interior',
      area: '6,200 sq.ft',
      location: 'Whitefield',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
      stat: 'Italian Marble Finish'
    },
    {
      title: 'Zenith Corporate HQ',
      category: 'Commercial Architecture',
      area: '45,000 sq.ft',
      location: 'Hebbal',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
      stat: 'LEED Certified'
    }
  ];

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

      // Connect nearby particles with delicate champagne lines
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
            {/* Astryx Status Badge */}
            <div className={styles.statusBadge}>
              <span className={styles.badgePulseRing} />
              <Sparkles size={14} className={styles.badgeIcon} />
              <span>Asterisk Design System • Verified Architectural Practice</span>
            </div>

            {/* Main Headline */}
            <h1 className={styles.headline}>
              Visionary Architecture.{' '}
              <span className={styles.goldGradientText}>Bespoke</span> Interiors.
            </h1>

            <p className={styles.subtext}>
              Transforming ambitious structural blueprints into timeless living environments. 
              We blend engineering precision, sustainable stone craftsmanship, and ultra-luxury 
              finishes for discerning homeowners and corporate leaders.
            </p>

            {/* Action Buttons */}
            <div className={styles.buttonGroup}>
              <Link href="/contact" className={styles.primaryCta} id="hero-primary-cta">
                <span>Start Your Commission</span>
                <ArrowRight size={18} />
              </Link>

              <Link href="/projects" className={styles.secondaryCta} id="hero-secondary-cta">
                <Compass size={17} />
                <span>Explore Masterpieces</span>
              </Link>
            </div>

            {/* Live Trust Metrics */}
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>150+</div>
                <div className={styles.statLabel}>Villas & Landmarks</div>
              </div>

              <div className={styles.statSeparator} />

              <div className={styles.statItem}>
                <div className={styles.statValue}>₹250 Cr+</div>
                <div className={styles.statLabel}>Portfolio Managed</div>
              </div>

              <div className={styles.statSeparator} />

              <div className={styles.statItem}>
                <div className={styles.statValue}>100%</div>
                <div className={styles.statLabel}>Escrow Guaranteed</div>
              </div>
            </div>
          </div>

          {/* Right Column: Astryx 3D Interactive Showcase Card */}
          <div className={styles.showcaseCol}>
            <div className={styles.showcaseCard}>
              <div 
                className={styles.showcaseImage}
                style={{ backgroundImage: `url(${heroShowcases[activeTab].image})` }}
              >
                <div className={styles.imageOverlay} />
                <div className={styles.topPill}>
                  <ShieldCheck size={14} />
                  <span>{heroShowcases[activeTab].stat}</span>
                </div>

                <div className={styles.bottomCardInfo}>
                  <span className={styles.categoryPill}>{heroShowcases[activeTab].category}</span>
                  <h3 className={styles.showcaseTitle}>{heroShowcases[activeTab].title}</h3>
                  <div className={styles.showcaseMeta}>
                    <span>{heroShowcases[activeTab].area}</span>
                    <span>•</span>
                    <span>{heroShowcases[activeTab].location}</span>
                  </div>
                </div>
              </div>

              {/* Showcase Tab Switcher */}
              <div className={styles.tabsRow}>
                {heroShowcases.map((item, idx) => (
                  <button
                    key={item.title}
                    onClick={() => setActiveTab(idx)}
                    className={`${styles.tabBtn} ${activeTab === idx ? styles.tabBtnActive : ''}`}
                    aria-label={`View ${item.title}`}
                  >
                    <span className={styles.tabNum}>0{idx + 1}</span>
                    <span className={styles.tabLabel}>{item.category.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
