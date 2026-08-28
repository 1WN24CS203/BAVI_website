'use client';

import { useState } from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Layers, 
  FileUp, 
  Sparkles,
  Check
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import styles from './projects.module.css';

export default function DesignerProjectsPage() {
  const [projects, setProjects] = useState([
    {
      id: 'p1',
      title: 'The Grand Serenity Villa',
      client: 'Rajesh Sharma',
      location: 'Indiranagar, Bengaluru',
      progress: 65,
      budget: '₹1.85 Cr',
      activeStage: 'Stage 3: Brick Masonry, Plumbing & Concealed Conduits',
      stages: [
        { id: 1, name: 'Architectural Blueprint & Sanction', status: 'completed' },
        { id: 2, name: 'Excavation & RCC Foundation Structure', status: 'completed' },
        { id: 3, name: 'Brick Masonry, Plumbing & Electrical Conduits', status: 'in_progress' },
        { id: 4, name: 'Flooring, False Ceiling & Premium Painting', status: 'pending' },
        { id: 5, name: 'Smart Home Automation & Final Handover', status: 'pending' },
      ]
    },
    {
      id: 'p2',
      title: 'Whitefield Penthouse Renovation',
      client: 'Pooja Reddy',
      location: 'Whitefield, Bengaluru',
      progress: 50,
      budget: '₹62 Lakh',
      activeStage: 'Stage 3: Bespoke Carpentry & Veneer Paneling',
      stages: [
        { id: 1, name: 'Concept Design & 3D Visual Mockups', status: 'completed' },
        { id: 2, name: 'Civil Alterations & Electrical Layouts', status: 'completed' },
        { id: 3, name: 'Bespoke Carpentry & Veneer Paneling', status: 'in_progress' },
        { id: 4, name: 'Modular Kitchen & Imported Quartz Countertops', status: 'pending' },
        { id: 5, name: 'Lighting, Painting & Final Styling', status: 'pending' },
      ]
    }
  ]);

  const [toast, setToast] = useState('');

  const handleStageApproval = (projectId, stageId) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const nextStages = p.stages.map(s => {
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
        subtitle="Approve construction stages, update progress, and release client sign-offs" 
      />

      <div className={styles.container}>
        {toast && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toast}</span>
          </div>
        )}

        <div className={styles.projectsList}>
          {projects.map((p) => (
            <div key={p.id} className={styles.projectCard}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.badgeGold}>Client: {p.client}</span>
                  <h3 className={styles.projectTitle}>{p.title}</h3>
                  <p className={styles.projectLocation}>{p.location} • Contract: <strong>{p.budget}</strong></p>
                </div>
                <div className={styles.progressBox}>
                  <span className={styles.progressNum}>{p.progress}%</span>
                  <span className={styles.progressLabel}>Overall Completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${p.progress}%` }} />
              </div>

              {/* Stage Approvals Table */}
              <div className={styles.stagesSection}>
                <h4 className={styles.stagesTitle}>Milestone Approval Roadmap</h4>
                <div className={styles.stagesGrid}>
                  {p.stages.map((stage) => (
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
      </div>
    </>
  );
}
