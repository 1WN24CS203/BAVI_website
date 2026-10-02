'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, Button, TextInput, TextArea, Toast, EmptyState } from '@/components/astryx';
import s from '../shared.module.css';

export default function ReviewsPage() {
  const { profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_client_reviews');
      if (stored) setReviewsList(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newRev = {
      id: Date.now(),
      title: title || 'Milestone Craftsmanship Feedback',
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

    setTitle('');
    setComment('');
    setToastMsg('Thank you! Your verified review has been recorded.');
    setToastVisible(true);
  };

  return (
    <div className={s.container}>
      <Toast 
        message={toastMsg} 
        variant="success" 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />

      {/* Header Banner */}
      <Card elevated style={{ padding: '28px 32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Badge variant="gold">Client Experience</Badge>
            <Badge variant="info">Quality &amp; Punctuality</Badge>
          </div>
          <h1 style={{ 
            fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", 
            fontSize: '1.75rem', 
            color: 'var(--astryx-text-primary)', 
            margin: 0 
          }}>
            Project Reviews &amp; Feedback
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--astryx-text-secondary)', margin: '4px 0 0', maxWidth: 640 }}>
            Your feedback guides our architectural execution and on-site craftsmen. Rate completed milestones and share your construction experience with our studio directors.
          </p>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Review Form */}
        <Card elevated>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--astryx-text-primary)', margin: '0 0 4px', fontWeight: 700 }}>
            Share Milestone Experience
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--astryx-text-muted)', marginBottom: 20 }}>
            Rate the craftsmanship, timeline punctuality, and designer responsiveness.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Star Picker */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--astryx-text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                Your Star Rating:
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'transform 0.15s ease',
                      transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)'
                    }}
                  >
                    <Star 
                      size={28} 
                      fill={(hoverRating || rating) >= star ? 'var(--astryx-gold)' : 'none'}
                      color={(hoverRating || rating) >= star ? 'var(--astryx-gold)' : 'var(--astryx-text-muted)'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: '0.85rem', color: 'var(--astryx-gold-light)', fontWeight: 700, marginLeft: 8 }}>
                  {hoverRating || rating} / 5
                </span>
              </div>
            </div>

            <TextInput
              label="Review Headline"
              placeholder="e.g. Exceptional attention to Italian marble alignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <TextArea
              label="Detailed Feedback"
              rows={4}
              placeholder="Describe the quality of finishes, responsiveness of the architect, and overall satisfaction..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />

            <div style={{ marginTop: 6 }}>
              <Button type="submit" variant="gold" icon={Send}>
                Submit Verified Review
              </Button>
            </div>
          </form>
        </Card>

        {/* Existing Reviews */}
        <Card elevated>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--astryx-text-primary)', margin: '0 0 4px', fontWeight: 700 }}>
            Your Submitted Reviews ({reviewsList.length})
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--astryx-text-muted)', marginBottom: 20 }}>
            Direct record of your ratings delivered to the executive design office.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviewsList.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No Reviews Yet"
                description="Use the form on the left to submit feedback on your latest construction milestone or design draft."
              />
            ) : (
              reviewsList.map((rev) => (
                <div 
                  key={rev.id} 
                  style={{
                    background: 'var(--astryx-surface-1)',
                    border: '1px solid var(--astryx-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={15} fill="var(--astryx-gold)" color="var(--astryx-gold)" />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--astryx-text-muted)' }}>{rev.date}</span>
                  </div>

                  <h3 style={{ fontSize: '0.98rem', color: 'var(--astryx-text-primary)', margin: 0, fontWeight: 600 }}>
                    {rev.title}
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--astryx-gold-light)', fontWeight: 500 }}>
                    {rev.milestone}
                  </span>
                  <p style={{ fontSize: '0.84rem', color: 'var(--astryx-text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <div style={{ fontSize: '0.76rem', color: 'var(--astryx-text-muted)', alignSelf: 'flex-end' }}>
                    — {rev.author}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
