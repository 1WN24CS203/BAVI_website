'use client';

import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowUpRight, 
  Compass, 
  Sparkles,
  Instagram,
  Linkedin,
  Youtube
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
                <div className={styles.brandName}>BAVI</div>
                <div className={styles.brandTag}>Builders & Visionary Interiors</div>
              </div>
            </Link>

            <p className={styles.brandDesc}>
              A premier architectural practice and interior engineering firm crafting bespoke villas, 
              corporate headquarters, and heritage restorations across South India.
            </p>

            <div className={styles.securityBadge}>
              <ShieldCheck size={16} className={styles.shieldIcon} />
              <span>Council of Architecture Reg. CA/2012/58941</span>
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
              <li><span className={styles.staticLink}>Monolithic Luxury Villas</span></li>
              <li><span className={styles.staticLink}>Bespoke Penthouse Interiors</span></li>
              <li><span className={styles.staticLink}>LEED Commercial Head offices</span></li>
              <li><span className={styles.staticLink}>Heritage Estate Restoration</span></li>
              <li><span className={styles.staticLink}>3D Photorealistic BIM Modeling</span></li>
            </ul>
          </div>

          {/* Col 4: Studio Concierge */}
          <div className={styles.contactCol}>
            <h4 className={styles.colTitle}>Studio Concierge</h4>
            <div className={styles.contactItems}>
              <div className={styles.contactRow}>
                <MapPin size={16} className={styles.contactIcon} />
                <span>#42, 8th Main, Sadashivanagar, Bengaluru, KA 560080</span>
              </div>
              <div className={styles.contactRow}>
                <Phone size={16} className={styles.contactIcon} />
                <a href="tel:+919845012345" className={styles.contactLink}>+91 98450 12345</a>
              </div>
              <div className={styles.contactRow}>
                <Mail size={16} className={styles.contactIcon} />
                <a href="mailto:arun@bavi.in" className={styles.contactLink}>concierge@bavi.in</a>
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
            © {currentYear} BAVI — Bahubali Builders & Visionary Interiors Pvt Ltd. All rights reserved.
          </div>
          <div className={styles.legalLinks}>
            <span>Privacy Charter</span>
            <span>•</span>
            <span>Terms of Commission</span>
            <span>•</span>
            <span className={styles.astryxCredit}>Engineered with Asterisk (Astryx) System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
