'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  CreditCard, 
  CalendarDays, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FolderKanban,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  Eye
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import DesignerHeader from '@/components/Header';
import styles from './dashboard.module.css';

export default function DesignerDashboardPage() {
  const { designer } = useDesignerAuth();

  const isArun = designer?.company_code === 'BAVI-DES-7890';

  const stats = isArun ? {
    activeProjects: 4,
    totalClients: 6,
    revenueCleared: '₹1.82 Cr',
    pendingReviews: 2,
    upcomingConsultations: 3
  } : {
    activeProjects: 3,
    totalClients: 5,
    revenueCleared: '₹93.5 Lakh',
    pendingReviews: 1,
    upcomingConsultations: 2
  };

  const recentActivities = [
    {
      id: 1,
      client: 'Rajesh Sharma',
      project: 'The Grand Serenity Villa (Sadashivanagar)',
      action: 'Paid Milestone 2: Foundation Structure',
      amount: '₹54,00,000',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      client: 'Pooja Reddy',
      project: 'Whitefield Penthouse Renovation',
      action: 'Requested On-Site Material Selection Review',
      amount: '₹18,50,000',
      time: '4 hours ago',
      status: 'pending'
    },
    {
      id: 3,
      client: 'Vikramaditya Rao',
      project: 'Mysuru Heritage Corporate Hub',
      action: 'Approved Stage 1 Conceptual Blueprint',
      amount: '₹32,00,000',
      time: '1 day ago',
      status: 'success'
    }
  ];

  return (
    <>
      <DesignerHeader 
        title="Architect Command Center" 
        subtitle={`Logged in as ${designer?.full_name || 'Principal Architect'} • ${designer?.specialization || 'Monolithic Architecture'}`} 
      />

      <div className={styles.container}>
        {/* Metric Cards Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Active Projects</span>
              <Building2 size={20} className={styles.metricIcon} />
            </div>
            <div className={styles.metricValue}>{stats.activeProjects}</div>
            <span className={styles.metricSub}>Under live site execution</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Assigned Clients</span>
              <Users size={20} className={styles.metricIcon} />
            </div>
            <div className={styles.metricValue}>{stats.totalClients}</div>
            <span className={styles.metricSub}>High-net-worth portfolio</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Total Escrow Cleared</span>
              <CreditCard size={20} className={styles.metricIcon} />
            </div>
            <div className={styles.metricValueGold}>{stats.revenueCleared}</div>
            <span className={styles.metricSub}>Bank escrow milestone cleared</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Consultations Pending</span>
              <CalendarDays size={20} className={styles.metricIcon} />
            </div>
            <div className={styles.metricValue}>{stats.upcomingConsultations}</div>
            <span className={styles.metricSub}>Scheduled this week</span>
          </div>
        </div>

        {/* Quick Commission Actions */}
        <div className={styles.actionBanner}>
          <div className={styles.actionBannerText}>
            <span className={styles.actionBannerTag}>Quick Architect Actions</span>
            <h3 className={styles.actionBannerTitle}>Commission Dispatch & File Deliverables</h3>
          </div>
          <div className={styles.actionBtnGroup}>
            <Link href="/dashboard/projects" className={styles.primaryActionBtn}>
              <PlusCircle size={16} />
              <span>Update Project Milestone</span>
            </Link>
            <Link href="/dashboard/designs" className={styles.secondaryActionBtn}>
              <Sparkles size={16} />
              <span>Upload Signature Design</span>
            </Link>
            <Link href="/dashboard/payments" className={styles.secondaryActionBtn}>
              <FileSpreadsheet size={16} />
              <span>Escrow Ledger</span>
            </Link>
          </div>
        </div>

        {/* Split Grid: Live Project Milestones & Activity */}
        <div className={styles.splitGrid}>
          {/* Recent Client Interactions */}
          <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Real-Time Client Activity</h2>
              <Link href="/dashboard/customers" className={styles.viewAllLink}>
                <span>View All Clients</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className={styles.activityList}>
              {recentActivities.map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityIconWrap}>
                    {act.status === 'success' ? (
                      <CheckCircle2 size={18} className={styles.iconSuccess} />
                    ) : (
                      <Clock size={18} className={styles.iconPending} />
                    )}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityClientRow}>
                      <span className={styles.clientName}>{act.client}</span>
                      <span className={styles.activityTime}>{act.time}</span>
                    </div>
                    <div className={styles.activityProject}>{act.project}</div>
                    <div className={styles.activityActionText}>{act.action}</div>
                  </div>
                  <div className={styles.activityAmount}>{act.amount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Active Projects Overview */}
          <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Priority Milestones</h2>
              <Link href="/dashboard/projects" className={styles.viewAllLink}>
                <span>Manage All ({stats.activeProjects})</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className={styles.projectList}>
              <div className={styles.projectCardItem}>
                <div className={styles.projectItemHeader}>
                  <h4 className={styles.projectItemTitle}>The Grand Serenity Villa</h4>
                  <span className={styles.statusPill}>65% Complete</span>
                </div>
                <div className={styles.projectItemClient}>Rajesh Sharma • Sadashivanagar</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '65%' }} />
                </div>
                <div className={styles.projectItemNext}>
                  <span>Next: Brick Masonry & Electrical Conduits</span>
                  <Link href="/dashboard/projects" className={styles.itemAction}>Manage</Link>
                </div>
              </div>

              <div className={styles.projectCardItem}>
                <div className={styles.projectItemHeader}>
                  <h4 className={styles.projectItemTitle}>Whitefield Penthouse</h4>
                  <span className={styles.statusPill}>50% Complete</span>
                </div>
                <div className={styles.projectItemClient}>Pooja Reddy • Whitefield</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '50%' }} />
                </div>
                <div className={styles.projectItemNext}>
                  <span>Next: Italian Marble & False Ceiling</span>
                  <Link href="/dashboard/projects" className={styles.itemAction}>Manage</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
