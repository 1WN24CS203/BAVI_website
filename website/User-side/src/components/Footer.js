'use client';

import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Instagram,
  Linkedin,
  Youtube,
  Sparkles
} from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="main-footer">
      <div className={styles.container}>
        {/* Main Footer Grid */}
        <div className={styles.grid}>
          {/* Col 1: Brand Info */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brandLogo}>
              <img src="/logo.png" alt="BAVI" className={styles.logoImg} />
              <div>
                <div className={styles.brandName}>BAVI INTERIORS</div>
                <div className={styles.brandTag}>Bahubali Builders & Visionary Interiors</div>
              </div>
            </Link>

            <p className={styles.brandDesc}>
              ! WE BOND YOUR SPACE WITH BAHUBALI GRACE !
            </p>

            <div className={styles.securityBadge}>
              <ShieldCheck size={16} className={styles.shieldIcon} />
              <span>Verified Architectural & Interior Design Studio</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Exploration</h4>
            <ul className={styles.linksList}>
              <li><Link href="/" className={styles.linkItem}>Home Studio</Link></li>
              <li><Link href="/projects" className={styles.linkItem}>Signature Portfolio</Link></li>
              <li><Link href="/about" className={styles.linkItem}>Our Architects & Legacy</Link></li>
              <li><Link href="/contact" className={styles.linkItem}>Schedule Consultation</Link></li>
              <li><Link href="/login" className={styles.linkItem}>Client Command Portal</Link></li>
            </ul>
          </div>

          {/* Col 3: Disciplines */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Disciplines</h4>
            <ul className={styles.linksList}>
              <li><span className={styles.staticLink}>Luxury Villa Construction</span></li>
              <li><span className={styles.staticLink}>Bespoke Penthouse Interiors</span></li>
              <li><span className={styles.staticLink}>Modular Kitchens & Wardrobes</span></li>
              <li><span className={styles.staticLink}>3D Architectural Blueprints</span></li>
              <li><span className={styles.staticLink}>Turnkey Interior Design</span></li>
            </ul>
          </div>

          {/* Col 4: Studio Concierge & Contact Details */}
          <div className={styles.contactCol}>
            <h4 className={styles.colTitle}>Contact & Studio Location</h4>
            <div className={styles.contactItems}>
              <div className={styles.contactRow}>
                <MapPin size={16} className={styles.contactIcon} />
                <span>GURU Bhavana Backside, Ambikanagar, BM Road, CHANNARAYAPATNA</span>
              </div>
              <div className={styles.contactRow}>
                <Phone size={16} className={styles.contactIcon} />
                <div>
                  <a href="tel:8277762487" className={styles.contactLink}>+91 8277762487</a> (Primary)
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Alt: 8660562173, 6362979162, 8660614227, 7022330698
                  </div>
                </div>
              </div>
              <div className={styles.contactRow}>
                <Mail size={16} className={styles.contactIcon} />
                <a href="mailto:Interiorsbavi@gmail.com" className={styles.contactLink}>Interiorsbavi@gmail.com</a>
              </div>
            </div>

            <div className={styles.socialRow}>
              <a href="#" className={styles.socialIconBtn} aria-label="Instagram"><Instagram size={17} /></a>
              <a href="#" className={styles.socialIconBtn} aria-label="LinkedIn"><Linkedin size={17} /></a>
              <a href="#" className={styles.socialIconBtn} aria-label="YouTube"><Youtube size={17} /></a>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer */}
        <div className={styles.bottomBar}>
          <div className={styles.copyrightText}>
            © {currentYear} BAVI — Bahubali Builders & Visionary Interiors. All rights reserved.
          </div>
          <div className={styles.legalLinks}>
            <span>Privacy Charter</span>
            <span>•</span>
            <span>Terms of Commission</span>
            <span>•</span>
            <span className={styles.astryxCredit}>Astryx Design Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
