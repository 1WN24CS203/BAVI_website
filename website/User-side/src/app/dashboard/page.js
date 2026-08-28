'use client';

import { useState } from 'react';
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
  MapPin
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './dashboard.module.css';

export default function DashboardOverviewPage() {
  const { profile } = useAuth();
  
  // Dynamic mock data tied to selected demo profile
  const isPooja = profile?.email?.includes('pooja');
  
  const project = isPooja ? {
    title: 'Whitefield Penthouse Renovation',
    category: 'Interior Design',
    location: 'Palm Meadows, Whitefield, Bengaluru',
    status: 'In Progress',
    budget: '₹62,00,000',
    paid: '₹31,00,000',
    progress: 50,
    nextMilestone: 'Custom Teak Carpentry & Lighting Installation',
    nextDue: '15 Aug 2026',
    designer: 'Ananya Hegde'
  } : {
    title: 'The Grand Serenity Villa',
    category: 'Luxury Residential Construction',
    location: 'Indiranagar, Bengaluru',
    status: 'In Progress',
    budget: '₹1,85,00,000',
    paid: '₹74,00,000',
    progress: 65,
    nextMilestone: 'Brick Masonry, Plumbing & Electrical Conduits',
    nextDue: '31 Jul 2026',
    designer: 'Arun Bahubali'
  };

  const upcomingConsultation = isPooja ? {
    date: '08 Sep 2026',
    time: '03:30 PM',
    type: 'Site Measurement & Closet Review',
    status: 'Pending Confirmation'
  } : {
    date: '05 Sep 2026',
    time: '11:00 AM',
    type: 'Italian Marble & False Ceiling Review',
    status: 'Confirmed'
  };

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
            Your project <strong className={styles.projectName}>{project.title}</strong> is currently on track at <span className={styles.goldProgress}>{project.progress}%</span> completion.
          </p>
        </div>
        <div className={styles.quickActions}>
          <Link href="/dashboard/consultations" className={styles.primaryActionBtn}>
            <CalendarDays size={16} />
            <span>Book Consultation</span>
          </Link>
          <Link href="/dashboard/payments" className={styles.secondaryActionBtn}>
            <CreditCard size={16} />
            <span>View Payments</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        {/* Project Progress Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Overall Progress</span>
            <Building2 className={styles.metricIcon} size={20} />
          </div>
          <div className={styles.progressRow}>
            <span className={styles.metricValue}>{project.progress}%</span>
            <span className={styles.badgeSuccess}>On Schedule</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${project.progress}%` }} 
            />
          </div>
          <div className={styles.metricFooter}>
            <span className={styles.footerMuted}>Estimated completion: Nov 2026</span>
          </div>
        </div>

        {/* Financial Overview Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Project Investment</span>
            <CreditCard className={styles.metricIcon} size={20} />
          </div>
          <div className={styles.metricValue}>{project.budget}</div>
          <div className={styles.paidInfo}>
            <span className={styles.paidBadge}>Paid: {project.paid}</span>
            <span className={styles.stripeNote}>Stripe Test Mode Active</span>
          </div>
          <div className={styles.metricFooter}>
            <Link href="/dashboard/payments" className={styles.goldLink}>
              <span>Manage Milestone Payments</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Site Details Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Site & Sanction</span>
            <MapPin className={styles.metricIcon} size={20} />
          </div>
          <div className={styles.siteLocation}>{project.location}</div>
          <div className={styles.approvalStatus}>
            <CheckCircle2 size={16} color="var(--color-success)" />
            <span>BBMP Municipal Approval Approved</span>
          </div>
          <div className={styles.metricFooter}>
            <Link href="/dashboard/site" className={styles.goldLink}>
              <span>View Site Specs & Blueprints</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Milestone & Consultation */}
      <div className={styles.contentGrid}>
        {/* Active Milestone Card */}
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Current Active Milestone</h3>
              <p className={styles.cardSub}>Stage #3 of 5 in progress</p>
            </div>
            <Link href="/dashboard/project" className={styles.outlineBtn}>
              Full Timeline
            </Link>
          </div>

          <div className={styles.milestoneBox}>
            <div className={styles.milestoneHeader}>
              <span className={styles.milestoneOrder}>Milestone 03</span>
              <span className={styles.badgeWarning}>In Progress</span>
            </div>
            <h4 className={styles.milestoneTitle}>{project.nextMilestone}</h4>
            <p className={styles.milestoneDesc}>
              Double-coat clay brick masonry, concealed Finolex flame-retardant electrical conduits, and Astral SDR-11 plumbing piping across all floors.
            </p>
            <div className={styles.milestoneMeta}>
              <div className={styles.metaItem}>
                <Clock size={15} />
                <span>Target Due: {project.nextDue}</span>
              </div>
              <div className={styles.metaItem}>
                <ShieldAlert size={15} color="var(--color-gold)" />
                <span>Quality Inspection Scheduled</span>
              </div>
            </div>
          </div>

          <div className={styles.timelinePreview}>
            <div className={styles.timelineItemDone}>
              <CheckCircle2 size={18} className={styles.timelineDoneIcon} />
              <div className={styles.timelineText}>
                <strong>Stage 1: Architectural Blueprint & Sanction</strong>
                <span>Completed & Verified</span>
              </div>
            </div>
            <div className={styles.timelineItemDone}>
              <CheckCircle2 size={18} className={styles.timelineDoneIcon} />
              <div className={styles.timelineText}>
                <strong>Stage 2: Foundation & Plinth Casting</strong>
                <span>Completed & Paid</span>
              </div>
            </div>
            <div className={styles.timelineItemActive}>
              <div className={styles.timelineActiveDot} />
              <div className={styles.timelineText}>
                <strong>Stage 3: Brick Masonry & Concealed Services</strong>
                <span>Currently under execution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation & Quick Contact */}
        <div className={styles.sideCol}>
          {/* Upcoming Consultation */}
          <div className={styles.sectionCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Next Consultation</h3>
              <Link href="/dashboard/consultations" className={styles.goldLink}>
                All Meetings
              </Link>
            </div>

            <div className={styles.consultationCard}>
              <div className={styles.consultationDate}>
                <span className={styles.dateDay}>{upcomingConsultation.date.split(' ')[0]}</span>
                <span className={styles.dateMonth}>{upcomingConsultation.date.split(' ')[1]}</span>
              </div>
              <div className={styles.consultationDetails}>
                <div className={styles.consultationTime}>
                  <Clock size={13} />
                  <span>{upcomingConsultation.time}</span>
                </div>
                <div className={styles.consultationSubject}>
                  {upcomingConsultation.type}
                </div>
                <span className={upcomingConsultation.status === 'Confirmed' ? styles.badgeSuccess : styles.badgeWarning}>
                  {upcomingConsultation.status}
                </span>
              </div>
            </div>

            <Link href="/dashboard/consultations" className={styles.bookMoreBtn}>
              <CalendarDays size={16} />
              <span>Schedule New Site Visit / Review</span>
            </Link>
          </div>

          {/* Quick Support & Documentation */}
          <div className={styles.sectionCard}>
            <h3 className={styles.cardTitle}>Quick Documents</h3>
            <div className={styles.docsList}>
              <div className={styles.docItem}>
                <FileText size={18} className={styles.docIcon} />
                <div className={styles.docInfo}>
                  <div className={styles.docName}>Sanctioned_Floor_Plan_V3.dwg</div>
                  <div className={styles.docMeta}>PDF • 14.2 MB • Approved</div>
                </div>
                <button className={styles.docDownload}>View</button>
              </div>
              <div className={styles.docItem}>
                <FileText size={18} className={styles.docIcon} />
                <div className={styles.docInfo}>
                  <div className={styles.docName}>Specification_Schedule_2026.pdf</div>
                  <div className={styles.docMeta}>PDF • 4.8 MB • Structural</div>
                </div>
                <button className={styles.docDownload}>View</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
