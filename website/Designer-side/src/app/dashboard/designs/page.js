'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Plus, CheckCircle2, Eye, Trash2, Edit, Image as ImageIcon, X } from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './designs.module.css';

export default function DesignerDesignsPage() {
  const customerPortalUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  
  // New Design Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDesign, setNewDesign] = useState({
    title: '',
    category: 'Residential',
    location: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
    is_active: true
  });

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('highlighted_designs')
          .select('*')
          .order('created_at', { ascending: false });

        if (data) {
          setDesigns(data);
        }
      } catch (err) {
        console.warn('Supabase fetch fallback:', err);
      }
    }
    setLoading(false);
  };

  const toggleFeature = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    const updated = designs.map(d => d.id === id ? { ...d, is_active: nextStatus } : d);
    setDesigns(updated);

    if (isSupabaseConfigured()) {
      await supabase
        .from('highlighted_designs')
        .update({ is_active: nextStatus })
        .eq('id', id);
    }

    setToast(nextStatus ? 'Design published to Client Website!' : 'Design hidden from Client Website');
    setTimeout(() => setToast(''), 3000);
  };

  const handleCreateDesign = async (e) => {
    e.preventDefault();
    if (!newDesign.title || !newDesign.location) {
      alert('Please fill in title and location');
      return;
    }

    const createdItem = {
      ...newDesign,
      id: `des-${Date.now()}`,
      display_order: designs.length + 1
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('highlighted_designs').insert([newDesign]);
      } catch (err) {
        console.warn('Supabase save error:', err);
      }
    }

    setDesigns([createdItem, ...designs]);
    setShowAddModal(false);
    setNewDesign({
      title: '',
      category: 'Residential',
      location: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      is_active: true
    });
    setToast('New architectural showcase published successfully!');
    setTimeout(() => setToast(''), 3500);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this showcase item?')) return;
    setDesigns(designs.filter(d => d.id !== id));
    if (isSupabaseConfigured()) {
      await supabase.from('highlighted_designs').delete().eq('id', id);
    }
    setToast('Showcase item deleted');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <>
      <DesignerHeader 
        title="Public Showcase & Design Manager" 
        subtitle="Upload and manage real architectural projects and interior showcases displayed on the client website" 
      />

      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
              Design Portfolio ({designs.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Items marked "Active" are instantly visible to visitors on the Customer Portal
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
              color: 'var(--color-black)',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Upload New Design</span>
          </button>
        </div>

        {toast && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toast}</span>
          </div>
        )}

        {designs.length > 0 ? (
          <div className={styles.grid}>
            {designs.map((d) => (
              <div key={d.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.badgeGold}>{d.category}</span>
                  <button 
                    onClick={() => toggleFeature(d.id, d.is_active)}
                    className={d.is_active ? styles.badgeActive : styles.badgeInactive}
                  >
                    {d.is_active ? '★ Live on Client Site' : 'Hidden from Client Site'}
                  </button>
                </div>

                <h3 className={styles.title}>{d.title}</h3>
                <span className={styles.location}>{d.location}</span>
                <p className={styles.desc}>{d.description}</p>

                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => handleDelete(d.id)} style={{ color: '#f87171' }}>
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                  <a 
                    href={`${customerPortalUrl}/projects`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.previewBtn}
                  >
                    <Eye size={14} />
                    <span>Live Preview</span>
                  </a>
                </div>
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
            <ImageIcon size={36} color="var(--color-gold)" />
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#f8f8f8', marginBottom: '6px' }}>
                No Designs Uploaded Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                Click <strong>"Upload New Design"</strong> to add real project photos, locations, and descriptions. They will be displayed live on the client website.
              </p>
            </div>
          </div>
        )}

        {/* Modal for Adding New Design */}
        {showAddModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
            <div className={styles.addModal} onClick={(e) => e.stopPropagation()} style={{
              background: '#141414',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  Upload New Project Showcase
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateDesign} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Project Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Modern Minimalist Villa"
                    value={newDesign.title}
                    onChange={(e) => setNewDesign({ ...newDesign, title: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Category</label>
                    <select
                      value={newDesign.category}
                      onChange={(e) => setNewDesign({ ...newDesign, category: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Interior">Interior</option>
                      <option value="Renovation">Renovation</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Location</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Indiranagar, Bengaluru"
                      value={newDesign.location}
                      onChange={(e) => setNewDesign({ ...newDesign, location: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Project Photo / Render URL</label>
                  <input 
                    type="text"
                    required
                    placeholder="https://..."
                    value={newDesign.image_url}
                    onChange={(e) => setNewDesign({ ...newDesign, image_url: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe architectural features, area, materials used..."
                    value={newDesign.description}
                    onChange={(e) => setNewDesign({ ...newDesign, description: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff', resize: 'vertical' }}
                  />
                </div>

                <button 
                  type="submit"
                  style={{
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
                    color: '#000',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  Publish Showcase to Website
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
