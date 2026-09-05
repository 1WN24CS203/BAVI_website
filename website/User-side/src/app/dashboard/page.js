'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Clock, 
  CreditCard, 
  CalendarDays, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  FileText, 
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  MapPin,
  FolderKanban,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './dashboard.module.css';

export default function DashboardOverviewPage() {
  const { profile } = useAuth();
  const [project, setProject] = useState(null);
  const [upcomingConsultation, setUpcomingConsultation] = useState(null);

  useEffect(() => {
    // Load real project data if present
    try {
      const activeProj = localStorage.getItem('bavi_client_active_project');
      if (activeProj) {
        setProject(JSON.parse(activeProj));
      } else {
        const allProjs = localStorage.getItem('bavi_projects');
        if (allProjs) {
          const parsed = JSON.parse(allProjs);
          if (parsed && parsed.length > 0) setProject(parsed[0]);
        }
      }
    } catch {}

    // Load real consultations if present
    try {
      const storedCons = localStorage.getItem('bavi_client_consultations');
      if (storedCons) {
        const parsedCons = JSON.parse(storedCons);
        if (parsedCons && parsedCons.length > 0) {
          setUpcomingConsultation(parsedCons[0]);
        }
      }
    } catch {}
  }, []);

  return (
    <div className={styles.container}>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <span className={styles.welcomeTag}>Project Portal</span>
          <h2 className={styles.welcomeTitle}>
            Hello, <span className={styles.goldText}>{profile?.full_name || 'Valued Client'}</span>
          </h2>
          <p className={styles.welcomeDesc}>
            {project ? (
              <>Your project <strong className={styles.projectName}>{project.title}</strong> is currently active.</>
            ) : (
              <>Welcome to BAVI Interiors. Start by defining your project vision or booking a consultation with our master architects.</>
            )}
          </p>
        </div>
        <div className={styles.quickActions}>
          <Link href="/dashboard/requirements" className={styles.primaryActionBtn}>
            <FileText size={16} />
            <span>My Requirements</span>
          </Link>
          <Link href="/dashboard/consultations" className={styles.secondaryActionBtn}>
            <CalendarDays size={16} />
            <span>Book Consultation</span>
          </Link>
        </div>
      </div>

      {project ? (
        <>
          {/* Metrics Row */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Milestones Overview</span>
                <Building2 className={styles.metricIcon} size={20} />
              </div>
              <div className={styles.progressRow}>
                <span className={styles.metricValue}>
                  {project.milestones ? `${project.milestones.filter(m => m.status === 'COMPLETED').length}/${project.milestones.length}` : 'Active'}
                </span>
                <span className={styles.badgeSuccess}>In Progress</span>
              </div>
              <div className={styles.metricFooter}>
                <span className={styles.footerMuted}>Dual approval enabled</span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Contract Budget</span>
                <CreditCard className={styles.metricIcon} size={20} />
              </div>
              <div className={styles.metricValue}>{project.budget || '₹ 0'}</div>
              <div className={styles.paidInfo}>
                <span className={styles.paidBadge}>Paid: {project.paid || '₹ 0'}</span>
              </div>
              <div className={styles.metricFooter}>
                <Link href="/dashboard/payments" className={styles.goldLink}>
                  <span>View Escrow Schedule</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Site Location</span>
                <MapPin className={styles.metricIcon} size={20} />
              </div>
              <div className={styles.siteLocation}>{project.location || 'Bengaluru'}</div>
              <div className={styles.approvalStatus}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>Dual Permission Tracking Active</span>
              </div>
              <div className={styles.metricFooter}>
                <Link href="/dashboard/project" className={styles.goldLink}>
                  <span>View Stages & Files</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Clean Fresh State when no project is yet assigned */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          margin: '24px 0'
        }}>
          <div className={styles.metricCard} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(201,168,76,0.15)', color: 'var(--astryx-gold)' }}>
                <FileText size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>1. Define Requirements</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6, margin: '0 0 16px' }}>
              Write your room needs, layout ideas, and aesthetic preferences in your own plain words.
            </p>
            <Link href="/dashboard/requirements" className={styles.goldLink}>
              <span>Enter My Vision</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className={styles.metricCard} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(201,168,76,0.15)', color: 'var(--astryx-gold)' }}>
                <CalendarDays size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>2. Site Consultation</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6, margin: '0 0 16px' }}>
              Schedule a virtual or on-site consultation to review plot parameters and architectural scope.
            </p>
            <Link href="/dashboard/consultations" className={styles.goldLink}>
              <span>Schedule Session</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className={styles.metricCard} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(201,168,76,0.15)', color: 'var(--astryx-gold)' }}>
                <FolderKanban size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>3. Dual Stage Approvals</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6, margin: '0 0 16px' }}>
              Every construction milestone requires mutual sign-off from both you and your builder.
            </p>
            <Link href="/dashboard/project" className={styles.goldLink}>
              <span>Learn More</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid: Consultations & Quick Actions */}
      <div className={styles.contentGrid}>
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Upcoming Consultation</h3>
            <Link href="/dashboard/consultations" className={styles.goldLink}>
              All Sessions
            </Link>
          </div>

          {upcomingConsultation ? (
            <div className={styles.consultationCard}>
              <div className={styles.consultationDate}>
                <span className={styles.dateDay}>{upcomingConsultation.date?.split('-')[2] || '15'}</span>
                <span className={styles.dateMonth}>{upcomingConsultation.date?.split('-')[1] || 'SEP'}</span>
              </div>
              <div className={styles.consultationDetails}>
                <div className={styles.consultationTime}>
                  <Clock size={13} />
                  <span>{upcomingConsultation.time}</span>
                </div>
                <div className={styles.consultationSubject}>
                  {upcomingConsultation.type}
                </div>
                <span className={upcomingConsultation.status === 'confirmed' ? styles.badgeSuccess : styles.badgeWarning}>
                  {upcomingConsultation.status}
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '30px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '8px',
              color: '#888'
            }}>
              <CalendarDays size={28} style={{ color: 'var(--astryx-gold)', marginBottom: '8px' }} />
              <p style={{ margin: '0 0 12px', fontSize: '0.85rem' }}>No upcoming consultation scheduled.</p>
              <Link href="/dashboard/consultations" className={styles.primaryActionBtn} style={{ display: 'inline-flex', fontSize: '0.8rem', padding: '6px 14px' }}>
                Book Consultation Now
              </Link>
            </div>
          )}
        </div>

        <div className={styles.sideCol}>
          <div className={styles.sectionCard}>
            <h3 className={styles.cardTitle}>Concierge Assistance</h3>
            <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.5, margin: '0 0 16px' }}>
              Need urgent assistance, revision feedback, or an on-site survey callback?
            </p>
            <Link href="/dashboard/consultations" className={styles.bookMoreBtn}>
              <PhoneCall size={16} />
              <span>Direct Concierge Connect</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
