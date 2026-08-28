'use client';

import { 
  MapPin, 
  CheckCircle2, 
  Zap, 
  Droplets, 
  Ruler, 
  Compass, 
  Building2, 
  ShieldCheck, 
  Clock,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './site.module.css';

export default function SiteDetailsPage() {
  const { profile } = useAuth();
  const isPooja = profile?.email?.includes('pooja');

  const site = isPooja ? {
    address: 'Villa 18, Palm Meadows, Ramagondanahalli, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    zoning: 'Gated Villa Enclave (Residential Luxury)',
    landArea: '3,800 sq.ft',
    builtupArea: '4,600 sq.ft (Duplex Penthouse)',
    sanctionStatus: 'Approved & Active',
    sanctionAuthority: 'BPA & Gated Society Association Plan Sanction',
    electricity: 'BESCOM 12KW 3-Phase + 100% DG Backup',
    water: 'Dedicated RO treated softening unit + BWSSB line',
    soilTest: 'Bedrock compaction verified',
    orientation: 'North-East Facing (100% Vastu Compliant)',
    designerNotes: 'Exclusive penthouse layout with 12ft high ceilings. Acoustic decoupling applied on common party walls.'
  } : {
    address: 'Plot #42, 12th Main Road, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    zoning: 'Residential (R1 - Luxury Independent Villa)',
    landArea: '4,200 sq.ft (60 x 70 ft corner plot)',
    builtupArea: '6,800 sq.ft (G+2 + Rooftop Pool Terrace)',
    sanctionStatus: 'Sanction Order BBMP/LP/2026/0891 Approved',
    sanctionAuthority: 'BBMP East Zone Town Planning Sanction',
    electricity: 'BESCOM 18KW 3-Phase Commercial/Residential + Solar Grid Ready',
    water: 'BWSSB Dual-Line Supply + 600ft Hydro-filtered Borewell',
    soilTest: 'Hard Red Clay soil with high load bearing capacity (240 kN/m²)',
    orientation: 'East-Facing Main Foyer (Vastu Gold Standard)',
    designerNotes: '40-foot approach road on both east and north sides. Retaining boundary walls reinforced with waterproofing slurry.'
  };

  return (
    <div className={styles.container}>
      {/* Site Header */}
      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div>
            <span className={styles.badgeGold}>Plot & Architectural Geolocation</span>
            <h2 className={styles.siteAddress}>{site.address}</h2>
            <p className={styles.siteCity}>{site.city}, {site.state} — {site.pincode}</p>
          </div>
          <div className={styles.approvedPill}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>Sanction Verified</span>
          </div>
        </div>

        {/* Spatial Dimension Metrics */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <div className={styles.metricIconWrap}><Ruler size={18} /></div>
            <div>
              <span className={styles.metricLabel}>Plot Land Area</span>
              <span className={styles.metricValue}>{site.landArea}</span>
            </div>
          </div>

          <div className={styles.metricBox}>
            <div className={styles.metricIconWrap}><Building2 size={18} /></div>
            <div>
              <span className={styles.metricLabel}>Total Built-Up Area</span>
              <span className={styles.metricValue}>{site.builtupArea}</span>
            </div>
          </div>

          <div className={styles.metricBox}>
            <div className={styles.metricIconWrap}><Compass size={18} /></div>
            <div>
              <span className={styles.metricLabel}>Vastu Orientation</span>
              <span className={styles.metricValue}>{site.orientation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Utilities & Approvals */}
      <div className={styles.detailsGrid}>
        {/* Sanctions & Permissions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ShieldCheck size={20} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>Municipal Approvals & Permissions</h3>
          </div>

          <div className={styles.checklist}>
            <div className={styles.checkItem}>
              <CheckCircle2 size={18} className={styles.checkDone} />
              <div className={styles.checkContent}>
                <strong>Municipal Building Sanction Order</strong>
                <span>{site.sanctionAuthority}</span>
              </div>
            </div>

            <div className={styles.checkItem}>
              <CheckCircle2 size={18} className={styles.checkDone} />
              <div className={styles.checkContent}>
                <strong>Structural Stability & Soil Assessment</strong>
                <span>{site.soilTest}</span>
              </div>
            </div>

            <div className={styles.checkItem}>
              <CheckCircle2 size={18} className={styles.checkDone} />
              <div className={styles.checkContent}>
                <strong>Zoning & Land Use Category</strong>
                <span>{site.zoning}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Utilities & Infrastructure */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Zap size={20} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>Infrastructure & Site Utilities</h3>
          </div>

          <div className={styles.utilitiesList}>
            <div className={styles.utilityItem}>
              <div className={styles.utilityIconWrap}><Zap size={18} /></div>
              <div className={styles.utilityText}>
                <span className={styles.utilityLabel}>Electricity Power Connection</span>
                <span className={styles.utilityVal}>{site.electricity}</span>
              </div>
            </div>

            <div className={styles.utilityItem}>
              <div className={styles.utilityIconWrap}><Droplets size={18} /></div>
              <div className={styles.utilityText}>
                <span className={styles.utilityLabel}>Water Supply & Filtration</span>
                <span className={styles.utilityVal}>{site.water}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Designer Site Inspection Notes */}
      <div className={styles.notesCard}>
        <div className={styles.notesHeader}>
          <FileText size={18} className={styles.notesIcon} />
          <h4 className={styles.notesTitle}>Architect & Designer Site Notes</h4>
        </div>
        <p className={styles.notesBody}>{site.designerNotes}</p>
      </div>
    </div>
  );
}
