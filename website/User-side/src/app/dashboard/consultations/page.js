'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarDays, Clock, Video, MapPin, Plus, CheckCircle2, 
  AlertCircle, Phone, CalendarCheck, Sparkles, Send
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Card, Badge, Button, TextInput, TextArea, Select, Modal, EmptyState, Toast
} from '@/components/astryx';
import s from '../shared.module.css';

export default function ConsultationsPage() {
  const { profile } = useAuth();
  const designer = profile?.designer || {
    name: 'BAVI Architectural Studio',
    title: 'Principal Architect & Site Concierge',
    phone: '+91 8277762487',
    code: 'BAVI-STUDIO'
  };

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState('success');

  const [formData, setFormData] = useState({
    type: 'design_review',
    preferredDate: '',
    preferredTime: '11:00 AM',
    mode: 'in_person',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, variant = 'success') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastVisible(true);
  };

  const fetchConsultations = async () => {
    let list = [];
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('consultations').select('*');
        if (profile?.email) {
          q = q.eq('customer_email', profile.email);
        }
        const { data } = await q.order('created_at', { ascending: false });
        if (data && data.length > 0) {
          list = data.map(c => ({
            ...c,
            type: c.consultation_type || c.type || 'Architectural Review',
            date: c.preferred_date || c.date || 'TBD',
            time: c.preferred_time || c.time || '11:00 AM',
            mode: c.location || (c.meeting_link ? 'Google Meet Video Call' : 'On-Site Indiranagar Plot'),
            meetingLink: c.meeting_link,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch consultations error:', err);
      }
    }

    if (list.length === 0) {
      try {
        const stored = localStorage.getItem('bavi_client_consultations');
        if (stored) list = JSON.parse(stored);
      } catch {}
    }

    setConsultations(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchConsultations();
  }, [profile]);

  const handleBooking = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const typeLabel = formData.type === 'design_review' ? 'Design & Material Review' : 
                      formData.type === 'site_visit' ? 'Site Progress Inspection' : 'Architectural Planning Consultation';

    let newBooking = {
      id: 'cons-' + Date.now(),
      type: typeLabel,
      category: 'Customer Request',
      date: formData.preferredDate || new Date().toISOString().split('T')[0],
      time: formData.preferredTime,
      status: 'pending',
      mode: formData.mode === 'in_person' ? 'On-Site Indiranagar Plot' : 'Google Meet Video Call',
      meetingLink: formData.mode === 'video' ? 'https://meet.google.com/bavi-custom-demo' : null,
      notes: formData.notes || 'Scheduled via client portal'
    };

    setSubmitting(true);

    if (isSupabaseConfigured()) {
      try {
        const payload = {
          customer_name: profile?.full_name || 'Client',
          customer_email: profile?.email || 'client@bavi.com',
          customer_phone: profile?.phone || '',
          consultation_type: typeLabel,
          preferred_date: newBooking.date,
          preferred_time: newBooking.time,
          notes: newBooking.notes,
          status: 'pending',
          location: newBooking.mode,
          meeting_link: newBooking.meetingLink,
        };
        const { data } = await supabase.from('consultations').insert([payload]).select();
        if (data && data.length > 0) {
          newBooking = { ...newBooking, ...data[0], id: data[0].id };
        }
      } catch (err) {
        console.warn('Failed to insert consultation in Supabase:', err);
      }
    }

    const updated = [newBooking, ...consultations];
    setConsultations(updated);
    try {
      localStorage.setItem('bavi_client_consultations', JSON.stringify(updated));
    } catch {}

    setSubmitting(false);
    setShowModal(false);
    showToast('Consultation appointment request submitted to architect!');
    setFormData({
      type: 'design_review',
      preferredDate: '',
      preferredTime: '11:00 AM',
      mode: 'in_person',
      notes: ''
    });
  };

  return (
    <div className={s.container}>
      <Toast 
        message={toastMsg} 
        variant={toastVariant} 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />

      {/* Header Banner */}
      <Card elevated style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Badge variant="gold">Designer Collaboration</Badge>
              <Badge variant="info">One-on-One Sessions</Badge>
            </div>
            <h1 style={{ 
              fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", 
              fontSize: '1.75rem', 
              color: 'var(--astryx-text-primary)', 
              margin: 0 
            }}>
              Consultations &amp; Site Reviews
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--astryx-text-secondary)', margin: '4px 0 0', maxWidth: 640 }}>
              Book dedicated walkthroughs and review sessions with your lead architect <strong style={{ color: 'var(--astryx-gold)' }}>{designer.name}</strong> for design signoffs and material approvals.
            </p>
          </div>

          <Button 
            variant="gold" 
            icon={Plus} 
            onClick={() => setShowModal(true)}
            id="book-consultation-btn"
          >
            Request Appointment
          </Button>
        </div>
      </Card>

      {/* Consultations List */}
      <div>
        <h2 style={{ fontSize: '1.15rem', color: 'var(--astryx-text-primary)', fontWeight: 700, marginBottom: 16 }}>
          Scheduled &amp; Past Sessions ({consultations.length})
        </h2>

        {consultations.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No Consultations Scheduled"
            description="You have no active or upcoming review sessions with your architect. Book your first design or site walkthrough above."
            action={
              <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
                Book First Session
              </Button>
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {consultations.map((item) => (
              <Card key={item.id} elevated style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--astryx-gold-light)', fontSize: '0.88rem', fontWeight: 600 }}>
                    <CalendarDays size={18} color="var(--astryx-gold)" />
                    <span>{item.date}</span>
                  </div>
                  <Badge variant={
                    item.status === 'confirmed' ? 'success' :
                    item.status === 'completed' ? 'info' : 'warning'
                  }>
                    {item.status === 'confirmed' ? 'Confirmed' :
                     item.status === 'completed' ? 'Completed' : 'Pending Confirmation'}
                  </Badge>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--astryx-text-primary)', margin: '0 0 6px', fontWeight: 600 }}>
                    {item.type}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--astryx-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {item.notes || 'Review session scheduled with architectural team.'}
                  </p>
                </div>

                <div style={{ 
                  background: 'var(--astryx-surface-1)', 
                  padding: '12px 14px', 
                  borderRadius: 'var(--radius-sm)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 8, 
                  fontSize: '0.82rem',
                  color: 'var(--astryx-text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={15} color="var(--astryx-text-secondary)" />
                    <span style={{ color: 'var(--astryx-text-primary)' }}>{item.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.mode.includes('Video') ? (
                      <Video size={15} color="var(--astryx-info)" />
                    ) : (
                      <MapPin size={15} color="var(--astryx-gold)" />
                    )}
                    <span style={{ color: 'var(--astryx-text-primary)' }}>{item.mode}</span>
                  </div>
                </div>

                {item.meetingLink && (
                  <Button 
                    variant="outline" 
                    icon={Video} 
                    onClick={() => window.open(item.meetingLink, '_blank')}
                    fullWidth
                  >
                    Join Video Conference
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal using Astryx Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Request Consultation / Site Visit"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="gold" 
              icon={Send} 
              loading={submitting} 
              onClick={handleBooking}
            >
              Submit Request
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--astryx-text-secondary)', marginBottom: 16 }}>
          Choose your session type and preferred appointment slot. Your architect will review and confirm within 4 business hours.
        </p>

        <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select
            label="Session Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'design_review', label: 'Design & Material Review (Studio/Online)' },
              { value: 'site_visit', label: 'Site Progress & Snagging Inspection' },
              { value: 'planning', label: 'Architectural Planning & Blueprint Discussion' }
            ]}
          />

          <TextInput
            label="Preferred Date"
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            icon={CalendarDays}
            required
          />

          <Select
            label="Preferred Time Window"
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            options={[
              { value: '10:00 AM', label: 'Morning (10:00 AM - 11:30 AM)' },
              { value: '02:00 PM', label: 'Afternoon (02:00 PM - 03:30 PM)' },
              { value: '05:00 PM', label: 'Evening (05:00 PM - 06:30 PM)' }
            ]}
          />

          <Select
            label="Meeting Mode"
            value={formData.mode}
            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
            options={[
              { value: 'in_person', label: 'On-Site Indiranagar Plot (Physical)' },
              { value: 'video', label: 'High-Definition Video Call (Google Meet)' }
            ]}
          />

          <TextArea
            label="Specific Topics / Inquiries for the Architect"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Would like to finalize Italian marble finishes and review living room false ceiling 3D renders."
            rows={3}
          />
        </form>
      </Modal>
    </div>
  );
}
