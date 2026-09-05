'use client';

import { useState, useEffect } from 'react';
import {
  FolderKanban, CheckCircle2, Clock, AlertCircle, Plus, Layers, FileUp, Sparkles,
  Check, Building, User, Phone, Mail, FileText, Upload, ChevronDown, ChevronUp,
  Eye, Download, ShieldCheck, UserCheck
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Button, Badge, Card, TextInput, TextArea, Select, FileUpload, Modal,
  Toast, Tabs, ProgressBar, EmptyState, Divider, Tag, StatusDot, Stepper
} from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';
import styles from './projects.module.css';

const DEFAULT_CLIENTS = [
  {
    id: 'cli-demo-1',
    full_name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 98450 12345',
    address: 'BM Road, Channarayapatna',
    role: 'customer',
  },
  {
    id: 'cli-demo-2',
    full_name: 'Pooja Reddy',
    email: 'pooja.reddy@example.com',
    phone: '+91 98450 67890',
    address: 'Hassan Road, Channarayapatna',
    role: 'customer',
  },
  {
    id: 'cli-demo-3',
    full_name: 'Kavitha Swamy',
    email: 'kavitha.swamy@gmail.com',
    phone: '+91 94480 34567',
    address: 'Mysuru Highway, Channarayapatna',
    role: 'customer',
  }
];

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

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '', category: 'residential', location: '', budget: '', description: '',
    client_id: '', client_name: '', client_phone: '', client_email: '', client_requirements: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Stage Document Upload Modal
  const [showStageUploadModal, setShowStageUploadModal] = useState(false);
  const [activeStageUpload, setActiveStageUpload] = useState(null);
  const [stageFiles, setStageFiles] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchRegisteredClients();
  }, []);

  const showToast = (msg, variant = 'success') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastVisible(true);
  };

  const fetchRegisteredClients = async () => {
    let list = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'customer');
        if (data && data.length > 0) list = data;
      } catch (err) {
        console.warn('Failed to fetch clients from Supabase:', err);
      }
    }
    try {
      const local = localStorage.getItem('bavi_registered_clients');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          [...list, ...parsed].forEach(c => {
            if (c.email) map.set(c.email.toLowerCase(), c);
          });
          list = Array.from(map.values());
        }
      }
    } catch {}

    if (list.length === 0) {
      list = DEFAULT_CLIENTS;
      try {
        localStorage.setItem('bavi_registered_clients', JSON.stringify(DEFAULT_CLIENTS));
      } catch {}
    }
    setRegisteredClients(list);
  };

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    const client = registeredClients.find(c => c.id === clientId || c.email === clientId);
    if (client) {
      setNewProject(prev => ({
        ...prev,
        client_id: client.id || '',
        client_name: client.full_name || '',
        client_phone: client.phone || '',
        client_email: client.email || '',
        location: prev.location || client.address || '',
      }));
    } else {
      setNewProject(prev => ({
        ...prev,
        client_id: '',
        client_name: '',
        client_phone: '',
        client_email: '',
      }));
    }
  };

  const fetchProjects = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) setProjects(data);
        else setProjects([]);
      } catch (err) {
        console.warn('Supabase fetch projects error:', err);
      }
    }
    // Load from localStorage as fallback
    try {
      const local = localStorage.getItem('bavi_projects');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.length > 0 && projects.length === 0) setProjects(parsed);
      }
    } catch {}
    setLoading(false);
  };

  const saveProjectsLocal = (updated) => {
    try {
      localStorage.setItem('bavi_projects', JSON.stringify(updated));
    } catch {}
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!selectedClientId || !newProject.client_name) {
      showToast('Client must be selected! Please choose a verified registered client to avoid unregistered entries.', 'error');
      return;
    }

    if (!newProject.title || !newProject.location) {
      showToast('Please fill in project title and location', 'error');
      return;
    }

    const created = {
      ...newProject,
      id: `proj-${Date.now()}`,
      progress: 0,
      completion_percentage: 0,
      srs_status: 'not_started',
      created_at: new Date().toISOString(),
      stages: [
        { id: 1, name: 'Requirement Analysis & SRS Preparation', status: 'in_progress', builder_approved: false, client_approved: false, documents: [] },
        { id: 2, name: 'Architectural Blueprint & Sanction', status: 'pending', builder_approved: false, client_approved: false, documents: [] },
        { id: 3, name: 'Excavation & RCC Foundation Structure', status: 'pending', builder_approved: false, client_approved: false, documents: [] },
        { id: 4, name: 'Brick Masonry, Plumbing & Electrical Conduits', status: 'pending', builder_approved: false, client_approved: false, documents: [] },
        { id: 5, name: 'Flooring, False Ceiling & Premium Painting', status: 'pending', builder_approved: false, client_approved: false, documents: [] },
        { id: 6, name: 'Smart Home Automation & Final Handover', status: 'pending', builder_approved: false, client_approved: false, documents: [] },
      ],
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('projects').insert([{
          title: newProject.title,
          category: newProject.category,
          location: newProject.location,
          budget: parseFloat(newProject.budget) || 0,
          description: newProject.description,
          client_id: newProject.client_id,
          client_name: newProject.client_name,
          client_phone: newProject.client_phone,
          client_email: newProject.client_email,
          client_requirements_plain_text: newProject.client_requirements,
        }]);
      } catch (err) {
        console.warn('Supabase save error:', err);
      }
    }

    const updated = [created, ...projects];
    setProjects(updated);
    saveProjectsLocal(updated);
    try {
      localStorage.setItem('bavi_client_active_project', JSON.stringify(created));
    } catch {}

    setShowAddModal(false);
    setSelectedClientId('');
    setNewProject({ title: '', category: 'residential', location: '', budget: '', description: '', client_id: '', client_name: '', client_phone: '', client_email: '', client_requirements: '' });
    showToast(`Project "${created.title}" successfully assigned to registered client "${created.client_name}"!`);
    logActivity('created_project', 'project', created.title, { client: created.client_name });
  };

  // Builder approves a stage
  const handleBuilderApprove = (projectId, stageId) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const nextStages = (p.stages || []).map(s => {
          if (s.id === stageId) {
            const newStage = { ...s, builder_approved: true, builder_approved_at: new Date().toISOString() };
            // If both approved, mark as completed
            if (newStage.client_approved) {
              newStage.status = 'completed';
            } else {
              newStage.status = 'awaiting_approval';
            }
            return newStage;
          }
          return s;
        });
        // Unlock next stage if current is completed
        const completedIds = nextStages.filter(s => s.status === 'completed').map(s => s.id);
        const finalStages = nextStages.map(s => {
          if (s.status === 'pending') {
            const prevStage = nextStages.find(ps => ps.id === s.id - 1);
            if (prevStage && prevStage.status === 'completed') {
              return { ...s, status: 'in_progress' };
            }
          }
          return s;
        });
        const completedCount = finalStages.filter(s => s.status === 'completed').length;
        return { ...p, stages: finalStages, progress: Math.round((completedCount / finalStages.length) * 100) };
      }
      return p;
    });
    setProjects(updated);
    saveProjectsLocal(updated);
    showToast('Builder approval recorded! Waiting for client sign-off.');
    logActivity('builder_approved_stage', 'stage', `Stage ${stageId}`, { projectId });
  };

  // Open stage upload modal
  const openStageUpload = (projectId, stageId) => {
    setActiveStageUpload({ projectId, stageId });
    setStageFiles([]);
    setShowStageUploadModal(true);
  };

  // Handle stage document upload
  const handleStageDocUpload = () => {
    if (stageFiles.length === 0) return;
    const updated = projects.map(p => {
      if (p.id === activeStageUpload.projectId) {
        const nextStages = (p.stages || []).map(s => {
          if (s.id === activeStageUpload.stageId) {
            const newDocs = stageFiles.map(f => ({
              name: f.name,
              size: f.size,
              type: f.type,
              uploaded_by: designer?.full_name || 'Builder',
              uploaded_at: new Date().toISOString(),
            }));
            return { ...s, documents: [...(s.documents || []), ...newDocs] };
          }
          return s;
        });
        return { ...p, stages: nextStages };
      }
      return p;
    });
    setProjects(updated);
    saveProjectsLocal(updated);
    setShowStageUploadModal(false);
    showToast(`${stageFiles.length} document(s) uploaded to stage successfully!`);
    logActivity('uploaded_stage_document', 'document', stageFiles.map(f => f.name).join(', '), {
      projectId: activeStageUpload.projectId,
      stageId: activeStageUpload.stageId,
    });
  };

  const getStageStatusBadge = (stage) => {
    if (stage.status === 'completed') return <Badge variant="success" dot>Completed</Badge>;
    if (stage.status === 'awaiting_approval') return <Badge variant="warning" dot>Awaiting Dual Approval</Badge>;
    if (stage.status === 'in_progress') return <Badge variant="gold" dot>Under Review</Badge>;
    return <Badge variant="neutral">Scheduled</Badge>;
  };

  return (
    <>
      <DesignerHeader
        title="Project Milestone Engineering"
        subtitle="Create projects with client info, upload documents per stage, and track dual approvals"
      />

      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '1.2rem', fontWeight: 700, color: '#f8f8f8' }}>
              Active Projects ({projects.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>
              Client milestone roadmaps with document upload & dual approval system
            </p>
          </div>
          <Button icon={Plus} onClick={() => setShowAddModal(true)}>
            Create New Project
          </Button>
        </div>

        {/* Toast */}
        <Toast message={toastMsg} variant={toastVariant} isVisible={toastVisible} onClose={() => setToastVisible(false)} />

        {/* Project List */}
        {projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {projects.map((p) => (
              <Card key={p.id} variant="gold" padding="lg">
                {/* Project Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <Tag variant="gold">{p.category || 'Residential'}</Tag>
                      {p.client_name && <Tag variant="info">Client: {p.client_name}</Tag>}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '1.15rem', fontWeight: 700, color: '#f8f8f8', margin: '0 0 4px 0' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#a0a0a0', margin: 0 }}>
                      {p.location} {p.budget ? `• Budget: ₹${Number(p.budget).toLocaleString('en-IN')}` : ''}
                    </p>
                    {p.client_email && (
                      <p style={{ fontSize: '0.75rem', color: '#6e6e6e', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} /> {p.client_email}
                        {p.client_phone && <><Phone size={12} style={{ marginLeft: '8px' }} /> {p.client_phone}</>}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '1.6rem', fontWeight: 700, color: '#c9a84c' }}>
                      {p.completion_percentage || p.progress || 0}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6e6e6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Overall Completed
                    </div>
                  </div>
                </div>

                <ProgressBar value={p.completion_percentage || p.progress || 0} label="Construction Progress" />

                {/* Expand/Collapse Stages */}
                <button
                  onClick={() => setExpandedProject(expandedProject === p.id ? null : p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
                    color: '#c9a84c', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginTop: '14px',
                    fontFamily: 'inherit', padding: '6px 0',
                  }}
                >
                  {expandedProject === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {expandedProject === p.id ? 'Hide' : 'Show'} Milestone Stages ({(p.stages || []).length})
                </button>

                {/* Stages */}
                {expandedProject === p.id && (
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(p.stages || []).map((stage) => (
                      <Card key={stage.id} variant={stage.status === 'completed' ? 'default' : stage.status === 'in_progress' || stage.status === 'awaiting_approval' ? 'gold' : 'outlined'} padding="md">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#6e6e6e', fontWeight: 600 }}>Stage 0{stage.id}</span>
                            {getStageStatusBadge(stage)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* Dual Approval Indicators */}
                            <span style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px', color: stage.builder_approved ? '#4ade80' : '#6e6e6e' }}>
                              {stage.builder_approved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                              Builder
                            </span>
                            <span style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px', color: stage.client_approved ? '#4ade80' : '#6e6e6e' }}>
                              {stage.client_approved ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                              Client
                            </span>
                          </div>
                        </div>

                        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8f8f8', margin: '0 0 8px 0' }}>{stage.name}</h5>

                        {/* Documents */}
                        {(stage.documents || []).length > 0 && (
                          <div style={{ marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#6e6e6e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                              Uploaded Documents ({stage.documents.length})
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                              {stage.documents.map((doc, di) => (
                                <div key={di} style={{
                                  display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px',
                                  background: '#181818', borderRadius: '6px', fontSize: '0.78rem', color: '#a0a0a0',
                                }}>
                                  <FileText size={14} color="#c9a84c" />
                                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                                  <span style={{ fontSize: '0.68rem', color: '#4a4a4a' }}>{doc.uploaded_by}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {(stage.status === 'in_progress' || stage.status === 'awaiting_approval') && (
                            <>
                              <Button size="sm" variant="outline" icon={Upload} onClick={() => openStageUpload(p.id, stage.id)}>
                                Upload Documents
                              </Button>
                              {!stage.builder_approved && (
                                <Button size="sm" variant="success" icon={Check} onClick={() => handleBuilderApprove(p.id, stage.id)}>
                                  Builder Approve
                                </Button>
                              )}
                            </>
                          )}
                          {stage.status === 'completed' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#4ade80' }}>
                              <CheckCircle2 size={14} /> Both parties signed off
                            </div>
                          )}
                          {stage.status === 'pending' && (
                            <span style={{ fontSize: '0.78rem', color: '#4a4a4a' }}>Awaiting prior stage completion</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: '20px' }}>
            <EmptyState
              icon={Building}
              title="No Active Projects Created Yet"
              description='Click "Create New Project" to set up a client project with milestone roadmap, file uploads, and dual approval tracking.'
              action={<Button icon={Plus} onClick={() => setShowAddModal(true)}>Create First Project</Button>}
            />
          </div>
        )}

        {/* Create Project Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Client Project" size="lg">
          <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Divider label="Client Assignment (Registered Client Only)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Select
                label="Select Registered Client"
                required
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                options={[
                  { value: '', label: '-- Choose a Registered Client to Avoid Unregistered Entries --' },
                  ...registeredClients.map((c) => ({
                    value: c.id || c.email,
                    label: `${c.full_name} (${c.email})${c.phone ? ` • ${c.phone}` : ''}`
                  }))
                ]}
                hint="Enforced client selection ensures project records link strictly to registered customer accounts."
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '-4px' }}>
                <a
                  href="/dashboard/customers"
                  style={{ fontSize: '0.75rem', color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}
                >
                  + Onboard New Client in Portfolio →
                </a>
              </div>
            </div>

            {/* Selected Client Verified Preview using Astryx Card */}
            {selectedClientId && newProject.client_name ? (
              <Card variant="gold" padding="sm">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c9a84c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="#c9a84c" /> Registered Account Verified
                  </span>
                  <Tag variant="success">Active Registered Client</Tag>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8f8f8', marginTop: '4px' }}>
                  {newProject.client_name}
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#a0a0a0', marginTop: '4px' }}>
                  {newProject.client_email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={13} color="#c9a84c" /> {newProject.client_email}
                    </span>
                  )}
                  {newProject.client_phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={13} color="#c9a84c" /> {newProject.client_phone}
                    </span>
                  )}
                </div>
              </Card>
            ) : (
              <Card variant="outlined" padding="sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.8rem' }}>
                  <AlertCircle size={16} />
                  <span>Please select a registered client above. Unregistered entries cannot be created.</span>
                </div>
              </Card>
            )}

            <Divider label="Project Details" />
            <TextInput
              label="Project Title" required placeholder="e.g. Channarayapatna Villa Project"
              value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <Select
                label="Category" value={newProject.category}
                onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                options={[
                  { value: 'residential', label: 'Residential' },
                  { value: 'commercial', label: 'Commercial' },
                  { value: 'interior', label: 'Interior' },
                  { value: 'renovation', label: 'Renovation' },
                ]}
              />
              <TextInput
                label="Location / Site" required placeholder="e.g. BM Road, Channarayapatna"
                value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
              />
              <TextInput
                label="Total Budget (INR)" type="number" placeholder="e.g. 5000000"
                value={newProject.budget} onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
              />
            </div>
            <TextArea
              label="Project Scope / Notes" rows={2}
              placeholder="Key features, square footage, specifications..."
              value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />

            <Divider label="Client Requirements (Plain Text)" />
            <TextArea
              label="Client's Requirements (In their own words)" rows={4}
              placeholder="Let the client describe what they want in plain words... e.g. 'I want a 3BHK villa with modern design, open kitchen, garden area, and smart home features. Budget is flexible but prefer quality materials...'"
              value={newProject.client_requirements}
              onChange={(e) => setNewProject({ ...newProject, client_requirements: e.target.value })}
              showCharCount maxLength={5000}
              hint="This will be used to generate the SRS document"
            />

            <Button type="submit" fullWidth size="lg">
              Create Project Roadmap
            </Button>
          </form>
        </Modal>

        {/* Stage Upload Modal */}
        <Modal isOpen={showStageUploadModal} onClose={() => setShowStageUploadModal(false)} title="Upload Stage Documents" size="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FileUpload
              label="Upload construction documents for this stage"
              multiple
              onFilesSelected={(files) => setStageFiles(prev => [...prev, ...files])}
              files={stageFiles}
              hint="Upload blueprints, reports, photos, invoices, permits — any relevant documents"
            />
            <Button fullWidth onClick={handleStageDocUpload} disabled={stageFiles.length === 0} icon={Upload}>
              Upload {stageFiles.length} Document(s)
            </Button>
          </div>
        </Modal>
      </div>
    </>
  );
}
