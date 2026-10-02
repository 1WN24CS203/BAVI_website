'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FolderKanban, CheckCircle2, Clock, AlertCircle, Plus, Layers, FileUp, Sparkles,
  Check, Building, User, Phone, Mail, FileText, Upload, ChevronDown, ChevronUp,
  Eye, Download, ShieldCheck, UserCheck, Trash2, Edit3, MessageSquare,
  GripVertical, BarChart2, RefreshCw, Archive, GitBranch, FilePlus2, X, Send
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Button, Badge, Card, TextInput, TextArea, Select, FileUpload, Modal,
  Toast, Tabs, ProgressBar, EmptyState, Divider, Tag, StatusDot, Stepper
} from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';
import styles from './projects.module.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const DEFAULT_STAGES = [
  { id: 1, name: 'Requirement Analysis & SRS Preparation', description: 'Architectural brief, client needs, and SRS documentation', status: 'in_progress', progress: 0, builder_approved: false, client_approved: false, documents: [], queries: [] },
  { id: 2, name: 'Architectural Blueprint & Sanction', description: 'Structural drawings, BBMP/municipal approvals', status: 'pending', progress: 0, builder_approved: false, client_approved: false, documents: [], queries: [] },
  { id: 3, name: 'Excavation & RCC Foundation Structure', description: 'Site excavation, pile foundation, RCC slab casting', status: 'pending', progress: 0, builder_approved: false, client_approved: false, documents: [], queries: [] },
  { id: 4, name: 'Brick Masonry, Plumbing & Electrical Conduits', description: 'Superstructure walls, concealed plumbing, electrical rough-in', status: 'pending', progress: 0, builder_approved: false, client_approved: false, documents: [], queries: [] },
  { id: 5, name: 'Flooring, False Ceiling & Premium Painting', description: 'Marble/tile flooring, gypsum/POP ceiling, premium exterior paint', status: 'pending', progress: 0, builder_approved: false, client_approved: false, documents: [], queries: [] },
  { id: 6, name: 'Smart Home Automation & Final Handover', description: 'Automation integration, kitchen/wardrobe installation, quality punch-list', status: 'pending', progress: 0, builder_approved: false, client_approved: false, documents: [], queries: [] },
];

