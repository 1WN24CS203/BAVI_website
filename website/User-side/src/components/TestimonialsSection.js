'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './TestimonialsSection.module.css';

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setReviews(data);
          } else {
            setReviews([]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <section className={styles.section} id="testimonials">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={13} />
            <span>Client Reviews</span>
          </div>
          <h2 className={styles.title}>
            Client <span className={styles.goldText}>Feedback</span> & Reviews
          </h2>
          <p className={styles.subtitle}>
            Read verified feedback from our clients as construction stages complete.
          </p>
        </div>

        {/* Dynamic Reviews / Clean Empty State */}
        {reviews.length > 0 ? (
          <div className={styles.testimonialsGrid}>
            {reviews.map((item, idx) => (
              <div key={item.id || idx} className={styles.testimonialCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.starsRow}>
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} className={styles.starIcon} fill="currentColor" />
                    ))}
                  </div>
                  <Quote size={24} className={styles.quoteIcon} />
                </div>

                <p className={styles.quoteText}>"{item.review_text || item.title}"</p>

                <div className={styles.cardFooter}>
                  <div className={styles.avatarCircle}>
                    {(item.customer_name || 'Client').charAt(0)}
                  </div>
                  <div className={styles.authorInfo}>
                    <div className={styles.nameRow}>
                      <span className={styles.authorName}>{item.customer_name || 'Verified Client'}</span>
                      <ShieldCheck size={14} className={styles.verifiedIcon} title="Verified Client" />
                    </div>
                    <div className={styles.projectTag}>{item.title || 'Architectural Commission'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--color-dark)',
            border: '1px dashed rgba(201, 168, 76, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '50px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            marginTop: '20px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(201, 168, 76, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold)'
            }}>
              <MessageSquare size={26} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#f8f8f8', marginBottom: '6px' }}>
                Client Reviews Uploading Soon
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
                Client testimonials and ratings will appear here as project milestones clear in real-time.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
