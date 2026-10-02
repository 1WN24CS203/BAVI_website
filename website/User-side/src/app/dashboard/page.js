'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2, Clock, CreditCard, CalendarDays, CheckCircle2,
  FileText, ChevronRight, MapPin, FolderKanban, PhoneCall, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Card, Badge, Button, EmptyState, Divider, ProgressBar } from '@/components/astryx';

export default function DashboardOverviewPage() {
  const { profile } = useAuth();
  const [project, setProject] = useState(null);
  const [consultation, setConsultation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let activeProject = null;
      if (isSupabaseConfigured()) {
        try {
          let q = supabase.from('projects').select('*');
          if (profile?.email) q = q.or(`client_email.eq.${profile.email},customer_id.eq.${profile.id}`);
          const { data } = await q.order('created_at', { ascending: false }).limit(1);
          if (data?.length) activeProject = data[0];
          else {
            const { data: latest } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(1);
            if (latest?.length) activeProject = latest[0];
          }
        } catch (err) { console.warn('Project fetch:', err); }
      }
      if (!activeProject) {
        try {
          const stored = localStorage.getItem('bavi_client_active_project') || localStorage.getItem('bavi_projects');
          if (stored) { const p = JSON.parse(stored); activeProject = Array.isArray(p) ? p[0] : p; }
        } catch {}
      }
      setProject(activeProject || null);

      let cons = null;
      if (isSupabaseConfigured()) {
        try {
          let q = supabase.from('consultations').select('*');
          if (profile?.email) q = q.eq('customer_email', profile.email);
          const { data } = await q.order('created_at', { ascending: false }).limit(1);
          if (data?.length) cons = data[0];
        } catch {}
      }
      if (!cons) {
        try {
          const stored = JSON.parse(localStorage.getItem('bavi_client_consultations') || '[]');
          if (Array.isArray(stored) && stored.length) cons = stored[0];
        } catch {}
      }
      if (cons) setConsultation({ ...cons, date: cons.preferred_date || cons.date || 'TBD', time: cons.preferred_time || cons.time || '11:00 AM', type: cons.consultation_type || cons.type || 'Architectural Review' });
    };
    fetchData();
  }, [profile]);

  const milestonesDone = project?.milestones?.filter(m => m.status === 'COMPLETED').length || 0;
  const milestonesTotal = project?.milestones?.length || 0;
  const progressPct = milestonesTotal > 0 ? Math.round((milestonesDone / milestonesTotal) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(120deg, #0d0e15, #161824)',
        border: '1px solid rgba(229, 192, 123, 0.25)',
        borderRadius: 16,
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-gold)', fontWeight: 700 }}>
            Project Portal
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '6px 0 8px' }}>
            Hello, <span style={{ color: 'var(--color-gold)' }}>{profile?.full_name || 'Valued Client'}</span>
          </h2>
          <p style={{ fontSize: '0.87rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            {project ? <>Your project <strong style={{ color: '#fff' }}>{project.title}</strong> is currently active.</> : 'Welcome to BAVI Interiors. Start by defining your project vision.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/dashboard/requirements">
            <Button variant="primary" icon={FileText} size="sm">My Requirements</Button>
          </Link>
          <Link href="/dashboard/consultations">
            <Button variant="secondary" icon={CalendarDays} size="sm">Book Consultation</Button>
          </Link>
        </div>
      </div>

      {/* Project Active View */}
      {project ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {/* Milestone Card */}
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.4px' }}>Milestones</span>
              <Building2 size={18} color="var(--color-gold)" />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {milestonesDone}/{milestonesTotal || '—'}
            </div>
            <ProgressBar value={progressPct} label="Completed" />
            <div style={{ marginTop: 8 }}>
              <Badge variant="success" dot>In Progress</Badge>
            </div>
          </Card>

          {/* Budget Card */}
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.4px' }}>Budget</span>
              <CreditCard size={18} color="var(--color-gold)" />
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-gold)', marginBottom: 4 }}>
              {project.budget || '₹ —'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>Paid: {project.paid || '₹ 0'}</div>
            <Link href="/dashboard/payments">
              <Button size="xs" variant="outline" iconRight={ChevronRight}>Escrow Schedule</Button>
            </Link>
          </Card>

          {/* Site Location Card */}
          <Card variant="default" padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.4px' }}>Site Location</span>
              <MapPin size={18} color="var(--color-gold)" />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 6 }}>{project.location || 'Bengaluru'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-success)', marginBottom: 12 }}>
              <CheckCircle2 size={14} /> Dual Permission Tracking Active
            </div>
            <Link href="/dashboard/project">
              <Button size="xs" variant="outline" iconRight={ChevronRight}>Stages & Files</Button>
            </Link>
          </Card>
        </div>
      ) : (
        /* Getting Started Steps */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { step: 1, title: 'Define Requirements', desc: 'Write your room needs, layout ideas, and aesthetic preferences.', href: '/dashboard/requirements', icon: FileText },
            { step: 2, title: 'Site Consultation', desc: 'Schedule a virtual or on-site consultation to review architectural scope.', href: '/dashboard/consultations', icon: CalendarDays },
            { step: 3, title: 'Dual Stage Approvals', desc: 'Every milestone requires mutual sign-off from you and your builder.', href: '/dashboard/project', icon: FolderKanban },
          ].map(({ step, title, desc, href, icon: Icon }) => (
            <Card key={step} variant="default" padding="md" hoverable>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(229,192,123,0.12)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{step}. {title}</h3>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 14px' }}>{desc}</p>
              <Link href={href}>
                <Button size="xs" variant="outline" iconRight={ChevronRight}>Get Started</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom Row: Consultation + Concierge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Consultation Card */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Upcoming Consultation</h3>
            <Link href="/dashboard/consultations" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-gold)' }}>All Sessions <ArrowUpRight size={13} /></Link>
          </div>
          <Divider />
          {consultation ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(229,192,123,0.1)', border: '1px solid rgba(229,192,123,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gold)', lineHeight: 1 }}>{consultation.date?.split('-')[2] || '—'}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{consultation.date?.split('-')[1] || 'TBD'}</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  <Clock size={13} /> {consultation.time}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: 6 }}>{consultation.type}</div>
                <Badge variant={consultation.status === 'confirmed' ? 'success' : 'warning'}>{consultation.status || 'Pending'}</Badge>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="No Sessions Scheduled"
              description="Book a consultation with a master architect."
              action={<Link href="/dashboard/consultations"><Button size="sm" variant="primary" icon={CalendarDays}>Book Now</Button></Link>}
            />
          )}
        </Card>

        {/* Concierge Assist Card */}
        <Card variant="gold" padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Concierge Assistance</h3>
            <p style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Need urgent assistance, revision feedback, or an on-site survey callback?
            </p>
          </div>
          <Link href="/dashboard/consultations">
            <Button variant="primary" icon={PhoneCall} fullWidth>Direct Concierge Connect</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
