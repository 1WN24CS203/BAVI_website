'use client';

import { useState, useEffect } from 'react';
import { 
  FolderKanban, CheckCircle2, Clock, AlertCircle, Layers, FileCheck2, Sparkles,
  Building, Check, ShieldCheck, FileText, Download, Eye,
  MessageSquare, Send, X, ChevronDown, ChevronUp, GitBranch, Archive,
  RefreshCw, ArrowDownToLine
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Badge, Card } from '@/components/astryx';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './project.module.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getDocIcon = (type) => {
  if (!type) return '📄';
  if (type.includes('image')) return '🖼️';
  if (type.includes('pdf')) return '📋';
  if (type.includes('video')) return '🎬';
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '📊';
  if (type.includes('zip') || type.includes('rar')) return '📦';
  if (type.includes('word') || type.includes('doc')) return '📝';
  return '📄';
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MyProjectPage() {
  const { profile } = useAuth();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('milestones');
  const [approvalNotification, setApprovalNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState(null);

  // Query system
  const [queryModal, setQueryModal] = useState(null); // { stageId, stageName }
  const [queryText, setQueryText] = useState('');
  const [querySent, setQuerySent] = useState(false);

  // Document preview
  const [viewDoc, setViewDoc] = useState(null);

  // ── Data Loading ─────────────────────────────────────────────────────────

  const normalizeProject = (p) => {
    if (!p) return null;
    const stages = (p.stages && Array.isArray(p.stages) && p.stages.length > 0)
      ? p.stages
      : (p.milestones || [
          { id: 1, name: 'Requirement Analysis & SRS Preparation', status: 'in_progress', builder_approved: true, client_approved: false, progress: 20, documents: [], queries: [] },
          { id: 2, name: 'Architectural Blueprint & Sanction', status: 'pending', builder_approved: false, client_approved: false, progress: 0, documents: [], queries: [] },
          { id: 3, name: 'Excavation & RCC Foundation Structure', status: 'pending', builder_approved: false, client_approved: false, progress: 0, documents: [], queries: [] },
          { id: 4, name: 'Brick Masonry, Plumbing & Electrical Conduits', status: 'pending', builder_approved: false, client_approved: false, progress: 0, documents: [], queries: [] },
          { id: 5, name: 'Flooring, False Ceiling & Premium Painting', status: 'pending', builder_approved: false, client_approved: false, progress: 0, documents: [], queries: [] },
          { id: 6, name: 'Smart Home Automation & Final Handover', status: 'pending', builder_approved: false, client_approved: false, progress: 0, documents: [], queries: [] },
        ]);

    const normalizedStages = stages.map(s => {
      const bApp = Boolean(s.builderApproved ?? s.builder_approved ?? false);
      const cApp = Boolean(s.clientApproved ?? s.client_approved ?? false);
      let st = (s.status || 'pending').toLowerCase();
      if (bApp && cApp) st = 'completed';
      else if (bApp) st = 'awaiting_client';
      else if (st === 'in_progress' || st === 'in progress') st = 'in_progress';

      return {
        id: s.id,
        name: s.title || s.name || `Stage ${s.id}`,
        description: s.description || s.desc || 'Construction milestone verified by BAVI architects.',
        status: st,
        progress: s.progress ?? (bApp && cApp ? 100 : bApp ? 75 : 0),
        builderApproved: bApp,
        clientApproved: cApp,
        documents: s.documents || [],
        queries: s.queries || [],
        date: s.date || s.due_date || '',
      };
    });

    return {
      ...p,
      title: p.title || 'My Residence Project',
      location: p.location || 'Bengaluru / Channarayapatna',
      budget: p.budget || '–',
      progress: p.progress ?? p.completion_percentage ?? Math.round(normalizedStages.reduce((a, s) => a + (s.progress || 0), 0) / Math.max(1, normalizedStages.length)),
      stages: normalizedStages,
      milestones: normalizedStages,
    };
  };

  const fetchProject = async () => {
    let found = null;

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('projects').select('*');
        if (profile?.email) query = query.or(`client_email.eq.${profile.email},customer_id.eq.${profile.id}`);
        const { data } = await query.order('created_at', { ascending: false }).limit(1);
        if (data && data.length > 0) {
          found = data[0];
        } else {
          const { data: latest } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(1);
          if (latest && latest.length > 0) found = latest[0];
        }
      } catch (err) { console.warn('Supabase fetch error:', err); }
    }

    if (!found) {
      try {
        // Try full version first (with base64 docs)
        const full = localStorage.getItem('bavi_projects_full');
        const active = localStorage.getItem('bavi_client_active_project');
        const listSrc = localStorage.getItem('bavi_projects');

        if (active) {
          found = JSON.parse(active);
        } else if (full) {
          const parsed = JSON.parse(full);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Try to match by email
            found = parsed.find(p => p.client_email === profile?.email) || parsed[0];
          }
        } else if (listSrc) {
          const parsed = JSON.parse(listSrc);
          if (Array.isArray(parsed) && parsed.length > 0) {
            found = parsed.find(p => p.client_email === profile?.email) || parsed[0];
          }
        }
      } catch {}
    }

    setProject(normalizeProject(found));
    setLoading(false);
  };

  useEffect(() => {
    fetchProject();
  }, [profile]);

  // Poll for updates (Designer may update project)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProject();
    }, 30000); // Re-fetch every 30s
    return () => clearInterval(interval);
  }, [profile]);

  const saveProjectLocal = (updated) => {
    setProject(updated);
    try {
      localStorage.setItem('bavi_client_active_project', JSON.stringify(updated));
      // Also update in bavi_projects
      const src = localStorage.getItem('bavi_projects_full') || localStorage.getItem('bavi_projects');
      if (src) {
        const list = JSON.parse(src);
        if (Array.isArray(list)) {
          const idx = list.findIndex(p => p.id === updated.id);
          if (idx >= 0) {
            list[idx] = { ...list[idx], stages: updated.stages };
            localStorage.setItem('bavi_projects_full', JSON.stringify(list));
            localStorage.setItem('bavi_projects', JSON.stringify(list));
          }
        }
      }
    } catch (e) { console.warn(e); }
  };

  // ── Client Approve Stage ──────────────────────────────────────────────────

  const handleClientApproveStage = async (stageId) => {
    if (!project) return;
    const updatedStages = project.stages.map(s => {
      if (s.id !== stageId) return s;
      const isCompleted = s.builderApproved;
      return {
        ...s,
        clientApproved: true,
        client_approved: true,
        status: isCompleted ? 'completed' : 'awaiting_builder',
      };
    });
    const overall = Math.round(updatedStages.reduce((a, s) => a + (s.progress || 0), 0) / Math.max(1, updatedStages.length));
    const updated = { ...project, stages: updatedStages, milestones: updatedStages, progress: overall };
    saveProjectLocal(updated);

    if (isSupabaseConfigured() && project.id && !String(project.id).startsWith('proj-')) {
      try {
        await supabase.from('projects').update({ stages: updatedStages, completion_percentage: overall }).eq('id', project.id);
      } catch (err) { console.warn('Supabase approval error:', err); }
    }

    setApprovalNotification(`Stage authorized! BAVI team has been notified. Dual permission verification recorded.`);
    setTimeout(() => setApprovalNotification(null), 6000);
  };

  // ── Raise Query ───────────────────────────────────────────────────────────

  const handleRaiseQuery = () => {
    if (!queryText.trim() || !queryModal) return;
    const query = {
      id: `query-${Date.now()}`,
      stageId: queryModal.stageId,
      message: queryText.trim(),
      raisedBy: profile?.full_name || 'Client',
      raisedAt: new Date().toISOString(),
      resolved: false,
      reply: null,
    };

    const updatedStages = project.stages.map(s => {
      if (s.id !== queryModal.stageId) return s;
      return { ...s, queries: [...(s.queries || []), query] };
    });
    const updated = { ...project, stages: updatedStages, milestones: updatedStages };
    saveProjectLocal(updated);
    setQueryText('');
    setQuerySent(true);
    setTimeout(() => { setQuerySent(false); setQueryModal(null); }, 2500);
    setApprovalNotification('Your query has been sent to the design team. You will receive a reply soon.');
    setTimeout(() => setApprovalNotification(null), 6000);
  };

  // ── Download Doc ──────────────────────────────────────────────────────────

  const handleDownloadDoc = (doc) => {
    if (!doc.data) {
      alert('This document was recorded without file content. Please contact your architect to re-upload.');
      return;
    }
    const a = document.createElement('a');
    a.href = doc.data;
    a.download = doc.name;
    a.click();
  };

  // ── Loading / Empty States ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6e6e6e' }}>
          <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: '16px' }}>
            <RefreshCw size={32} />
          </div>
          <p>Loading your project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)', maxWidth: '700px', margin: '40px auto' }}>
          <FolderKanban size={48} style={{ color: 'var(--astryx-gold, #c9a84c)', marginBottom: '16px' }} />
          <h2 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 8px' }}>No Active Project Assigned Yet</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            Your architectural roadmap with custom stages, document uploads, and dual-permission tracking will appear here once your design contract is activated by BAVI Interiors.
          </p>
          <button
            onClick={() => { setLoading(true); fetchProject(); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', color: '#c9a84c', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
          >
            <RefreshCw size={15} /> Check Again
          </button>
        </div>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────

  const allDocs = project.stages.flatMap(s => (s.documents || []).map(d => ({ ...d, stageId: s.id, stageName: s.name })));
  const pendingQueries = project.stages.flatMap(s => (s.queries || []).filter(q => !q.resolved));
  const completedStages = project.stages.filter(s => s.status === 'completed').length;

  return (
    <div className={styles.container}>
      {/* Project Header */}
      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div>
            <span className={styles.badgeGold}>{project.category || 'Residential'}</span>
            <h2 className={styles.projectTitle}>{project.title}</h2>
            <p className={styles.projectLocation}>{project.location}</p>
          </div>
          <div className={styles.statusBadgeBox}>
            <span className={styles.statusLabel}>Overall Progress</span>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#c9a84c' }}>
              {project.progress || 0}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ margin: '12px 0' }}>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${project.progress || 0}%`, background: 'linear-gradient(90deg, #c9a84c, #e0c57b)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: '#888' }}>
            <span>{completedStages}/{project.stages.length} stages completed</span>
            <span>{allDocs.length} document{allDocs.length !== 1 ? 's' : ''} uploaded</span>
          </div>
        </div>

        {/* Dual Authority Banner */}
        <div style={{ margin: '16px 0', padding: '12px 18px', borderRadius: '8px', background: 'rgba(201, 168, 76, 0.08)', border: '1px solid rgba(201, 168, 76, 0.25)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.84rem', color: '#ddd' }}>
          <ShieldCheck size={22} style={{ color: 'var(--astryx-gold, #c9a84c)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--astryx-gold-light, #e0c57b)' }}>Dual Permission Milestone Rule: </strong>
            Every stage requires formal sign-off from <strong>both the Builder and you</strong> before completion and escrow disbursement.
          </div>
        </div>

        {/* Meta Cards */}
        <div className={styles.metaRow}>
          <div className={styles.metaBox}><span className={styles.metaBoxLabel}>Client</span><span className={styles.metaBoxValue}>{profile?.full_name || project.client_name || 'You'}</span></div>
          <div className={styles.metaBox}><span className={styles.metaBoxLabel}>Lead Architect</span><span className={styles.metaBoxValue}>{project.builderName || 'BAVI Architecture'}</span></div>
          <div className={styles.metaBox}><span className={styles.metaBoxLabel}>Total Contract</span><span className={styles.metaBoxValue}>{project.budget ? `₹${Number(project.budget).toLocaleString('en-IN')}` : 'TBD'}</span></div>
          <div className={styles.metaBox}><span className={styles.metaBoxLabel}>Pending Queries</span><span className={styles.metaBoxValueGold}>{pendingQueries.length}</span></div>
        </div>
      </div>

      {/* Notifications */}
      {approvalNotification && (
        <div style={{ background: 'rgba(74, 222, 128, 0.12)', border: '1px solid #4ade80', color: '#4ade80', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} />
          <span>{approvalNotification}</span>
          <button onClick={() => setApprovalNotification(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabsRow}>
        <button className={`${styles.tabBtn} ${activeTab === 'milestones' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('milestones')}>
          <Layers size={17} />
          <span>Stage Roadmap ({project.stages.length})</span>
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('documents')}>
          <FileCheck2 size={17} />
          <span>All Documents ({allDocs.length})</span>
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'queries' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('queries')}>
          <MessageSquare size={17} />
          <span>My Queries ({project.stages.flatMap(s => s.queries || []).length})</span>
        </button>
      </div>

      {/* ═══ STAGE ROADMAP TAB ════════════════════════════════════════════════ */}
      {activeTab === 'milestones' && (
        <div className={styles.milestonesList}>
          {project.stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isAwaitingClient = stage.builderApproved && !stage.clientApproved;
            const isExpanded = expandedStage === stage.id;
            const unrepliedQueries = (stage.queries || []).filter(q => !q.resolved).length;

            return (
              <div
                key={stage.id}
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
                  {idx < project.stages.length - 1 && <div className={styles.connectorLine} />}
                </div>

                <div className={styles.milestoneContent}>
                  {/* Stage Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <span className={styles.stageTag}>Stage {String(idx + 1).padStart(2, '0')}</span>
                      <h3 className={styles.milestoneCardTitle}>{stage.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0 0', lineHeight: 1.5 }}>{stage.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                      {unrepliedQueries > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '3px 8px', borderRadius: '999px' }}>
                          <MessageSquare size={12} /> {unrepliedQueries} pending
                        </span>
                      )}
                      {(stage.documents || []).length > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#60a5fa', background: 'rgba(96,165,250,0.08)', padding: '3px 8px', borderRadius: '999px' }}>
                          <FileText size={12} /> {stage.documents.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  <div style={{ margin: '12px 0 8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#888' }}>Stage Progress</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c9a84c' }}>{stage.progress || 0}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${stage.progress || 0}%`, background: isCompleted ? 'linear-gradient(90deg, #4ade80, #22c55e)' : 'linear-gradient(90deg, #c9a84c, #e0c57b)', borderRadius: '999px', transition: 'width 0.5s' }} />
                    </div>
                  </div>

                  {/* Dual Permission Status */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', margin: '14px 0', padding: '12px 16px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                      <span style={{ color: '#888' }}>Builder:</span>
                      {stage.builderApproved ? (
                        <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <CheckCircle2 size={13} /> Approved
                        </span>
                      ) : (
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={13} /> Pending
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                      <span style={{ color: '#888' }}>Your Sign-off:</span>
                      {stage.clientApproved ? (
                        <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <CheckCircle2 size={13} /> Signed Off
                        </span>
                      ) : (
                        <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <AlertCircle size={13} /> Awaiting
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand/Collapse for Docs & Queries */}
                  {((stage.documents || []).length > 0 || (stage.queries || []).length > 0) && (
                    <button
                      onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#888', fontSize: '0.78rem', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Hide' : 'Show'} stage details
                    </button>
                  )}

                  {/* Expanded: Docs + Queries */}
                  {isExpanded && (
                    <div style={{ marginTop: '12px' }}>
                      {/* Documents */}
                      {(stage.documents || []).length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.3px', display: 'block', marginBottom: '8px' }}>
                            Stage Documents ({stage.documents.length})
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {stage.documents.map((doc, di) => (
                              <div key={di} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <span style={{ fontSize: '1.1rem' }}>{getDocIcon(doc.type)}</span>
                                <span style={{ fontSize: '0.8rem', color: '#e0e0e0', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                                {doc.data && (
                                  <>
                                    <button onClick={() => setViewDoc({ ...doc, stageName: stage.name })} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '2px' }} title="View">
                                      <Eye size={14} />
                                    </button>
                                    <button onClick={() => handleDownloadDoc(doc)} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', padding: '2px' }} title="Download">
                                      <ArrowDownToLine size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Replies on Queries */}
                      {(stage.queries || []).length > 0 && (
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.3px', display: 'block', marginBottom: '8px' }}>
                            Your Queries
                          </span>
                          {stage.queries.map((q) => (
                            <div key={q.id} style={{ padding: '10px 14px', background: q.resolved ? 'rgba(74,222,128,0.05)' : 'rgba(251,191,36,0.05)', borderRadius: '8px', border: `1px solid ${q.resolved ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)'}`, marginBottom: '8px', fontSize: '0.83rem' }}>
                              <p style={{ color: '#e0e0e0', margin: '0 0 6px' }}><strong style={{ color: '#c9a84c' }}>You:</strong> {q.message}</p>
                              {q.reply ? (
                                <div style={{ padding: '8px 12px', background: 'rgba(201,168,76,0.08)', borderRadius: '6px', borderLeft: '3px solid #c9a84c' }}>
                                  <span style={{ fontSize: '0.7rem', color: '#c9a84c', fontWeight: 600 }}>Reply from {q.repliedBy || 'Design Team'}:</span>
                                  <p style={{ margin: '4px 0 0', color: '#d0d0d0' }}>{q.reply}</p>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>⏳ Awaiting reply from design team...</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className={styles.milestoneFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Raise Query Button */}
                      <button
                        onClick={() => setQueryModal({ stageId: stage.id, stageName: stage.name })}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#a0a0a0', fontWeight: 600, fontSize: '0.79rem', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        <MessageSquare size={14} /> Raise Query
                      </button>
                    </div>

                    {/* Approve Button */}
                    {isCompleted ? (
                      <span className={styles.statusPill} style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                        <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Completed
                      </span>
                    ) : !stage.clientApproved ? (
                      <button
                        onClick={() => handleClientApproveStage(stage.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '6px', background: 'var(--astryx-gold, #c9a84c)', color: '#0a0a0a', fontWeight: 700, fontSize: '0.83rem', border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(201, 168, 76, 0.3)', fontFamily: 'inherit' }}
                      >
                        <Check size={15} /> Authorize & Sign Off Stage
                      </button>
                    ) : (
                      <span style={{ color: '#fbbf24', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> Awaiting Builder Final Sign-off
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ ALL DOCUMENTS TAB ════════════════════════════════════════════════ */}
      {activeTab === 'documents' && (
        <div>
          {allDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6e6e6e' }}>
              <Archive size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>No documents uploaded yet. BAVI architects will upload stage blueprints and reports here.</p>
            </div>
          ) : (
            <div>
              {project.stages.map(stage => {
                const docs = stage.documents || [];
                if (docs.length === 0) return null;
                return (
                  <div key={stage.id} style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <GitBranch size={14} color="#c9a84c" />
                      <span style={{ fontWeight: 700, color: '#c9a84c', fontSize: '0.88rem' }}>{stage.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#6e6e6e' }}>({docs.length} files)</span>
                    </div>
                    <div className={styles.documentsGrid}>
                      {docs.map((doc, di) => (
                        <div key={di} className={styles.documentCard}>
                          <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{getDocIcon(doc.type)}</div>
                          <div className={styles.docMain}>
                            <h4 className={styles.docTitle}>{doc.name}</h4>
                            <p className={styles.docDesc}>{doc.description || `Uploaded by ${doc.uploaded_by || 'Builder'}`}</p>
                            <span className={styles.docSize}>{doc.sizeLabel || (doc.size ? `${(doc.size / 1024).toFixed(0)} KB` : 'File')} • {doc.uploaded_by || 'BAVI Team'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                            {doc.data && (
                              <>
                                <button
                                  onClick={() => setViewDoc({ ...doc, stageName: stage.name })}
                                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '6px', color: '#60a5fa', fontSize: '0.78rem', cursor: 'pointer' }}
                                >
                                  <Eye size={13} /> View
                                </button>
                                <button
                                  onClick={() => handleDownloadDoc(doc)}
                                  className={styles.downloadBtn}
                                >
                                  <ArrowDownToLine size={16} />
                                  <span>Download</span>
                                </button>
                              </>
                            )}
                            {!doc.data && (
                              <span style={{ fontSize: '0.72rem', color: '#6e6e6e' }}>Metadata only</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ QUERIES TAB ══════════════════════════════════════════════════════ */}
      {activeTab === 'queries' && (
        <div>
          {project.stages.map(stage => {
            const queries = stage.queries || [];
            if (queries.length === 0) return null;
            return (
              <div key={stage.id} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <MessageSquare size={14} color="#c9a84c" />
                  <span style={{ fontWeight: 700, color: '#c9a84c', fontSize: '0.88rem' }}>{stage.name}</span>
                </div>
                {queries.map(q => (
                  <div key={q.id} style={{ padding: '14px', background: q.resolved ? 'rgba(74,222,128,0.05)' : 'rgba(251,191,36,0.05)', borderRadius: '10px', border: `1px solid ${q.resolved ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.2)'}`, marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: q.resolved ? '#4ade80' : '#fbbf24', background: q.resolved ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                        {q.resolved ? '✅ Resolved' : '⏳ Pending Reply'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#6e6e6e' }}>
                        {new Date(q.raisedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#e0e0e0', margin: '0 0 8px' }}><strong style={{ color: '#c9a84c' }}>You:</strong> {q.message}</p>
                    {q.reply ? (
                      <div style={{ padding: '10px 14px', background: 'rgba(201,168,76,0.08)', borderRadius: '8px', borderLeft: '3px solid #c9a84c' }}>
                        <span style={{ fontSize: '0.72rem', color: '#c9a84c', fontWeight: 600 }}>Reply from {q.repliedBy || 'Design Team'}:</span>
                        <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#d0d0d0', lineHeight: 1.5 }}>{q.reply}</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#6e6e6e', marginTop: '6px' }}>
                        <Clock size={13} /> Awaiting reply from the design team...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          {project.stages.every(s => (s.queries || []).length === 0) && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6e6e6e' }}>
              <MessageSquare size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>No queries raised yet. Use the "Raise Query" button on any stage to ask the design team.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Query Modal ─────────────────────────────────────────────────────── */}
      {queryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => !querySent && setQueryModal(null)}
        >
          <div style={{ background: '#1a1a1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '500px', width: '100%', padding: '28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {querySent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={48} color="#4ade80" style={{ marginBottom: '12px' }} />
                <h3 style={{ color: '#f8f8f8', margin: '0 0 8px' }}>Query Sent!</h3>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>The BAVI design team will respond shortly.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ color: '#f8f8f8', margin: '0 0 4px', fontSize: '1.1rem' }}>Raise a Query</h3>
                    <p style={{ color: '#888', margin: 0, fontSize: '0.8rem' }}>{queryModal.stageName}</p>
                  </div>
                  <button onClick={() => setQueryModal(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.82rem', color: '#a0a0a0', display: 'block', marginBottom: '8px' }}>Your Question / Concern</label>
                  <textarea
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Describe your concern or question about this stage... e.g. 'I noticed the flooring material specified doesn't match what we discussed. Can you clarify?'"
                    rows={5}
                    style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8f8f8', fontSize: '0.85rem', lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                    autoFocus
                  />
                  <span style={{ fontSize: '0.72rem', color: '#6e6e6e' }}>{queryText.length}/1000 characters</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setQueryModal(null)}
                    style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#888', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRaiseQuery}
                    disabled={!queryText.trim()}
                    style={{ flex: 2, padding: '10px', background: queryText.trim() ? '#c9a84c' : 'rgba(201,168,76,0.2)', border: 'none', borderRadius: '8px', color: queryText.trim() ? '#0a0a0a' : '#6e6e6e', cursor: queryText.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  >
                    <Send size={16} /> Send Query to Design Team
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Document View Modal ──────────────────────────────────────────────── */}
      {viewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setViewDoc(null)}
        >
          <div style={{ background: '#1a1a1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: '#f8f8f8', margin: 0, fontSize: '1rem' }}>{viewDoc.name}</h3>
                <p style={{ color: '#888', fontSize: '0.78rem', margin: '4px 0 0' }}>{viewDoc.stageName}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleDownloadDoc(viewDoc)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', color: '#4ade80', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <ArrowDownToLine size={14} /> Download
                </button>
                <button onClick={() => setViewDoc(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', cursor: 'pointer', borderRadius: '8px', padding: '8px' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {viewDoc.type?.includes('image') ? (
              <img src={viewDoc.data} alt={viewDoc.name} style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px' }} />
            ) : viewDoc.type?.includes('pdf') ? (
              <iframe src={viewDoc.data} title={viewDoc.name} style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', background: '#111', borderRadius: '12px' }}>
                <span style={{ fontSize: '4rem' }}>{getDocIcon(viewDoc.type)}</span>
                <p style={{ color: '#888', marginTop: '16px' }}>Preview not available. Download the file to open it.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
