'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarDays, Clock, Video, MapPin, Check, X, 
  CheckCircle2, ExternalLink, MessageSquare, Sparkles, CalendarCheck, User
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Button, Badge, Card, Toast, EmptyState, Tag, StatusDot
} from '@/components/astryx';

export default function DesignerConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState('success');

  const showToast = (msg, variant = 'success') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastVisible(true);
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    let list = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) list = data;
      } catch (err) {
        console.warn('Supabase fetch consultations error:', err);
      }
    }

    if (list.length === 0) {
      list = [
        {
          id: 'cons-1',
          customer_name: 'Rajesh Sharma',
          consultation_type: 'Structural Milestone Review',
          preferred_date: 'Tomorrow, 10:30 AM',
          preferred_time: '10:30 AM – 11:30 AM',
          location: 'Studio / Site Visit (BM Road)',
          status: 'confirmed',
          notes: 'Reviewing foundation blueprint sanctions and dual authorization sign-off.'
        },
        {
          id: 'cons-2',
          customer_name: 'Pooja Reddy',
          consultation_type: 'Luxury Villa Architectural Walkthrough',
          preferred_date: 'Saturday, 03:00 PM',
          preferred_time: '03:00 PM – 04:30 PM',
          location: 'Private Studio Gallery',
          status: 'pending',
          notes: 'First consultation to review 3BHK contemporary floor plan and materials selection.'
        }
      ];
    }

    setConsultations(list);
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
      try {
        await supabase
          .from('consultations')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    showToast(`Consultation slot marked as "${newStatus.toUpperCase()}"!`);
  };

  return (
    <>
      <DesignerHeader 
        title="Consultation & Site Walkthrough Calendar" 
        subtitle="Manage client review appointments, approve slots, and provide meeting coordinates" 
      />

      <div style={{ padding: '0 4px' }}>
        {/* Metric Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '1.25rem', fontWeight: 700, color: '#f8f8f8', margin: 0 }}>
              Scheduled Appointments ({consultations.length})
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#a0a0a0', margin: '4px 0 0' }}>
              Confirm slot requests received from clients and website visitors
            </p>
          </div>
        </div>

        {consultations.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {consultations.map((item) => {
              const isConfirmed = item.status === 'confirmed';

              return (
                <Card 
                  key={item.id} 
                  variant={isConfirmed ? 'default' : 'gold'} 
                  padding="md"
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <Tag variant="gold">Client: {item.customer_name || 'Client'}</Tag>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8f8f8', margin: '8px 0 0' }}>
                        {item.consultation_type || 'Design Consultation'}
                      </h4>
                    </div>

                    {isConfirmed ? (
                      <Badge variant="success" dot>Confirmed Slot</Badge>
                    ) : (
                      <Badge variant="warning" dot>Action Required</Badge>
                    )}
                  </div>

                  {/* Schedule Details Box */}
                  <div style={{
                    background: '#161616',
                    border: '1px solid #282828',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#f8f8f8' }}>
                      <CalendarDays size={14} color="#c9a84c" />
                      <span><strong>{item.preferred_date}</strong> {item.preferred_time ? `(${item.preferred_time})` : ''}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a0a0a0' }}>
                      <MapPin size={14} color="#c9a84c" />
                      <span>{item.location || 'Studio / Site Visit'}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <div style={{
                      fontSize: '0.78rem',
                      color: '#b0b0b0',
                      lineHeight: 1.5,
                      background: '#131313',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      marginBottom: '14px',
                      borderLeft: '3px solid #c9a84c'
                    }}>
                      <span style={{ fontWeight: 600, color: '#e0e0e0', display: 'block', marginBottom: '2px' }}>Client Agenda:</span>
                      {item.notes}
                    </div>
                  )}

                  {/* Actions using Astryx Button */}
                  {!isConfirmed ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Button 
                        size="sm" 
                        variant="success" 
                        icon={Check}
                        onClick={() => handleStatus(item.id, 'confirmed')}
                      >
                        Confirm Slot
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        icon={X}
                        onClick={() => handleStatus(item.id, 'rescheduled')}
                      >
                        Reschedule
                      </Button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#4ade80', fontWeight: 600 }}>
                      <CheckCircle2 size={16} /> Confirmed in Designer Master Calendar
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={CalendarCheck}
            title="No Consultations Scheduled Yet"
            description="When clients request private design consultations on the website, they will appear here for your confirmation."
          />
        )}

        {/* Toast */}
        <Toast message={toastMsg} variant={toastVariant} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    </>
  );
}
