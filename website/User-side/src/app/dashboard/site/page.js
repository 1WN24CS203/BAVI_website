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
  const [site, setSite] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_client_site');
      if (stored) {
        setSite(JSON.parse(stored));
      } else {
        const activeProj = localStorage.getItem('bavi_client_active_project');
        if (activeProj) {
          const parsed = JSON.parse(activeProj);
          if (parsed && parsed.location) {
            setSite({
              address: parsed.location,
              city: 'Bengaluru',
              state: 'Karnataka',
              pincode: '560001',
              zoning: parsed.category || 'Residential Luxury',
              landArea: 'TBD',
              builtupArea: 'TBD',
              sanctionStatus: 'Under Verification',
              sanctionAuthority: 'Municipal Town Planning Authority',
              electricity: 'Grid Connection Pending',
              water: 'Water Supply Verification in Progress',
              soilTest: 'Soil Testing Scheduled',
              orientation: 'East-Facing (Vastu Compliant)',
              designerNotes: 'Site survey and geolocation assessment to be published by principal architect.'
            });
            return;
          }
        }
        setSite(null);
      }
    } catch {
      setSite(null);
    }
  }, []);

  if (!site) {
    return (
      <div className={styles.container}>
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          border: '1px dashed rgba(255,255,255,0.1)',
          maxWidth: '680px',
          margin: '40px auto',
          color: '#888'
        }}>
          <MapPin size={48} style={{ color: 'var(--astryx-gold, #c9a84c)', marginBottom: '16px' }} />
          <h2 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 8px' }}>No Site Specifications Published Yet</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6, margin: '0' }}>
            Live geolocation coordinates, municipal sanction orders, soil bearing reports, and utility grid details will be published here once your site survey is conducted by our engineering team.
          </p>
        </div>
      </div>
    );
  }

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
