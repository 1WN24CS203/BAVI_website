'use client';

import { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowDownToLine, 
  Layers, 
  FileCheck2, 
  Sparkles,
  Building,
  Check,
  ShieldCheck,
  AlertCircle,
  FileText,
  UserCheck,
  Download,
  Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Badge, Card } from '@/components/astryx';
import styles from './project.module.css';

export default function MyProjectPage() {
  const { profile } = useAuth();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones');
  const [approvalNotification, setApprovalNotification] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_client_active_project');
      if (stored) {
        setProject(JSON.parse(stored));
      } else {
        // Also check if any project exists in bavi_projects
        const projectsList = localStorage.getItem('bavi_projects');
        if (projectsList) {
          const parsed = JSON.parse(projectsList);
          if (parsed && parsed.length > 0) {
            setProject(parsed[0]);
            return;
          }
        }
        setProject(null);
      }
    } catch {
      setProject(null);
    }
  }, []);

  const saveProject = (updated) => {
    setProject(updated);
    try {
      localStorage.setItem('bavi_client_active_project', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClientApproveStage = (stageId) => {
    const updatedMilestones = project.milestones.map(m => {
      if (m.id === stageId) {
        const isNowCompleted = m.builderApproved; // If builder already approved, both permissions are now met!
        return {
          ...m,
          clientApproved: true,
          status: isNowCompleted ? 'COMPLETED' : 'AWAITING_BUILDER_APPROVAL',
        };
      }
      return m;
    });

    const updatedProject = {
      ...project,
      milestones: updatedMilestones,
    };

    saveProject(updatedProject);
    setApprovalNotification(`You have successfully authorized Stage ${stageId}. Dual permission verification recorded.`);
    setTimeout(() => setApprovalNotification(null), 5000);
  if (!project) {
    return (
      <div className={styles.container}>
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          border: '1px dashed rgba(255,255,255,0.1)',
          maxWidth: '700px',
          margin: '40px auto'
        }}>
          <FolderKanban size={48} style={{ color: 'var(--astryx-gold, #c9a84c)', marginBottom: '16px' }} />
          <h2 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 8px' }}>No Active Project Assigned Yet</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            Your architectural roadmap, stage-by-stage document uploads, and dual-permission milestone verification will appear here once your design contract is activated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Project Header Banner */}
      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div>
            <span className={styles.badgeGold}>{project.category}</span>
            <h2 className={styles.projectTitle}>{project.title}</h2>
            <p className={styles.projectLocation}>{project.location}</p>
          </div>
          <div className={styles.statusBadgeBox}>
            <span className={styles.statusLabel}>Project Status</span>
            <span className={styles.statusValue}>{project.status}</span>
          </div>
        </div>

        <p className={styles.projectDesc}>{project.description}</p>

        {/* Dual Authority Info Banner */}
        <div style={{
          margin: '16px 0',
          padding: '12px 18px',
          borderRadius: '8px',
          background: 'rgba(201, 168, 76, 0.08)',
          border: '1px solid rgba(201, 168, 76, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.84rem',
          color: '#ddd'
        }}>
          <ShieldCheck size={22} style={{ color: 'var(--astryx-gold, #c9a84c)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--astryx-gold-light, #e0c57b)' }}>Dual Permission Milestone Rule: </strong>
            To protect your investment, every milestone stage must receive formal authorization from <strong>both the Builder and the Client</strong> before completion and escrow fund disbursement.
          </div>
        </div>

        {/* Project Meta Cards */}
        <div className={styles.metaRow}>
          <div className={styles.metaBox}>
            <span className={styles.metaBoxLabel}>Client</span>
            <span className={styles.metaBoxValue}>{profile?.full_name || project.clientName}</span>
          </div>
          <div className={styles.metaBox}>
            <span className={styles.metaBoxLabel}>Lead Builder / Architect</span>
            <span className={styles.metaBoxValue}>{project.builderName}</span>
          </div>
          <div className={styles.metaBox}>
            <span className={styles.metaBoxLabel}>Total Contract</span>
            <span className={styles.metaBoxValue}>{project.budget}</span>
          </div>
          <div className={styles.metaBox}>
            <span className={styles.metaBoxLabel}>Amount Paid</span>
            <span className={styles.metaBoxValueGold}>{project.paid}</span>
          </div>
        </div>
      </div>

      {approvalNotification && (
        <div style={{
          background: 'rgba(74, 222, 128, 0.12)',
          border: '1px solid #4ade80',
          color: '#4ade80',
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{approvalNotification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabsRow}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'milestones' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          <Layers size={17} />
          <span>Milestone Roadmap & Dual Permissions ({project.milestones.length} Stages)</span>
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileCheck2 size={17} />
          <span>Stage Documents & Blueprints</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'milestones' ? (
        <div className={styles.milestonesList}>
          {project.milestones.map((milestone, idx) => {
            const isCompleted = milestone.status === 'COMPLETED' || (milestone.builderApproved && milestone.clientApproved);
            const isAwaitingClient = milestone.builderApproved && !milestone.clientApproved;

            return (
              <div 
                key={milestone.id} 
                className={`${styles.milestoneCard} ${
                  isCompleted ? styles.milestoneCompleted :
                  isAwaitingClient ? styles.milestoneActive : styles.milestonePending
                }`}
              >
                <div className={styles.milestoneIndicator}>
                  {isCompleted ? (
                    <div className={styles.iconCompleted}><Check size={16} /></div>
                  ) : isAwaitingClient ? (
                    <div className={styles.iconActive}><Clock size={16} /></div>
                  ) : (
                    <div className={styles.iconPending}>{idx + 1}</div>
                  )}
                  {idx < project.milestones.length - 1 && <div className={styles.connectorLine} />}
                </div>

                <div className={styles.milestoneContent}>
                  <div className={styles.milestoneTopBar}>
                    <div>
                      <span className={styles.stageTag}>Stage 0{idx + 1}</span>
                      <h3 className={styles.milestoneCardTitle}>{milestone.title}</h3>
                    </div>
                    <div className={styles.milestoneAmountBox}>
                      <span className={styles.amountLabel}>Milestone Value</span>
                      <span className={styles.milestoneAmount}>{milestone.amount}</span>
                    </div>
                  </div>

                  <p className={styles.milestoneCardDesc}>{milestone.desc}</p>

                  {/* Dual Permission Status Badges */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    margin: '14px 0',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                      <span style={{ color: '#888' }}>Builder Permission:</span>
                      {milestone.builderApproved ? (
                        <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <CheckCircle2 size={13} /> Approved by Builder
                        </span>
                      ) : (
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={13} /> Pending Builder Review
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                      <span style={{ color: '#888' }}>Client Permission:</span>
                      {milestone.clientApproved ? (
                        <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <CheckCircle2 size={13} /> Signed Off by You
                        </span>
                      ) : (
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <AlertCircle size={13} /> Pending Your Sign-Off
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stage Attached Documents */}
                  {milestone.documents && milestone.documents.length > 0 && (
                    <div style={{ margin: '12px 0' }}>
                      <span style={{ fontSize: '0.78rem', color: '#888', display: 'block', marginBottom: '6px' }}>
                        Uploaded Stage Verification Documents ({milestone.documents.length}):
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {milestone.documents.map((doc, dIdx) => (
                          <div
                            key={dIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              fontSize: '0.8rem',
                              color: '#eee'
                            }}
                          >
                            <FileText size={14} style={{ color: 'var(--astryx-gold)' }} />
                            <span>{doc.name}</span>
                            <span style={{ color: '#777', fontSize: '0.72rem' }}>({doc.size})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div className={styles.milestoneFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div className={styles.dateMeta}>
                      <Calendar size={14} />
                      <span>Target Due Date: <strong>{milestone.date}</strong></span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {isCompleted ? (
                        <span className={styles.statusPill} style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                          <CheckCircle2 size={13} style={{ marginRight: '4px' }} />
                          Completed (Dual Authorized)
                        </span>
                      ) : !milestone.clientApproved ? (
                        <button
                          onClick={() => handleClientApproveStage(milestone.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            background: 'var(--astryx-gold, #c9a84c)',
                            color: '#0a0a0a',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(201, 168, 76, 0.3)'
                          }}
                        >
                          <Check size={14} />
                          <span>Authorize & Sign Off Stage</span>
                        </button>
                      ) : (
                        <span style={{ color: '#fbbf24', fontSize: '0.8rem' }}>
                          Awaiting Builder Final Sign-off
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.documentsGrid}>
          {project.milestones.flatMap(m => m.documents || []).concat([
            { name: 'Sanctioned_Floor_Plan_V3.dwg', size: '18.5 MB', desc: 'BBMP Approved drawings, structural column loads and elevation sections.' },
            { name: 'Interior_Material_Specification_Schedule.pdf', size: '6.2 MB', desc: 'Botticino Marble grade A, Hafele hardware, Saint-Gobain toughened glass specs.' },
            { name: 'Geotechnical_Soil_Report.pdf', size: '3.1 MB', desc: 'Certified geotechnical analysis for multi-storey residential load compliance.' }
          ]).map((doc, idx) => (
            <div key={idx} className={styles.documentCard}>
              <div className={styles.docIconBox}><FileText size={24} /></div>
              <div className={styles.docMain}>
                <h4 className={styles.docTitle}>{doc.name}</h4>
                <p className={styles.docDesc}>{doc.desc || 'Stage milestone engineering verification document uploaded by builder.'}</p>
                <span className={styles.docSize}>{doc.size} • Verified</span>
              </div>
              <button className={styles.downloadBtn}>
                <ArrowDownToLine size={16} />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
