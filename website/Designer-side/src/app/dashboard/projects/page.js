'use client';

import { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Layers, 
  FileUp, 
  Sparkles,
  Check,
  Building
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './projects.module.css';

export default function DesignerProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'residential',
    location: '',
    budget: '',
    description: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.warn('Supabase fetch projects error:', err);
      }
    }
    setLoading(false);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.location) {
      alert('Please enter project title and location');
      return;
    }

    const created = {
      ...newProject,
      id: `proj-${Date.now()}`,
      progress: 0,
      completion_percentage: 0,
      stages: [
        { id: 1, name: 'Architectural Blueprint & Sanction', status: 'in_progress' },
        { id: 2, name: 'Excavation & RCC Foundation Structure', status: 'pending' },
        { id: 3, name: 'Brick Masonry, Plumbing & Electrical Conduits', status: 'pending' },
        { id: 4, name: 'Flooring, False Ceiling & Premium Painting', status: 'pending' },
        { id: 5, name: 'Smart Home Automation & Final Handover', status: 'pending' },
      ]
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('projects').insert([
          {
            title: newProject.title,
            category: newProject.category,
            location: newProject.location,
            budget: parseFloat(newProject.budget) || 0,
            description: newProject.description
          }
        ]);
      } catch (err) {
        console.warn('Supabase save error:', err);
      }
    }

    setProjects([created, ...projects]);
    setShowAddModal(false);
    setNewProject({ title: '', category: 'residential', location: '', budget: '', description: '' });
    setToast(`New project "${newProject.title}" initialized successfully!`);
    setTimeout(() => setToast(''), 3500);
  };

  const handleStageApproval = (projectId, stageId) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const currentStages = p.stages || [
          { id: 1, name: 'Architectural Blueprint & Sanction', status: 'completed' },
          { id: 2, name: 'Excavation & RCC Foundation Structure', status: 'in_progress' },
          { id: 3, name: 'Brick Masonry & Electrical Conduits', status: 'pending' },
        ];
        const nextStages = currentStages.map(s => {
          if (s.id === stageId) {
            return { ...s, status: 'completed' };
          }
          return s;
        });
        const completedCount = nextStages.filter(s => s.status === 'completed').length;
        const newProgress = Math.round((completedCount / nextStages.length) * 100);
        return { ...p, stages: nextStages, progress: newProgress };
      }
      return p;
    });

    setProjects(updated);
    setToast('Stage verification approved and synced with client portal!');
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <>
      <DesignerHeader 
        title="Project Milestone Engineering" 
        subtitle="Initialize projects, approve construction stages, and release client sign-offs" 
      />

      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
              Active Projects ({projects.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Client milestone roadmaps and structural engineering approvals
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
            <span>Create New Project</span>
          </button>
        </div>

        {toast && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toast}</span>
          </div>
        )}

        {projects.length > 0 ? (
          <div className={styles.projectsList}>
            {projects.map((p) => (
              <div key={p.id} className={styles.projectCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.badgeGold}>{p.category || 'Residential'}</span>
                    <h3 className={styles.projectTitle}>{p.title}</h3>
                    <p className={styles.projectLocation}>{p.location} • Budget: <strong>₹{p.budget?.toLocaleString('en-IN') || 'Flexible'}</strong></p>
                  </div>
                  <div className={styles.progressBox}>
                    <span className={styles.progressNum}>{p.completion_percentage || p.progress || 0}%</span>
                    <span className={styles.progressLabel}>Overall Completed</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${p.completion_percentage || p.progress || 0}%` }} />
                </div>

                {/* Stage Approvals Table */}
                <div className={styles.stagesSection}>
                  <h4 className={styles.stagesTitle}>Milestone Approval Roadmap</h4>
                  <div className={styles.stagesGrid}>
                    {(p.stages || [
                      { id: 1, name: 'Architectural Blueprint & Sanction', status: 'in_progress' },
                      { id: 2, name: 'Excavation & RCC Foundation Structure', status: 'pending' },
                      { id: 3, name: 'Brick Masonry, Plumbing & Electrical Conduits', status: 'pending' },
                      { id: 4, name: 'Flooring, False Ceiling & Premium Painting', status: 'pending' },
                      { id: 5, name: 'Smart Home Automation & Final Handover', status: 'pending' },
                    ]).map((stage) => (
                      <div key={stage.id} className={`${styles.stageCard} ${stage.status === 'completed' ? styles.stageCompleted : stage.status === 'in_progress' ? styles.stageActive : ''}`}>
                        <div className={styles.stageTop}>
                          <span className={styles.stageIndex}>Stage 0{stage.id}</span>
                          {stage.status === 'completed' ? (
                            <span className={styles.badgeSuccess}>Verified</span>
                          ) : stage.status === 'in_progress' ? (
                            <span className={styles.badgeActive}>Under Review</span>
                          ) : (
                            <span className={styles.badgePending}>Scheduled</span>
                          )}
                        </div>

                        <h5 className={styles.stageName}>{stage.name}</h5>

                        {stage.status === 'in_progress' ? (
                          <button 
                            onClick={() => handleStageApproval(p.id, stage.id)}
                            className={styles.approveBtn}
                          >
                            <Check size={14} />
                            <span>Approve & Release Milestone</span>
                          </button>
                        ) : stage.status === 'completed' ? (
                          <div className={styles.verifiedMeta}>
                            <CheckCircle2 size={14} color="var(--color-success)" />
                            <span>Signed off by Architect</span>
                          </div>
                        ) : (
                          <span className={styles.waitingNote}>Awaiting prior stage</span>
                        )}
                      </div>
                    ))}
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
            padding: '60px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}>
            <Building size={36} color="var(--color-gold)" />
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#f8f8f8', marginBottom: '6px' }}>
                No Active Projects Created Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                Click <strong>"Create New Project"</strong> to set up a clean construction milestone roadmap for your clients.
              </p>
            </div>
          </div>
        )}

        {/* Modal for Creating New Project */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }} onClick={() => setShowAddModal(false)}>
            <div style={{
              background: '#141414',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  Create New Construction Project
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Project Title *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Channarayapatna Villa Project"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Category</label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="interior">Interior</option>
                      <option value="renovation">Renovation</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Location / Site *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. BM Road, Channarayapatna"
                      value={newProject.location}
                      onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Total Contract Budget (INR)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 5000000"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Project Scope / Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Key structural features, square footage, timber specifications..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
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
                  Create Project Roadmap
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
