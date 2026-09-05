'use client';

import { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, ThumbsUp, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './reviews.module.css';

export default function ReviewsPage() {
  const { profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [reviewsList, setReviewsList] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_client_reviews');
      if (stored) setReviewsList(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment) return;

    const newRev = {
      id: Date.now(),
      title: title || 'Milestone Feedback',
      rating,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      milestone: 'Current Stage Progress Feedback',
      comment,
      author: profile?.full_name || 'Valued Client'
    };

    const updated = [newRev, ...reviewsList];
    setReviewsList(updated);
    try {
      localStorage.setItem('bavi_client_reviews', JSON.stringify(updated));
    } catch {}
    setSubmitted(true);
    setTitle('');
    setComment('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <div className={styles.headerCard}>
        <div>
          <span className={styles.badgeGold}>Client Experience</span>
          <h2 className={styles.title}>Project Reviews & Feedback</h2>
          <p className={styles.subtitle}>
            Your feedback guides our craftsmanship. Rate completed milestones and share your construction experience with our leadership team.
          </p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Review Form */}
        <div className={styles.formCard}>
          <h3 className={styles.cardTitle}>Share Milestone Experience</h3>
          <p className={styles.cardSub}>Rate the craftsmanship, timeline punctuality, and communication</p>

          {submitted && (
            <div className={styles.successToast}>
              <CheckCircle2 size={20} color="var(--color-success)" />
              <span>Thank you! Your verified review has been submitted to the BAVI management team.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Star Picker */}
            <div className={styles.starRow}>
              <span className={styles.starLabel}>Your Rating:</span>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={styles.starBtn}
                  >
                    <Star 
                      size={28} 
                      fill={(hoverRating || rating) >= star ? 'var(--color-gold)' : 'none'}
                      color={(hoverRating || rating) >= star ? 'var(--color-gold)' : 'var(--color-text-muted)'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Review Headline</label>
              <input 
                type="text" 
                placeholder="E.g., Exceptional attention to Italian marble alignment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Detailed Feedback</label>
              <textarea 
                rows={4}
                placeholder="Describe the quality of materials, responsiveness of the designer, and overall satisfaction..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={`${styles.formInput} ${styles.textarea}`}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              <Send size={16} />
              <span>Submit Review</span>
            </button>
          </form>
        </div>

        {/* Existing Reviews */}
        <div className={styles.reviewsSide}>
          <h3 className={styles.cardTitle}>Your Submitted Reviews</h3>
          <div className={styles.reviewsList}>
            {reviewsList.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px dashed rgba(255,255,255,0.08)',
                color: '#888',
                fontSize: '0.85rem'
              }}>
                <MessageSquare size={28} style={{ color: 'var(--astryx-gold)', marginBottom: '8px' }} />
                <p style={{ margin: 0 }}>No reviews submitted yet. Use the form on the left to submit your feedback on any completed milestone.</p>
              </div>
            ) : (
              reviewsList.map((rev) => (
                <div key={rev.id} className={styles.reviewItem}>
                  <div className={styles.revTop}>
                    <div className={styles.revStars}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="var(--color-gold)" color="var(--color-gold)" />
                      ))}
                    </div>
                    <span className={styles.revDate}>{rev.date}</span>
                  </div>
                  <h4 className={styles.revTitle}>{rev.title}</h4>
                  <span className={styles.revMilestone}>{rev.milestone}</span>
                  <p className={styles.revComment}>&ldquo;{rev.comment}&rdquo;</p>
                  <div className={styles.revAuthor}>— {rev.author}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
