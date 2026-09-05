'use client';

import { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  Video, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Phone,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './consultations.module.css';

export default function ConsultationsPage() {
  const { profile } = useAuth();
  const designer = profile?.designer || {
    name: 'BAVI Architectural Studio',
    title: 'Principal Architect & Site Concierge',
    phone: '+91 8277762487',
    code: 'BAVI-STUDIO'
  };

  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_client_consultations');
      if (stored) {
        setConsultations(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'design_review',
    preferredDate: '',
    preferredTime: '11:00 AM',
    mode: 'in_person',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleBooking = (e) => {
    e.preventDefault();
    const newBooking = {
      id: 'cons-' + Date.now(),
      type: formData.type === 'design_review' ? 'Design & Material Review' : 
            formData.type === 'site_visit' ? 'Site Progress Inspection' : 'Architectural Planning Consultation',
      category: 'Customer Request',
      date: formData.preferredDate || '2026-09-18',
      time: formData.preferredTime,
      status: 'pending',
      mode: formData.mode === 'in_person' ? 'On-Site Indiranagar Plot' : 'Google Meet Video Call',
      meetingLink: formData.mode === 'video' ? 'https://meet.google.com/bavi-custom-demo' : null,
      notes: formData.notes || 'Scheduled via client portal'
    };

    const updated = [newBooking, ...consultations];
    setConsultations(updated);
    try {
      localStorage.setItem('bavi_client_consultations', JSON.stringify(updated));
    } catch {}
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
      setFormData({
        type: 'design_review',
        preferredDate: '',
        preferredTime: '11:00 AM',
        mode: 'in_person',
        notes: ''
      });
    }, 1500);
  };

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <span className={styles.badgeGold}>Designer Collaboration</span>
          <h2 className={styles.title}>Consultations & Site Visits</h2>
          <p className={styles.subtitle}>
            Book dedicated one-on-one sessions with your assigned architect <strong className={styles.goldText}>{designer.name}</strong> for design reviews, material selections, and site walkthroughs.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className={styles.bookBtn}
          id="book-consultation-btn"
        >
          <Plus size={18} />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Consultations List */}
      <div className={styles.listSection}>
        <h3 className={styles.sectionTitle}>Scheduled & Past Sessions</h3>
        
        {consultations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.1)',
            color: '#888'
          }}>
            <CalendarDays size={36} style={{ color: 'var(--astryx-gold, #c9a84c)', marginBottom: '12px' }} />
            <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '1.1rem' }}>No Consultations Scheduled</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem' }}>
              You have no active or upcoming review sessions with your architect.
            </p>
            <button onClick={() => setShowModal(true)} className={styles.bookBtn} style={{ margin: '0 auto' }}>
              <Plus size={16} />
              <span>Book First Session</span>
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
          {consultations.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.dateBadge}>
                  <CalendarDays size={18} className={styles.dateIcon} />
                  <span>{item.date}</span>
                </div>
                <span className={`
                  ${styles.statusBadge} 
                  ${item.status === 'confirmed' ? styles.statusConfirmed :
                    item.status === 'pending' ? styles.statusPending : styles.statusCompleted}
                `}>
                  {item.status === 'confirmed' ? 'Confirmed' :
                   item.status === 'pending' ? 'Pending Approval' : 'Completed'}
                </span>
              </div>

              <h4 className={styles.cardSubject}>{item.type}</h4>
              <p className={styles.cardNotes}>{item.notes}</p>

              <div className={styles.cardMeta}>
                <div className={styles.metaRow}>
                  <Clock size={15} />
                  <span>{item.time}</span>
                </div>
                <div className={styles.metaRow}>
                  {item.mode.includes('Video') ? <Video size={15} color="var(--color-info)" /> : <MapPin size={15} color="var(--color-gold)" />}
                  <span>{item.mode}</span>
                </div>
              </div>

              {item.meetingLink && (
                <a 
                  href={item.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.joinBtn}
                >
                  <Video size={15} />
                  <span>Join Google Meet Call</span>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

      {/* Booking Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.badgeGold}>Schedule Meeting</span>
                <h3 className={styles.modalTitle}>Request Consultation</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>

            {submitted ? (
              <div className={styles.successState}>
                <CheckCircle2 size={48} color="var(--color-success)" />
                <h4>Consultation Requested!</h4>
                <p>{designer.name} will confirm the slot shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Consultation Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className={styles.formInput}
                  >
                    <option value="design_review">Design & Material Selection Review</option>
                    <option value="site_visit">On-Site Progress Walkthrough</option>
                    <option value="technical">Electrical / Plumbing / MEP Coordination</option>
                    <option value="handover">Milestone Sign-Off Discussion</option>
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Preferred Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                      className={styles.formInput} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Preferred Time Slot</label>
                    <select 
                      value={formData.preferredTime} 
                      onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                      className={styles.formInput}
                    >
                      <option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM</option>
                      <option value="11:30 AM - 01:00 PM">11:30 AM - 01:00 PM</option>
                      <option value="03:00 PM - 04:30 PM">03:00 PM - 04:30 PM</option>
                      <option value="05:00 PM - 06:30 PM">05:00 PM - 06:30 PM</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Meeting Mode</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="mode" 
                        value="in_person"
                        checked={formData.mode === 'in_person'}
                        onChange={() => setFormData({...formData, mode: 'in_person'})}
                      />
                      <span>In-Person Site Visit</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="mode" 
                        value="video"
                        checked={formData.mode === 'video'}
                        onChange={() => setFormData({...formData, mode: 'video'})}
                      />
                      <span>Google Meet Video Call</span>
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Notes or Specific Discussion Points</label>
                  <textarea 
                    rows={3} 
                    placeholder="E.g., review marble samples for master foyer and discuss false ceiling recess lighting"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className={`${styles.formInput} ${styles.textarea}`}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  <CalendarCheck size={17} />
                  <span>Confirm Consultation Request</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
