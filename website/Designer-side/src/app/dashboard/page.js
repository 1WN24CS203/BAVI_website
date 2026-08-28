'use client';

import { useState, useEffect } from 'react';
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
  Eye,
  Send
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './dashboard.module.css';

export default function DesignerDashboardPage() {
  const { designer } = useDesignerAuth();

  const [stats, setStats] = useState({
    activeProjects: 0,
    totalClients: 0,
    revenueCleared: '₹0',
    upcomingConsultations: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data: projects } = await supabase.from('projects').select('*');
        const { data: clients } = await supabase.from('profiles').select('*').eq('role', 'customer');
        const { data: payments } = await supabase.from('payments').select('*');
        const { data: consultations } = await supabase.from('consultations').select('*');

        const totalPaidSum = payments?.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0) || 0;

        setStats({
          activeProjects: projects?.length || 0,
          totalClients: clients?.length || 0,
          revenueCleared: totalPaidSum > 0 ? '₹' + totalPaidSum.toLocaleString('en-IN') : '₹0',
          upcomingConsultations: consultations?.length || 0
        });

        if (payments && payments.length > 0) {
          setRecentActivities(payments.slice(0, 5));
        }
      } catch (err) {
        console.warn('Supabase fetch dashboard stats error:', err);
      }
    }
  };

  return (
    <>
      <DesignerHeader 
        title="Architect Command Center" 
        subtitle={`Logged in as ${designer?.full_name || 'Principal Architect'} • ${designer?.specialization || 'BAVI Architecture & Interiors'}`} 
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
            <span className={styles.metricSub}>Client portfolio</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Total Payments Cleared</span>
              <CreditCard size={20} className={styles.metricIcon} />
            </div>
            <div className={styles.metricValueGold}>{stats.revenueCleared}</div>
            <span className={styles.metricSub}>Received via Phone & UPI QR</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Consultations Requested</span>
              <CalendarDays size={20} className={styles.metricIcon} />
            </div>
            <div className={styles.metricValue}>{stats.upcomingConsultations}</div>
            <span className={styles.metricSub}>Client appointments</span>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className={styles.actionBanner}>
          <div className={styles.actionBannerText}>
            <span className={styles.actionBannerTag}>Quick Architect Actions</span>
            <h3 className={styles.actionBannerTitle}>Initiate Bill Payment or Update Milestone</h3>
          </div>
          <div className={styles.actionBtnGroup}>
            <Link href="/dashboard/payments" className={styles.primaryActionBtn}>
              <Send size={16} />
              <span>Initiate Bill Payment Request</span>
            </Link>
            <Link href="/dashboard/projects" className={styles.secondaryActionBtn}>
              <PlusCircle size={16} />
              <span>Create New Project</span>
            </Link>
            <Link href="/dashboard/designs" className={styles.secondaryActionBtn}>
              <Sparkles size={16} />
              <span>Upload Design Showcase</span>
            </Link>
          </div>
        </div>

        {/* Split Grid: Live Project Milestones & Activity */}
        <div className={styles.splitGrid}>
          {/* Recent Client Interactions */}
          <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Real-Time Payment Activity</h2>
              <Link href="/dashboard/payments" className={styles.viewAllLink}>
                <span>View Escrow Ledger</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {recentActivities.length > 0 ? (
              <div className={styles.activityList}>
                {recentActivities.map((act) => (
                  <div key={act.id} className={styles.activityItem}>
                    <div className={styles.activityIconWrap}>
                      <CheckCircle2 size={18} className={styles.iconSuccess} />
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityClientRow}>
                        <span className={styles.clientName}>{act.receipt_number || 'Receipt'}</span>
                        <span className={styles.activityTime}>{act.paid_at || 'Recently'}</span>
                      </div>
                      <div className={styles.activityActionText}>{act.description || 'Milestone Payment'}</div>
                    </div>
                    <div className={styles.activityAmount}>₹{parseFloat(act.amount)?.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                No recent payment transactions recorded yet. Click "Initiate Bill Payment Request" above to send a bill to a client.
              </div>
            )}
          </div>

          {/* Quick Active Projects Overview */}
          <div className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Priority Projects</h2>
              <Link href="/dashboard/projects" className={styles.viewAllLink}>
                <span>Manage All Projects</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              No active projects created yet. Go to <Link href="/dashboard/projects" style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Projects</Link> to create your first client project roadmap.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
