'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Clock, 
  Video, 
  MapPin, 
  Check, 
  X, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './consultations.module.css';

export default function DesignerConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setConsultations(data);
        } else {
          setConsultations([]);
        }
      } catch (err) {
        console.warn('Supabase fetch consultations error:', err);
      }
    }
    setLoading(false);
  };

  const handleStatus = async (id, newStatus) => {
    const updated = consultations.map(c => {
      if (c.id === id) {
        return { ...c, status: newStatus };
      }
      return c;
    });
    setConsultations(updated);

    if (isSupabaseConfigured()) {
      await supabase
        .from('consultations')
        .update({ status: newStatus })
        .eq('id', id);
    }

    setToast(`Consultation slot updated to "${newStatus.toUpperCase()}"`);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <>
      <DesignerHeader 
        title="Consultation & Site Walkthrough Calendar" 
        subtitle="Manage client review appointments, approve slots, and provide meeting coordinates" 
      />

      <div className={styles.container}>
        {toast && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toast}</span>
          </div>
        )}

        {consultations.length > 0 ? (
          <div className={styles.grid}>
            {consultations.map((item) => (
              <div key={item.id} className={`${styles.card} ${item.status === 'pending' ? styles.cardPending : ''}`}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.clientTag}>Client: {item.customer_name || 'Client'}</span>
                    <h3 className={styles.cardTitle}>{item.consultation_type || 'Design Consultation'}</h3>
                  </div>
                  <span className={`
                    ${styles.statusBadge}
                    ${item.status === 'confirmed' ? styles.badgeConfirmed : styles.badgePending}
                  `}>
                    {item.status === 'confirmed' ? 'Confirmed Slot' : 'Action Required'}
                  </span>
                </div>

                <div className={styles.metaBox}>
                  <div className={styles.metaRow}>
                    <CalendarDays size={16} color="var(--color-gold)" />
                    <span><strong>{item.preferred_date}</strong> ({item.preferred_time})</span>
                  </div>
                  <div className={styles.metaRow}>
                    <MapPin size={16} color="var(--color-gold)" />
                    <span>{item.location || 'Studio / Site Visit'}</span>
                  </div>
                </div>

                {item.notes && (
                  <div className={styles.notesBox}>
                    <span className={styles.notesLabel}>Client Agenda:</span>
                    <p className={styles.notesText}>{item.notes}</p>
                  </div>
                )}

                {item.status === 'pending' ? (
                  <div className={styles.actionsRow}>
                    <button 
                      onClick={() => handleStatus(item.id, 'confirmed')}
                      className={styles.confirmBtn}
                    >
                      <Check size={16} />
                      <span>Confirm Slot</span>
                    </button>
                    <button 
                      onClick={() => handleStatus(item.id, 'rescheduled')}
                      className={styles.rescheduleBtn}
                    >
                      <X size={16} />
                      <span>Reschedule</span>
                    </button>
                  </div>
                ) : (
                  <div className={styles.confirmedMeta}>
                    <CheckCircle2 size={16} color="var(--color-success)" />
                    <span>Slot confirmed in Designer Master Calendar</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--color-dark)',
            border: '1px dashed rgba(201, 168, 76, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '60px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}>
            <CalendarCheck size={36} color="var(--color-gold)" />
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#f8f8f8', marginBottom: '6px' }}>
                No Consultations Scheduled Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                When clients request private design consultations on the website, they will appear here for your confirmation.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
