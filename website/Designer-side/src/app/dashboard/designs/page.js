'use client';

import { useState } from 'react';
import { Sparkles, Plus, CheckCircle2, Eye, Trash2, Edit } from 'lucide-react';
import DesignerHeader from '@/components/Header';
import styles from './designs.module.css';

export default function DesignerDesignsPage() {
  const [designs, setDesigns] = useState([
    {
      id: 1,
      title: 'The Glass Pavilion Villa',
      category: 'Residential',
      location: 'Indiranagar, Bengaluru',
      desc: 'Modern minimalist cantilever residence overlooking landscaped nature sanctuary with gold window louvers.',
      isFeatured: true
    },
    {
      id: 2,
      title: 'Vertex Corporate Headquarters',
      category: 'Commercial',
      location: 'Outer Ring Road, Bengaluru',
      desc: 'State-of-the-art sustainable office hub with gold acoustic louvers and central atrium.',
      isFeatured: true
    },
    {
      id: 3,
      title: 'The Amber & Teak Penthouse',
      category: 'Interior',
      location: 'Lavelle Road, Bengaluru',
      desc: 'Bespoke warmth using aged Burmese teak, brushed brass coving, and ambient lighting.',
      isFeatured: true
    }
  ]);

  const [toast, setToast] = useState('');

  const toggleFeature = (id) => {
    const updated = designs.map(d => d.id === id ? { ...d, isFeatured: !d.isFeatured } : d);
    setDesigns(updated);
    setToast('Homepage Featured Portfolio updated!');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <>
      <DesignerHeader 
        title="Public Showcase & Highlighted Designs" 
        subtitle="Curate showcase projects featured on the public customer landing page" 
      />

      <div className={styles.container}>
        {toast && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toast}</span>
          </div>
        )}

        <div className={styles.grid}>
          {designs.map((d) => (
            <div key={d.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.badgeGold}>{d.category}</span>
                <button 
                  onClick={() => toggleFeature(d.id)}
                  className={d.isFeatured ? styles.badgeActive : styles.badgeInactive}
                >
                  {d.isFeatured ? '★ Featured on Homepage' : 'Hidden from Homepage'}
                </button>
              </div>

              <h3 className={styles.title}>{d.title}</h3>
              <span className={styles.location}>{d.location}</span>
              <p className={styles.desc}>{d.desc}</p>

              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => alert('Editing design details')}>
                  <Edit size={14} />
                  <span>Edit Showcase</span>
                </button>
                <a 
                  href="http://localhost:3000/projects" 
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
      </div>
    </>
  );
}