const syncProjectsToLocal = (projects) => {
  try {
    // Write sanitized version (without base64 to keep bavi_projects light)
    const light = projects.map(p => ({
      ...p,
      stages: (p.stages || []).map(s => ({
        ...s,
        documents: (s.documents || []).map(d => ({ ...d, data: undefined })),
      })),
    }));
    localStorage.setItem('bavi_projects', JSON.stringify(light));
    // Write full version (with base64) for document vault
    localStorage.setItem('bavi_projects_full', JSON.stringify(projects));
  } catch {}
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DesignerProjectsPage() {
  const { designer, logActivity } = useDesignerAuth();
  const [projects, setProjects] = useState([]);
  const [registeredClients, setRegisteredClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState('success');
  const [expandedProject, setExpandedProject] = useState(null);
  const [activeProjectTab, setActiveProjectTab] = useState({});

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDocViewModal, setShowDocViewModal] = useState(false);

  // Active items
  const [activeStageCtx, setActiveStageCtx] = useState(null); // { projectId, stageId }
  const [stageFiles, setStageFiles] = useState([]);
  const [viewDoc, setViewDoc] = useState(null);
  const [queryReply, setQueryReply] = useState('');
  const [activeQueryId, setActiveQueryId] = useState(null);

  // New project form
  const [newProject, setNewProject] = useState({
    title: '', category: 'residential', location: '', budget: '', description: '',
    client_id: '', client_name: '', client_phone: '', client_email: '', client_requirements: '',
  });

  // New stage form
  const [newStage, setNewStage] = useState({ name: '', description: '' });
  const [editingStageId, setEditingStageId] = useState(null);

  // Progress form
  const [progressValue, setProgressValue] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
    fetchRegisteredClients();
  }, []);

  const showToast = (msg, variant = 'success') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastVisible(true);
  };

  // ── Data Loading ───────────────────────────────────────────────────────────

  const fetchRegisteredClients = async () => {
    let list = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('profiles').select('*').in('role', ['customer', 'client']).order('created_at', { ascending: false });
        if (data && data.length > 0) list = data;
      } catch (err) { console.warn('Failed to fetch clients:', err); }
    }
    try {
      const local = localStorage.getItem('bavi_registered_clients');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          [...list, ...parsed].forEach(c => { if (c.email) map.set(c.email.toLowerCase(), c); });
          list = Array.from(map.values());
        }
      }
    } catch {}
    setRegisteredClients(list);
  };

  const fetchProjects = async () => {
    let list = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          list = data.map(p => normalizeProject(p));
        }
      } catch (err) { console.warn('Supabase fetch error:', err); }
    }
    if (list.length === 0) {
      try {
        // Prefer full version (with documents/base64)
        const full = localStorage.getItem('bavi_projects_full');
        const light = localStorage.getItem('bavi_projects');
        const src = full || light;
        if (src) {
          const parsed = JSON.parse(src);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed.map(p => normalizeProject(p));
          }
        }
      } catch {}
    }
    setProjects(list);
    setLoading(false);
  };

  const normalizeProject = (p) => ({
    ...p,
    stages: (p.stages && Array.isArray(p.stages) && p.stages.length > 0)
      ? p.stages.map(s => ({
          ...s,
          progress: s.progress ?? 0,
          documents: s.documents || [],
          queries: s.queries || [],
          builder_approved: s.builder_approved ?? s.builderApproved ?? false,
          client_approved: s.client_approved ?? s.clientApproved ?? false,
        }))
      : DEFAULT_STAGES.map(s => ({ ...s })),
  });

  const saveProjects = (updated) => {
    setProjects(updated);
    syncProjectsToLocal(updated);
    // Also update active project key for User-side
    if (updated.length > 0) {
      try {
        const light = { ...updated[0], stages: (updated[0].stages || []).map(s => ({ ...s, documents: (s.documents || []).map(d => ({ ...d, data: undefined })) })) };
        localStorage.setItem('bavi_client_active_project', JSON.stringify(light));
      } catch {}
    }
  };

  // ── Client Select ──────────────────────────────────────────────────────────

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    const client = registeredClients.find(c => c.id === clientId || c.email === clientId);
    if (client) {
      setNewProject(prev => ({
        ...prev, client_id: client.id || '', client_name: client.full_name || '',
        client_phone: client.phone || '', client_email: client.email || '',
        location: prev.location || client.address || '',
      }));
    } else {
      setNewProject(prev => ({ ...prev, client_id: '', client_name: '', client_phone: '', client_email: '' }));
    }
  };

  // ── Create Project ─────────────────────────────────────────────────────────

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!selectedClientId || !newProject.client_name) {
      showToast('Please select a verified registered client.', 'error'); return;
    }
    if (!newProject.title || !newProject.location) {
      showToast('Please fill project title and location.', 'error'); return;
    }

    const created = {
      ...newProject,
      id: `proj-${Date.now()}`,
      progress: 0,
      completion_percentage: 0,
      srs_status: 'not_started',
      created_at: new Date().toISOString(),
      stages: DEFAULT_STAGES.map(s => ({ ...s })),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('projects').insert([{
          title: created.title, category: created.category || 'residential',
          location: created.location, budget: parseFloat(created.budget) || 0,
          description: created.description || '', client_name: created.client_name,
          client_phone: created.client_phone || '', client_email: created.client_email || '',
          customer_id: created.client_id && !String(created.client_id).startsWith('cli-') ? created.client_id : null,
          client_requirements_plain_text: created.client_requirements || '',
          stages: created.stages, documents: [],
        }]).select();
        if (data && data.length > 0) Object.assign(created, data[0], { id: data[0].id, stages: created.stages });
      } catch (err) { console.warn('Supabase insert error:', err); }
    }

    const updated = [created, ...projects];
    saveProjects(updated);
    setShowAddModal(false);
    setSelectedClientId('');
    setNewProject({ title: '', category: 'residential', location: '', budget: '', description: '', client_id: '', client_name: '', client_phone: '', client_email: '', client_requirements: '' });
    showToast(`Project "${created.title}" created for ${created.client_name}!`);
    logActivity('created_project', 'project', created.title, { client: created.client_name });
  };

  // ── Custom Stage Management ────────────────────────────────────────────────

  const openAddStage = (projectId) => {
    setActiveStageCtx({ projectId });
    setNewStage({ name: '', description: '' });
    setEditingStageId(null);
    setShowStageModal(true);
  };

  const openEditStage = (projectId, stage) => {
    setActiveStageCtx({ projectId, stageId: stage.id });
    setNewStage({ name: stage.name, description: stage.description || '' });
    setEditingStageId(stage.id);
    setShowStageModal(true);
  };

  const handleSaveStage = () => {
    if (!newStage.name.trim()) { showToast('Stage name is required.', 'error'); return; }
    const updated = projects.map(p => {
      if (p.id !== activeStageCtx.projectId) return p;
      let stages;
      if (editingStageId !== null) {
        stages = p.stages.map(s => s.id === editingStageId ? { ...s, name: newStage.name.trim(), description: newStage.description.trim() } : s);
      } else {
        const maxId = Math.max(0, ...(p.stages || []).map(s => s.id));
        stages = [...(p.stages || []), {
          id: maxId + 1, name: newStage.name.trim(), description: newStage.description.trim(),
          status: 'pending', progress: 0, builder_approved: false, client_approved: false, documents: [], queries: [],
        }];
      }
      return { ...p, stages };
    });
    saveProjects(updated);
    setShowStageModal(false);
    showToast(editingStageId !== null ? 'Stage updated!' : 'New stage added!');
    logActivity('stage_operation', 'stage', newStage.name, { projectId: activeStageCtx.projectId });
  };

  const handleDeleteStage = (projectId, stageId) => {
    const updated = projects.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, stages: p.stages.filter(s => s.id !== stageId) };
    });
    saveProjects(updated);
    showToast('Stage removed.');
  };

  // ── Stage Progress ─────────────────────────────────────────────────────────

  const openProgressModal = (projectId, stage) => {
    setActiveStageCtx({ projectId, stageId: stage.id });
    setProgressValue(stage.progress || 0);
    setShowProgressModal(true);
  };

  const handleSaveProgress = async () => {
    let targetProject = null;
    const updated = projects.map(p => {
      if (p.id !== activeStageCtx.projectId) return p;
      const stages = p.stages.map(s => {
        if (s.id !== activeStageCtx.stageId) return s;
        const newStatus = progressValue === 100 ? 'completed' : progressValue > 0 ? 'in_progress' : 'pending';
        const builderApproved = progressValue === 100 ? true : s.builder_approved;
        return { ...s, progress: progressValue, status: newStatus, builder_approved: builderApproved };
      });
      const overall = Math.round(stages.reduce((a, s) => a + (s.progress || 0), 0) / Math.max(1, stages.length));
      targetProject = { ...p, stages, progress: overall, completion_percentage: overall };
      return targetProject;
    });
    saveProjects(updated);

    if (isSupabaseConfigured() && targetProject && !String(targetProject.id).startsWith('proj-')) {
      try {
        await supabase.from('projects').update({ stages: targetProject.stages, completion_percentage: targetProject.progress }).eq('id', targetProject.id);
      } catch (err) { console.warn('Supabase update error:', err); }
    }

    setShowProgressModal(false);
    showToast('Stage progress updated and synced to client portal!');
  };

  // ── Builder Approve Stage ──────────────────────────────────────────────────

  const handleBuilderApprove = async (projectId, stageId) => {
    let targetProject = null;
    const updated = projects.map(p => {
      if (p.id !== projectId) return p;
      const stages = p.stages.map(s => {
        if (s.id !== stageId) return s;
        const status = s.client_approved ? 'completed' : 'awaiting_approval';
        return { ...s, builder_approved: true, builder_approved_at: new Date().toISOString(), status };
      });
      const overall = Math.round(stages.reduce((a, s) => a + (s.progress || 0), 0) / Math.max(1, stages.length));
      targetProject = { ...p, stages, progress: overall, completion_percentage: overall };
      return targetProject;
    });
    saveProjects(updated);

    if (isSupabaseConfigured() && targetProject && !String(targetProject.id).startsWith('proj-')) {
      try {
        await supabase.from('projects').update({ stages: targetProject.stages, completion_percentage: targetProject.progress }).eq('id', targetProject.id);
      } catch (err) { console.warn('Supabase update error:', err); }
    }

    showToast('Builder approval recorded! Client notified.');
    logActivity('builder_approved_stage', 'stage', `Stage ${stageId}`, { projectId });
  };

  // ── Document Upload ────────────────────────────────────────────────────────

  const openUploadModal = (projectId, stageId) => {
    setActiveStageCtx({ projectId, stageId });
    setStageFiles([]);
    setShowUploadModal(true);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = [];
    for (const file of files) {
      try {
        const data = await fileToBase64(file);
        results.push({
          name: file.name,
          size: file.size,
          type: file.type,
          sizeLabel: file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(1)} KB`
            : `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          data,
          uploaded_by: designer?.full_name || 'Designer',
          uploaded_at: new Date().toISOString(),
        });
      } catch (err) { console.warn('Failed to read file:', err); }
    }
    setStageFiles(prev => [...prev, ...results]);
  };

  const handleStageDocUpload = async () => {
    if (stageFiles.length === 0) return;
    let targetProject = null;
    const updated = projects.map(p => {
      if (p.id !== activeStageCtx.projectId) return p;
      const stages = p.stages.map(s => {
        if (s.id !== activeStageCtx.stageId) return s;
        return { ...s, documents: [...(s.documents || []), ...stageFiles] };
      });
      targetProject = { ...p, stages };
      return targetProject;
    });
    saveProjects(updated);

    if (isSupabaseConfigured() && targetProject && !String(targetProject.id).startsWith('proj-')) {
      try {
        const allDocs = targetProject.stages.flatMap(s => (s.documents || []).map(d => ({ ...d, data: undefined })));
        await supabase.from('projects').update({ stages: targetProject.stages.map(s => ({ ...s, documents: (s.documents || []).map(d => ({ ...d, data: undefined })) })), documents: allDocs }).eq('id', targetProject.id);
      } catch (err) { console.warn('Supabase doc upload error:', err); }
    }

    setShowUploadModal(false);
    showToast(`${stageFiles.length} document(s) uploaded to stage!`);
    logActivity('uploaded_stage_document', 'document', stageFiles.map(f => f.name).join(', '), { projectId: activeStageCtx.projectId, stageId: activeStageCtx.stageId });
  };

  const handleDeleteDoc = (projectId, stageId, docIdx) => {
    const updated = projects.map(p => {
      if (p.id !== projectId) return p;
      const stages = p.stages.map(s => {
        if (s.id !== stageId) return s;
        return { ...s, documents: s.documents.filter((_, i) => i !== docIdx) };
      });
      return { ...p, stages };
    });
    saveProjects(updated);
    showToast('Document removed.');
  };

  const handleDownloadDoc = (doc) => {
    if (!doc.data) { showToast('Document data not available. Re-upload required.', 'error'); return; }
    const a = document.createElement('a');
    a.href = doc.data;
    a.download = doc.name;
    a.click();
  };

  const handleViewDoc = (doc) => {
    setViewDoc(doc);
    setShowDocViewModal(true);
  };

  // ── Query Management ───────────────────────────────────────────────────────

  const openQueryModal = (projectId, stageId) => {
    setActiveStageCtx({ projectId, stageId });
    setQueryReply('');
    setActiveQueryId(null);
    setShowQueryModal(true);
  };

  const getStageQueries = () => {
    if (!activeStageCtx) return [];
    const proj = projects.find(p => p.id === activeStageCtx.projectId);
    if (!proj) return [];
    const stage = (proj.stages || []).find(s => s.id === activeStageCtx.stageId);
    return stage?.queries || [];
  };

  const handleReplyQuery = () => {
    if (!queryReply.trim() || activeQueryId === null) return;
    const updated = projects.map(p => {
      if (p.id !== activeStageCtx.projectId) return p;
      const stages = p.stages.map(s => {
        if (s.id !== activeStageCtx.stageId) return s;
        const queries = s.queries.map(q => {
          if (q.id !== activeQueryId) return q;
          return {
            ...q,
            resolved: true,
            reply: queryReply.trim(),
            repliedAt: new Date().toISOString(),
            repliedBy: designer?.full_name || 'Designer',
          };
        });
        return { ...s, queries };
      });
      return { ...p, stages };
    });
    saveProjects(updated);
    setQueryReply('');
    setActiveQueryId(null);
    showToast('Reply sent to client!');
    logActivity('replied_query', 'query', `Stage query reply`, { projectId: activeStageCtx.projectId });
  };

  // ── Status Badge ───────────────────────────────────────────────────────────

  const getStatusBadge = (stage) => {
    if (stage.status === 'completed') return <Badge variant="success" dot>Completed</Badge>;
    if (stage.status === 'awaiting_approval') return <Badge variant="warning" dot>Awaiting Client</Badge>;
    if (stage.status === 'in_progress') return <Badge variant="gold" dot>In Progress</Badge>;
    return <Badge variant="neutral">Scheduled</Badge>;
  };

  const getDocIcon = (type) => {
    if (!type) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📋';
    if (type.includes('video')) return '🎬';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📄';
  };

  const currentQueries = getStageQueries();
  const pendingQueriesCount = (projectId) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return 0;
    return (proj.stages || []).reduce((a, s) => a + (s.queries || []).filter(q => !q.resolved).length, 0);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <DesignerHeader
        title="Project Stage Engineering"
        subtitle="GitHub-style milestone management — create custom stages, upload docs, track progress, handle client queries"
      />

      <div style={{ padding: '0 4px' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.2rem', fontWeight: 700, color: '#f8f8f8', margin: 0 }}>
              Active Projects ({projects.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#a0a0a0', margin: '4px 0 0' }}>
              Custom stage roadmaps · Document vault · Dual approvals · Client query inbox
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchProjects}>Refresh</Button>
            <Button icon={Plus} onClick={() => setShowAddModal(true)}>Create New Project</Button>
          </div>
        </div>

        <Toast message={toastMsg} variant={toastVariant} isVisible={toastVisible} onClose={() => setToastVisible(false)} />

        {/* Project List */}
        {projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {projects.map((p) => {
              const isExpanded = expandedProject === p.id;
              const pendingQ = pendingQueriesCount(p.id);
              const tab = activeProjectTab[p.id] || 'stages';

              return (
                <Card key={p.id} variant="gold" padding="lg">
                  {/* Project Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <Tag variant="gold">{p.category || 'Residential'}</Tag>
                        {p.client_name && <Tag variant="info">Client: {p.client_name}</Tag>}
                        {pendingQ > 0 && <Tag variant="warning">⚠️ {pendingQ} Query{pendingQ > 1 ? 'ies' : ''}</Tag>}
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.15rem', fontWeight: 700, color: '#f8f8f8', margin: '0 0 4px' }}>
                        {p.title}
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: '#a0a0a0', margin: 0 }}>
                        {p.location} {p.budget ? `• ₹${Number(p.budget).toLocaleString('en-IN')}` : ''}
                      </p>
                      {p.client_email && (
                        <p style={{ fontSize: '0.75rem', color: '#6e6e6e', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={12} /> {p.client_email}
                          {p.client_phone && <><Phone size={12} style={{ marginLeft: '8px' }} /> {p.client_phone}</>}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', fontWeight: 700, color: '#c9a84c', lineHeight: 1 }}>
                        {p.completion_percentage || p.progress || 0}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6e6e6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall</div>
                    </div>
                  </div>

                  <ProgressBar value={p.completion_percentage || p.progress || 0} label="Construction Progress" />

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => setExpandedProject(isExpanded ? null : p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#c9a84c', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginTop: '14px', fontFamily: 'inherit', padding: '6px 0' }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isExpanded ? 'Collapse' : `Manage Stages & Documents (${(p.stages || []).length} stages)`}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div style={{ marginTop: '16px' }}>
                      {/* Sub-Tabs */}
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                        {[
                          { id: 'stages', label: 'Stages & Progress', icon: <Layers size={14} /> },
                          { id: 'documents', label: `All Documents (${(p.stages || []).reduce((a, s) => a + (s.documents || []).length, 0)})`, icon: <FileText size={14} /> },
                          { id: 'queries', label: `Client Queries (${(p.stages || []).reduce((a, s) => a + (s.queries || []).length, 0)})`, icon: <MessageSquare size={14} /> },
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setActiveProjectTab(prev => ({ ...prev, [p.id]: t.id }))}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: 'none',
                              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                              background: tab === t.id ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.04)',
                              color: tab === t.id ? '#c9a84c' : '#888',
                            }}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                        <button
                          onClick={() => openAddStage(p.id)}
                          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px dashed rgba(201,168,76,0.4)', background: 'transparent', color: '#c9a84c', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          <FilePlus2 size={14} /> Add Custom Stage
                        </button>
                      </div>

                      {/* STAGES TAB */}
                      {tab === 'stages' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {(p.stages || []).map((stage, idx) => (
                            <Card
                              key={stage.id}
                              variant={stage.status === 'completed' ? 'default' : stage.status === 'in_progress' || stage.status === 'awaiting_approval' ? 'gold' : 'outlined'}
                              padding="md"
                            >
                              {/* Stage Header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#c9a84c', flexShrink: 0 }}>
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8f8f8', margin: 0 }}>{stage.name}</h5>
                                    {stage.description && <p style={{ fontSize: '0.75rem', color: '#888', margin: '2px 0 0' }}>{stage.description}</p>}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                  {getStatusBadge(stage)}
                                  <button onClick={() => openEditStage(p.id, stage)} style={{ background: 'none', border: 'none', color: '#6e6e6e', cursor: 'pointer', padding: '4px', borderRadius: '4px' }} title="Edit stage">
                                    <Edit3 size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteStage(p.id, stage.id)} style={{ background: 'none', border: 'none', color: '#6e6e6e', cursor: 'pointer', padding: '4px', borderRadius: '4px' }} title="Delete stage">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Progress Slider */}
                              <div style={{ margin: '10px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Stage Progress</span>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c9a84c' }}>{stage.progress || 0}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${stage.progress || 0}%`, background: 'linear-gradient(90deg, #c9a84c, #e0c57b)', borderRadius: '999px', transition: 'width 0.3s' }} />
                                </div>
                              </div>

                              {/* Dual Approval Indicators */}
                              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
                                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: stage.builder_approved ? '#4ade80' : '#6e6e6e' }}>
                                  {stage.builder_approved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                                  Builder {stage.builder_approved ? '✓' : '–'}
                                </span>
                                <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: stage.client_approved ? '#4ade80' : '#6e6e6e' }}>
                                  {stage.client_approved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                                  Client {stage.client_approved ? '✓' : '–'}
                                </span>
                                {(stage.queries || []).filter(q => !q.resolved).length > 0 && (
                                  <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                                    <MessageSquare size={13} /> {(stage.queries || []).filter(q => !q.resolved).length} pending quer{(stage.queries || []).filter(q => !q.resolved).length > 1 ? 'ies' : 'y'}
                                  </span>
                                )}
                                {(stage.documents || []).length > 0 && (
                                  <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#60a5fa' }}>
                                    <FileText size={13} /> {(stage.documents || []).length} doc{(stage.documents || []).length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>

                              {/* Stage Actions */}
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                                <Button size="sm" variant="outline" icon={BarChart2} onClick={() => openProgressModal(p.id, stage)}>Update Progress</Button>
                                <Button size="sm" variant="outline" icon={Upload} onClick={() => openUploadModal(p.id, stage.id)}>Upload Docs</Button>
                                {!stage.builder_approved && (
                                  <Button size="sm" variant="success" icon={Check} onClick={() => handleBuilderApprove(p.id, stage.id)}>Builder Approve</Button>
                                )}
                                {(stage.queries || []).filter(q => !q.resolved).length > 0 && (
                                  <Button size="sm" variant="warning" icon={MessageSquare} onClick={() => openQueryModal(p.id, stage.id)}>
                                    Answer {(stage.queries || []).filter(q => !q.resolved).length} Quer{(stage.queries || []).filter(q => !q.resolved).length > 1 ? 'ies' : 'y'}
                                  </Button>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* DOCUMENTS TAB */}
                      {tab === 'documents' && (
                        <div>
                          {(p.stages || []).map((stage) => {
                            const docs = stage.documents || [];
                            if (docs.length === 0) return null;
                            return (
                              <div key={stage.id} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                  <GitBranch size={14} color="#c9a84c" />
                                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c9a84c' }}>{stage.name}</span>
                                  <span style={{ fontSize: '0.7rem', color: '#6e6e6e' }}>({docs.length} files)</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                                  {docs.map((doc, di) => (
                                    <div key={di} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#181818', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                      <span style={{ fontSize: '1.3rem' }}>{getDocIcon(doc.type)}</span>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.8rem', color: '#e0e0e0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                                        <div style={{ fontSize: '0.68rem', color: '#6e6e6e', marginTop: '2px' }}>{doc.sizeLabel || doc.size} • {doc.uploaded_by}</div>
                                      </div>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        {doc.data && (
                                          <>
                                            <button onClick={() => handleViewDoc(doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', padding: '4px' }} title="View">
                                              <Eye size={15} />
                                            </button>
                                            <button onClick={() => handleDownloadDoc(doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4ade80', padding: '4px' }} title="Download">
                                              <Download size={15} />
                                            </button>
                                          </>
                                        )}
                                        <button onClick={() => handleDeleteDoc(p.id, stage.id, di)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6e6e6e', padding: '4px' }} title="Delete">
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                          {(p.stages || []).every(s => (s.documents || []).length === 0) && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6e6e6e', fontSize: '0.85rem' }}>
                              <Archive size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                              <p>No documents uploaded yet. Switch to Stages tab to upload files.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* QUERIES TAB */}
                      {tab === 'queries' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(p.stages || []).map((stage) => {
                            const queries = stage.queries || [];
                            if (queries.length === 0) return null;
                            return (
                              <div key={stage.id}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c9a84c', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <MessageSquare size={13} /> {stage.name}
                                </div>
                                {queries.map((q) => (
                                  <div key={q.id} style={{ padding: '12px 16px', background: q.resolved ? 'rgba(74, 222, 128, 0.05)' : 'rgba(251, 191, 36, 0.06)', borderRadius: '8px', border: `1px solid ${q.resolved ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.2)'}`, marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: q.resolved ? '#4ade80' : '#fbbf24' }}>{q.resolved ? '✅ Resolved' : '⚠️ Pending Reply'}</span>
                                      <span style={{ fontSize: '0.68rem', color: '#6e6e6e' }}>{new Date(q.raisedAt || q.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p style={{ fontSize: '0.84rem', color: '#e0e0e0', margin: '0 0 6px' }}><strong style={{ color: '#c9a84c' }}>{q.raisedBy || 'Client'}:</strong> {q.message}</p>
                                    {q.reply && (
                                      <div style={{ padding: '8px 12px', background: 'rgba(201,168,76,0.08)', borderRadius: '6px', borderLeft: '3px solid #c9a84c', marginTop: '8px' }}>
                                        <span style={{ fontSize: '0.72rem', color: '#c9a84c', fontWeight: 600 }}>Your Reply ({q.repliedBy}):</span>
                                        <p style={{ fontSize: '0.82rem', color: '#e0e0e0', margin: '4px 0 0' }}>{q.reply}</p>
                                      </div>
                                    )}
                                    {!q.resolved && (
                                      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                        <input
                                          value={activeQueryId === q.id ? queryReply : ''}
                                          onChange={(e) => { setActiveQueryId(q.id); setQueryReply(e.target.value); }}
                                          placeholder="Type your reply..."
                                          style={{ flex: 1, padding: '7px 12px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f8f8', fontSize: '0.82rem', outline: 'none' }}
                                          onFocus={() => setActiveQueryId(q.id)}
                                        />
                                        <Button size="sm" variant="gold" icon={Send} onClick={handleReplyQuery}>Reply</Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                          {(p.stages || []).every(s => (s.queries || []).length === 0) && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6e6e6e', fontSize: '0.85rem' }}>
                              <MessageSquare size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                              <p>No client queries yet. Queries raised from the client portal appear here.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6e6e6e' }}>Loading projects...</div>
        ) : (
          <EmptyState
            icon={Building}
            title="No Active Projects Created Yet"
            description='Click "Create New Project" to set up a client project with custom stage roadmap, file uploads, and dual approval tracking.'
            action={<Button icon={Plus} onClick={() => setShowAddModal(true)}>Create First Project</Button>}
          />
        )}

        {/* ── Modals ────────────────────────────────────────────────────────────── */}

        {/* Create Project Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Client Project" size="lg">
          <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Divider label="Client Assignment (Registered Client Only)" />
            <Select
              label="Select Registered Client" required value={selectedClientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              options={[{ value: '', label: '-- Choose a Registered Client --' }, ...registeredClients.map(c => ({ value: c.id || c.email, label: `${c.full_name} (${c.email})` }))]}
              hint="Only registered clients can be assigned to projects."
            />
            {selectedClientId && newProject.client_name ? (
              <Card variant="gold" padding="sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#4ade80" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8f8f8' }}>{newProject.client_name}</span>
                  <Tag variant="success">Verified</Tag>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#a0a0a0', marginTop: '4px' }}>
                  {newProject.client_email} {newProject.client_phone && `• ${newProject.client_phone}`}
                </div>
              </Card>
            ) : (
              <Card variant="outlined" padding="sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.8rem' }}>
                  <AlertCircle size={16} /> Select a registered client above.
                </div>
              </Card>
            )}
            <Divider label="Project Details" />
            <TextInput label="Project Title" required placeholder="e.g. Channarayapatna Villa Project" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <Select label="Category" value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })} options={[{ value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' }, { value: 'interior', label: 'Interior' }, { value: 'renovation', label: 'Renovation' }]} />
              <TextInput label="Location / Site" required placeholder="e.g. BM Road, Channarayapatna" value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })} />
              <TextInput label="Total Budget (INR)" type="number" placeholder="e.g. 5000000" value={newProject.budget} onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })} />
            </div>
            <TextArea label="Project Scope / Notes" rows={2} placeholder="Key features, square footage..." value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
            <TextArea label="Client Requirements (Plain Text)" rows={4} placeholder="Client's vision in plain words..." value={newProject.client_requirements} onChange={(e) => setNewProject({ ...newProject, client_requirements: e.target.value })} hint="Used to generate SRS document" />
            <Button type="submit" fullWidth size="lg">Create Project Roadmap</Button>
          </form>
        </Modal>

        {/* Add/Edit Stage Modal */}
        <Modal isOpen={showStageModal} onClose={() => setShowStageModal(false)} title={editingStageId !== null ? 'Edit Stage' : 'Add Custom Stage'} size="sm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextInput label="Stage Name *" required placeholder="e.g. Interior Finishing & Woodwork" value={newStage.name} onChange={(e) => setNewStage({ ...newStage, name: e.target.value })} />
            <TextArea label="Stage Description" rows={3} placeholder="Describe what happens in this stage..." value={newStage.description} onChange={(e) => setNewStage({ ...newStage, description: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="outline" onClick={() => setShowStageModal(false)} style={{ flex: 1 }}>Cancel</Button>
              <Button onClick={handleSaveStage} style={{ flex: 2 }}>{editingStageId !== null ? 'Update Stage' : 'Add Stage'}</Button>
            </div>
          </div>
        </Modal>

        {/* Progress Modal */}
        <Modal isOpen={showProgressModal} onClose={() => setShowProgressModal(false)} title="Update Stage Progress" size="sm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Stage Completion</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c9a84c' }}>{progressValue}%</span>
              </div>
              <input
                type="range" min="0" max="100" step="5" value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#c9a84c' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6e6e6e', marginTop: '4px' }}>
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>
            {progressValue === 100 && (
              <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,0.08)', borderRadius: '8px', border: '1px solid rgba(74,222,128,0.2)', fontSize: '0.82rem', color: '#4ade80' }}>
                <CheckCircle2 size={14} style={{ marginRight: '6px' }} />
                Setting to 100% will auto-mark builder approval. Client sign-off still required.
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[0, 25, 50, 75, 100].map(v => (
                <button key={v} onClick={() => setProgressValue(v)} style={{ flex: 1, padding: '6px', background: progressValue === v ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.04)', border: progressValue === v ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: progressValue === v ? '#c9a84c' : '#888', fontSize: '0.75rem', cursor: 'pointer' }}>
                  {v}%
                </button>
              ))}
            </div>
            <Button fullWidth onClick={handleSaveProgress}>Save & Sync to Client Portal</Button>
          </div>
        </Modal>

        {/* Document Upload Modal */}
        <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Stage Documents" size="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed rgba(201,168,76,0.3)', borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer', background: 'rgba(201,168,76,0.04)', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.6)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
            >
              <Upload size={32} style={{ color: '#c9a84c', marginBottom: '10px' }} />
              <p style={{ color: '#a0a0a0', margin: 0, fontSize: '0.85rem' }}>Click to browse or drag & drop files</p>
              <p style={{ color: '#6e6e6e', margin: '4px 0 0', fontSize: '0.75rem' }}>PDFs, Images, DWG, Word, Excel — any file type</p>
            </div>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />

            {stageFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stageFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#181818', borderRadius: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getDocIcon(f.type)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6e6e6e' }}>{f.sizeLabel}</div>
                    </div>
                    <button onClick={() => setStageFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#6e6e6e', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button fullWidth icon={Upload} onClick={handleStageDocUpload} disabled={stageFiles.length === 0}>
              Upload {stageFiles.length > 0 ? `${stageFiles.length} ` : ''}Document{stageFiles.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </Modal>

        {/* Document View Modal */}
        <Modal isOpen={showDocViewModal} onClose={() => setShowDocViewModal(false)} title={viewDoc?.name || 'Document Preview'} size="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {viewDoc?.data ? (
              viewDoc.type?.includes('image') ? (
                <img src={viewDoc.data} alt={viewDoc.name} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '8px' }} />
              ) : viewDoc.type?.includes('pdf') ? (
                <iframe src={viewDoc.data} title={viewDoc.name} style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: '#181818', borderRadius: '12px' }}>
                  <span style={{ fontSize: '3rem' }}>{getDocIcon(viewDoc.type)}</span>
                  <p style={{ color: '#a0a0a0', marginTop: '12px', fontSize: '0.85rem' }}>Preview not available for this file type.</p>
                  <Button icon={Download} onClick={() => handleDownloadDoc(viewDoc)} style={{ marginTop: '12px' }}>Download to Open</Button>
                </div>
              )
            ) : (
              <p style={{ color: '#888', textAlign: 'center' }}>No preview data available. Document was recorded without file content.</p>
            )}
            {viewDoc?.data && (
              <Button icon={Download} variant="outline" onClick={() => handleDownloadDoc(viewDoc)}>Download {viewDoc.name}</Button>
            )}
          </div>
        </Modal>

        {/* Query View Modal */}
        <Modal isOpen={showQueryModal} onClose={() => setShowQueryModal(false)} title="Client Query Inbox" size="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQueries.length > 0 ? currentQueries.map((q) => (
              <div key={q.id} style={{ padding: '14px', background: q.resolved ? 'rgba(74,222,128,0.05)' : 'rgba(251,191,36,0.06)', borderRadius: '10px', border: `1px solid ${q.resolved ? 'rgba(74,222,128,0.2)' : 'rgba(251,191,36,0.25)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Tag variant={q.resolved ? 'success' : 'warning'}>{q.resolved ? '✅ Resolved' : '⚠️ Pending'}</Tag>
                  <span style={{ fontSize: '0.7rem', color: '#6e6e6e' }}>{new Date(q.raisedAt || Date.now()).toLocaleDateString('en-IN')}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#e0e0e0', margin: 0 }}><strong style={{ color: '#c9a84c' }}>{q.raisedBy || 'Client'}:</strong> {q.message}</p>
                {q.reply && (
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(201,168,76,0.08)', borderRadius: '6px', borderLeft: '3px solid #c9a84c' }}>
                    <p style={{ fontSize: '0.8rem', color: '#e0e0e0', margin: 0 }}><strong>Your Reply:</strong> {q.reply}</p>
                  </div>
                )}
                {!q.resolved && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <input
                      value={activeQueryId === q.id ? queryReply : ''}
                      onChange={(e) => { setActiveQueryId(q.id); setQueryReply(e.target.value); }}
                      placeholder="Type reply..."
                      style={{ flex: 1, padding: '7px 12px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f8f8f8', fontSize: '0.82rem', outline: 'none' }}
                      onFocus={() => setActiveQueryId(q.id)}
                    />
                    <Button size="sm" variant="gold" icon={Send} onClick={handleReplyQuery}>Send</Button>
                  </div>
                )}
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#6e6e6e' }}>
                <MessageSquare size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
                <p>No queries for this stage yet.</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
}
