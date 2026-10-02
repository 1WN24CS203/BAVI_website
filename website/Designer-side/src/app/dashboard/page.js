'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2, Users, CreditCard, CalendarDays,
  ArrowUpRight, Send, PlusCircle, Sparkles,
  PhoneCall, CheckCircle2, Clock, FileText
} from 'lucide-react';
import { useDesignerAuth } from '@/context/AuthContext';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  MetricCard, Card, Button, Badge, Divider, EmptyState, Spinner
} from '@/components/astryx';
import s from './shared.module.css';

export default function DesignerDashboardPage() {
  const { designer } = useDesignerAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalClients: 0,
    revenueCleared: '0',
    upcomingConsultations: 0,
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [pendingCallbacks, setPendingCallbacks] = useState(0);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const [{ data: projects }, { data: clients }, { data: payments }, { data: consultations }] =
          await Promise.all([
            supabase.from('projects').select('id, status'),
            supabase.from('profiles').select('id').eq('role', 'customer'),
            supabase.from('payments').select('*').order('paid_at', { ascending: false }).limit(6),
            supabase.from('consultations').select('id'),
          ]);
        const totalPaid = payments?.reduce((a, p) => a + (parseFloat(p.amount) || 0), 0) || 0;
        setStats({
          activeProjects: projects?.length || 0,
          totalClients: clients?.length || 0,
          revenueCleared: totalPaid.toLocaleString('en-IN'),
          upcomingConsultations: consultations?.length || 0,
        });
        setRecentPayments(payments || []);
      } else {
        // LocalStorage fallback
        const clients = JSON.parse(localStorage.getItem('bavi_registered_clients') || '[]');
        const callbacks = JSON.parse(localStorage.getItem('bavi_callback_requests') || '[]');
        const pending = callbacks.filter(c => c.status === 'pending').length;
        setStats(prev => ({ ...prev, totalClients: clients.length }));
        setPendingCallbacks(pending);
      }
    } catch (err) {
      console.warn('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { href: '/dashboard/payments', icon: Send, label: 'Initiate Bill', variant: 'primary' },
    { href: '/dashboard/projects', icon: PlusCircle, label: 'New Project', variant: 'secondary' },
    { href: '/dashboard/callbacks', icon: PhoneCall, label: 'View Callbacks', variant: 'secondary' },
    { href: '/dashboard/designs', icon: Sparkles, label: 'Upload Design', variant: 'outline' },
  ];

  return (
    <>
      <DesignerHeader
        title="Architect Command Center"
        subtitle={`${designer?.full_name || 'Principal Architect'} · ${designer?.specialization || 'BAVI Architecture & Interiors'}`}
      />

      <div className={s.page}>
        {/* Pending Callbacks Alert */}
        {pendingCallbacks > 0 && (
          <div className={`${s.infoBanner} ${s.infoBannerWarning}`}>
            <Clock size={16} />
            <span>
              <strong>{pendingCallbacks} callback{pendingCallbacks > 1 ? 's' : ''} pending</strong> — attend the call before issuing client credentials.
            </span>
            <Link href="/dashboard/callbacks" style={{ marginLeft: 'auto', color: 'inherit', fontWeight: 700, textDecoration: 'underline', fontSize: '0.8rem' }}>
              View Callbacks →
            </Link>
          </div>
        )}

        {/* Metric Cards */}
        <div className={s.metricsGrid}>
          <MetricCard label="Active Projects" value={loading ? '—' : stats.activeProjects} subtext="Under live execution" icon={Building2} />
          <MetricCard label="Assigned Clients" value={loading ? '—' : stats.totalClients} subtext="Client portfolio" icon={Users} />
          <MetricCard label="Revenue Cleared" value={loading ? '—' : `₹${stats.revenueCleared}`} subtext="Via phone & UPI" icon={CreditCard} isGold />
          <MetricCard label="Consultations" value={loading ? '—' : stats.upcomingConsultations} subtext="Client appointments" icon={CalendarDays} />
        </div>

        {/* Quick Actions */}
        <div className={s.actionBanner}>
          <div>
            <span className={s.actionBannerTag}>Quick Actions</span>
            <h3 className={s.actionBannerTitle}>Manage Billing, Projects & Callbacks</h3>
          </div>
          <div className={s.actionBtnGroup}>
            {quickActions.map(a => (
              <Link key={a.href} href={a.href}>
                <Button variant={a.variant} icon={a.icon} size="sm">{a.label}</Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Split: Payments + Projects */}
        <div className={s.splitGrid}>
          {/* Recent Payments */}
          <Card variant="default" padding="lg">
            <div className={s.sectionHeader}>
              <h2 className={s.sectionTitle}>Recent Payments</h2>
              <Link href="/dashboard/payments" className={s.viewAllLink}>
                View Ledger <ArrowUpRight size={13} />
              </Link>
            </div>
            <Divider />
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <Spinner />
              </div>
            ) : recentPayments.length > 0 ? (
              <div className={s.listGrid} style={{ marginTop: 14 }}>
                {recentPayments.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'var(--astryx-success-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <CheckCircle2 size={18} color="var(--astryx-success)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--astryx-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.receipt_number || 'Payment'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--astryx-text-muted)' }}>
                        {p.description || 'Milestone payment'} · {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : 'Recent'}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--astryx-success)', fontSize: '0.88rem', flexShrink: 0 }}>
                      ₹{parseFloat(p.amount)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CreditCard}
                title="No Payments Yet"
                description="Initiate a bill payment request above to get started."
              />
            )}
          </Card>

          {/* Active Projects */}
          <Card variant="default" padding="lg">
            <div className={s.sectionHeader}>
              <h2 className={s.sectionTitle}>Priority Projects</h2>
              <Link href="/dashboard/projects" className={s.viewAllLink}>
                All Projects <ArrowUpRight size={13} />
              </Link>
            </div>
            <Divider />
            <EmptyState
              icon={FileText}
              title="No Active Projects"
              description="Go to Projects to create your first client project roadmap."
              action={
                <Link href="/dashboard/projects">
                  <Button variant="primary" icon={PlusCircle} size="sm">Create Project</Button>
                </Link>
              }
            />
          </Card>
        </div>
      </div>
    </>
  );
}
