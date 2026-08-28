'use client';

import { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import styles from './consultations.module.css';

export default function DesignerConsultationsPage() {
  const [consultations, setConsultations] = useState([
    {
      id: 'c-req-1',
      client: 'Pooja Reddy',
      email: 'pooja.reddy@example.com',
      project: 'Whitefield Penthouse Renovation',
      type: 'On-Site Material & Closet Measurements',
      date: '2026-09-08',
      time: '03:30 PM - 05:00 PM',
      mode: 'In-Person Site Visit',
      status: 'pending',
      notes: 'Client wants to finalize imported quartz countertop edge profiles and master walk-in wardrobe hardware.'
    },
    {
      id: 'c-req-2',
      client: 'Rajesh Sharma',
      email: 'rajesh.sharma@example.com',
      project: 'The Grand Serenity Villa',
      type: 'Italian Marble & False Ceiling Review',
      date: '2026-09-05',
      time: '11:00 AM - 12:30 PM',
      mode: 'On-Site Indiranagar Plot',
      status: 'confirmed',
      notes: 'Sample slab selection of Botticino & Statuario marble with architect Arun Bahubali.'
    }
  ]);

  const [toast, setToast] = useState('');

  const handleStatus = (id, newStatus) => {
    const updated = consultations.map(c => {
      if (c.id === id) {
        return { ...c, status: newStatus };
      }
      return c;
    });
    setConsultations(updated);
    setToast(`Consultation slot updated to "${newStatus.toUpperCase()}" and notified client.`);
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

        <div className={styles.grid}>
          {consultations.map((item) => (
            <div key={item.id} className={`${styles.card} ${item.status === 'pending' ? styles.cardPending : ''}`}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.clientTag}>Client: {item.client}</span>
                  <h3 className={styles.cardTitle}>{item.type}</h3>
                  <span className={styles.projectSub}>{item.project}</span>
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
                  <span><strong>{item.date}</strong> ({item.time})</span>
                </div>
                <div className={styles.metaRow}>
                  <MapPin size={16} color="var(--color-gold)" />
                  <span>{item.mode}</span>
                </div>
              </div>

              <div className={styles.notesBox}>
                <span className={styles.notesLabel}>Client Agenda:</span>
                <p className={styles.notesText}>{item.notes}</p>
              </div>

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
      </div>
    </>
  );
}
