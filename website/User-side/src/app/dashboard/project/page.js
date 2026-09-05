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

const DEFAULT_PROJECT = {
  id: 'proj-1',
  title: 'Villa Serenity Penthouse',
  category: 'Luxury Residential Turnkey & Interior',
  location: 'Sadashivanagar, Bengaluru',
  status: 'In Progress (65%)',
  budget: '₹ 1,85,00,000',
  paid: '₹ 74,00,000',
  clientName: 'Vikramaditya Roy',
  builderName: 'Arun Bahubali (Principal Architect)',
  startDate: '15 Jan 2026',
  estCompletion: '30 Nov 2026',
  description: '4BHK Ultra-Luxury contemporary penthouse with 5,200 sq.ft built-up area. Double-height living foyer, cantilevered master balconies, Italian Botticino marble, automated smart facades.',
  milestones: [
    {
      id: 'stg-1',
      stageNumber: 1,
      title: 'Architectural Blueprint & Municipal BBMP Sanction',
      date: '10 Feb 2026',
      amount: '₹ 20,00,000',
      desc: 'Structural engineering drawings, soil bearing capacity reports, and BBMP municipal plan sanction.',
      builderApproved: true,
      clientApproved: true,
      status: 'COMPLETED',
      documents: [
        { name: 'BBMP_Sanction_Permit_Signed.pdf', size: '4.1 MB', type: 'pdf' },
        { name: 'Structural_Load_Calculations.dwg', size: '28.6 MB', type: 'cad' }
      ]
    },
    {
      id: 'stg-2',
      stageNumber: 2,
      title: 'Civil Structure, Plinth & Column Reinforcement',
      date: '25 Apr 2026',
      amount: '₹ 54,00,000',
      desc: 'Excavation, plinth beams, column casting, and ground/first floor RCC slab casting with M35 grade concrete.',
      builderApproved: true,
      clientApproved: true,
      status: 'COMPLETED',
      documents: [
        { name: 'Concrete_Cube_Strength_Test_28Days.pdf', size: '3.2 MB', type: 'pdf' },
        { name: 'Site_Plinth_Survey_Certified.pdf', size: '5.8 MB', type: 'pdf' }
      ]
    },
    {
      id: 'stg-3',
      stageNumber: 3,
      title: 'Brick Masonry, Plumbing & Electrical Rough-in',
      date: '31 Jul 2026',
      amount: '₹ 45,00,000',
      desc: 'Double-coat clay brickwork, concealed Finolex flame-retardant wiring, and Astral SDR-11 acoustic plumbing lines.',
      builderApproved: true,
      clientApproved: false, // Client can sign off here!
      status: 'AWAITING_CLIENT_APPROVAL',
      documents: [
        { name: 'Concealed_Conduit_Inspection_Log.pdf', size: '2.9 MB', type: 'pdf' },
        { name: 'Hydrostatic_Plumbing_Test_Report.pdf', size: '1.8 MB', type: 'pdf' }
      ]
    },
    {
      id: 'stg-4',
      stageNumber: 4,
      title: 'Italian Marble Laying & False Ceiling Framing',
      date: '30 Sep 2026',
      amount: '₹ 40,00,000',
      desc: 'Imported Statuario marble dry-lay layout, Gyproc designer perimeter ceiling, and primer coats.',
      builderApproved: false,
      clientApproved: false,
      status: 'SCHEDULED',
      documents: []
    },
    {
      id: 'stg-5',
      stageNumber: 5,
      title: 'Smart Home Automation, Styling & Handover',
      date: '30 Nov 2026',
      amount: '₹ 26,00,000',
      desc: 'KNX scene lighting, bespoke millwork, landscape illuminations, and ceremonial handover.',
      builderApproved: false,
      clientApproved: false,
      status: 'SCHEDULED',
      documents: []
    },
  ]
};

export default function MyProjectPage() {
  const { profile } = useAuth();
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [activeTab, setActiveTab] = useState('milestones');
  const [approvalNotification, setApprovalNotification] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_client_active_project');
      if (stored) {
        setProject(JSON.parse(stored));
      } else {
        setProject(DEFAULT_PROJECT);
        localStorage.setItem('bavi_client_active_project', JSON.stringify(DEFAULT_PROJECT));
      }
    } catch {
      setProject(DEFAULT_PROJECT);
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
  };

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
