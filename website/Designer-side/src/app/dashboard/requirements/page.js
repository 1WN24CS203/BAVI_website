'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Check, Clock, Edit3, Send, Eye, AlertCircle } from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextArea, Modal, Toast, Tabs, EmptyState, Divider, Tag, Stepper, Accordion } from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function RequirementsPage() {
  const { designer, logActivity } = useDesignerAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [srsContent, setSrsContent] = useState({
    title: '', scope: '', functional: '', nonFunctional: '', materials: '', timeline: '', budget: '', notes: '',
  });
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const fetchProjectsList = async () => {
      let list = [];
      if (isSupabaseConfigured()) {
        try {
          const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
          if (data && data.length > 0) {
            list = data.map(p => ({
              ...p,
              client_requirements: p.client_requirements_plain_text || p.client_requirements || '',
            }));
          }
        } catch (err) {
          console.warn('Supabase fetch projects error:', err);
        }
      }
      if (list.length === 0) {
        try {
          const stored = localStorage.getItem('bavi_projects');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              list = parsed.map(p => ({
                ...p,
                client_requirements: p.client_requirements_plain_text || p.client_requirements || '',
              }));
            }
          }
        } catch {}
      }

      // Also merge in the User-side requirements submission (bavi_client_requirements)
      try {
        const clientReqStored = localStorage.getItem('bavi_client_requirements');
        if (clientReqStored) {
          const clientReq = JSON.parse(clientReqStored);
          if (clientReq && clientReq.clientPlainWords) {
            const reqProjectId = clientReq.projectId || clientReq.id;
            const existingIdx = list.findIndex(p => p.id === reqProjectId);
            if (existingIdx >= 0) {
              // Update existing project with client requirements
              list[existingIdx] = {
                ...list[existingIdx],
                client_requirements: clientReq.clientPlainWords,
                client_requirements_plain_text: clientReq.clientPlainWords,
              };
            } else if (reqProjectId) {
              // Add as a new entry so it shows in the selector
              list.unshift({
                id: reqProjectId,
                title: clientReq.projectName || 'Client Residence Project',
                client_name: clientReq.clientName || 'Client',
                client_requirements: clientReq.clientPlainWords,
                client_requirements_plain_text: clientReq.clientPlainWords,
                srs_status: clientReq.status === 'SRS_CLIENT_APPROVED' ? 'approved' : (clientReq.srs ? 'review' : 'draft'),
                srs_content: clientReq.srs ? JSON.stringify(clientReq.srs) : null,
                created_at: clientReq.submittedAt || new Date().toISOString(),
                stages: [],
              });
            }
          }
        }
      } catch {}

      setProjects(list);
    };

    fetchProjectsList();
  }, []);


  const showToast = (msg) => { setToastMsg(msg); setToastVisible(true); };

  const handleSelectProject = (proj) => {
    setSelectedProject(proj);
    if (proj.srs_content) {
      try {
        setSrsContent(typeof proj.srs_content === 'string' ? JSON.parse(proj.srs_content) : proj.srs_content);
      } catch {
        setSrsContent({ title: proj.title || '', scope: '', functional: '', nonFunctional: '', materials: '', timeline: '', budget: '', notes: '' });
      }
    } else {
      setSrsContent({ title: proj.title || '', scope: '', functional: '', nonFunctional: '', materials: '', timeline: '', budget: '', notes: '' });
    }
  };

  const handleGenerateSRS = () => {
    const reqText = selectedProject?.client_requirements || selectedProject?.client_requirements_plain_text;
    if (!reqText) {
      showToast('No client requirements found to generate SRS from');
      return;
    }
    const req = reqText;
    setSrsContent({
      title: `SRS: ${selectedProject.title}`,
      scope: `This Software & Architectural Requirements Specification covers the structural and interior requirements for ${selectedProject.title} at ${selectedProject.location || 'specified location'}. Budget: ₹${Number(selectedProject.budget || 0).toLocaleString('en-IN')}.`,
      functional: `Based on client's plain-text requirements:\n\n${req}\n\nKey deliverables to be executed and verified by the architectural team.`,
      nonFunctional: 'Quality standards: IS codes compliance, structural safety, moisture resistance, and premium BAVI finishing.',
      materials: 'Materials specified to match client aesthetic preferences and luxury grade budget allocations.',
      timeline: `Estimated project milestone roadmap from ${selectedProject.start_date || 'Project Initiation'} to ${selectedProject.estimated_completion || 'Final Handover'}.`,
      budget: `Total verified budget: ₹${Number(selectedProject.budget || 0).toLocaleString('en-IN')}. Dual stage permissions enforced.`,
      notes: 'Blueprint and design sanctions to be finalized prior to foundation execution.',
    });
    showToast('SRS template generated from client requirements!');
  };

  const handleSaveSRS = async () => {
    if (!selectedProject) return;
    const updated = projects.map(p => {
      if (p.id === selectedProject.id) {
        return { ...p, srs_content: srsContent, srs_status: 'review' };
      }
      return p;
    });
    setProjects(updated);
    setSelectedProject({ ...selectedProject, srs_content: srsContent, srs_status: 'review' });
    try {
      localStorage.setItem('bavi_projects', JSON.stringify(updated));
    } catch {}

    // Sync SRS back to bavi_client_requirements so the User-side can see the published SRS
    try {
      const clientReqStored = localStorage.getItem('bavi_client_requirements');
      const clientReq = clientReqStored ? JSON.parse(clientReqStored) : {};
      const isMatchingProject =
        clientReq.projectId === selectedProject.id ||
        clientReq.id === selectedProject.id ||
        clientReq.clientName === selectedProject.client_name;

      if (isMatchingProject || !clientReq.projectId) {
        const updatedClientReq = {
          ...clientReq,
          projectId: selectedProject.id,
          projectName: selectedProject.title || clientReq.projectName,
          status: 'SRS_READY_FOR_REVIEW',
          srs: {
            title: srsContent.title,
            scope: srsContent.scope,
            functional: srsContent.functional,
            nonFunctional: srsContent.nonFunctional,
            materials: srsContent.materials,
            timeline: srsContent.timeline,
            budget: srsContent.budget,
            notes: srsContent.notes,
            clientApproved: false,
          },
        };
        localStorage.setItem('bavi_client_requirements', JSON.stringify(updatedClientReq));
      }
    } catch (err) {
      console.warn('Failed to sync SRS to bavi_client_requirements:', err);
    }

    if (isSupabaseConfigured() && selectedProject.id && !String(selectedProject.id).startsWith('proj-')) {
      try {
        await supabase.from('projects').update({
          srs_content: JSON.stringify(srsContent),
          srs_status: 'review',
        }).eq('id', selectedProject.id);
      } catch (err) {
        console.warn('Failed to sync SRS to Supabase:', err);
      }
    }

    showToast('SRS document saved and published to client portal!');
    logActivity('saved_srs', 'requirement', selectedProject.title, {});
  };


  const srsSteps = [
    { label: 'Client Submits Requirements' },
    { label: 'Builder Generates SRS' },
    { label: 'Client Reviews SRS' },
    { label: 'SRS Approved' },
  ];

  const getSRSStepIndex = (status) => {
    if (status === 'approved') return 3;
    if (status === 'review') return 2;
    if (status === 'draft') return 1;
    return 0;
  };

  return (
    <>
      <DesignerHeader
        title="Client Requirements & SRS Builder"
        subtitle="Convert client's plain-text requirements into structured Software Requirements Specification documents"
      />

      <div style={{ padding: '0 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', minHeight: '500px' }}>
          {/* Project Selector */}
          <div>
            <h4 style={{ fontSize: '0.8rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px', marginBottom: '10px' }}>
              Select Project
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {projects.map((p) => (
                <Card
                  key={p.id}
                  variant={selectedProject?.id === p.id ? 'gold' : 'default'}
                  padding="sm"
                  onClick={() => handleSelectProject(p)}
                  hoverable
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8f8f8' }}>{p.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#a0a0a0' }}>Client: {p.client_name || 'Not set'}</div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <Badge variant={p.srs_status === 'approved' ? 'success' : p.srs_status === 'draft' ? 'warning' : 'neutral'} size="sm">
                      SRS: {p.srs_status || 'not_started'}
                    </Badge>
                  </div>
                </Card>
              ))}
              {projects.length === 0 && (
                <Card variant="outlined" padding="md">
                  <p style={{ fontSize: '0.82rem', color: '#6e6e6e', textAlign: 'center' }}>
                    No projects found. Create a project first.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* SRS Builder */}
          {selectedProject ? (
            <div>
              {/* Progress Stepper */}
              <Card variant="elevated" padding="md" style={{ marginBottom: '16px' }}>
                <Stepper steps={srsSteps} currentStep={getSRSStepIndex(selectedProject.srs_status)} />
              </Card>

              {/* Client's Raw Requirements */}
              <Card variant="gold" padding="md" style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#c9a84c', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px', marginBottom: '8px' }}>
                  Client's Requirements (Plain Text)
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#f8f8f8', lineHeight: 1.7, padding: '12px', background: '#181818', borderRadius: '8px', minHeight: '60px' }}>
                  {selectedProject.client_requirements || 'No requirements submitted by client yet.'}
                </div>
                <Button variant="primary" size="sm" icon={Sparkles} onClick={handleGenerateSRS} style={{ marginTop: '12px' }}>
                  Generate SRS from Requirements
                </Button>
              </Card>

              {/* SRS Form */}
              <Card variant="default" padding="lg">
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#f8f8f8', marginBottom: '16px' }}>
                  SRS Document Builder
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <TextArea label="SRS Title" value={srsContent.title} onChange={(e) => setSrsContent({ ...srsContent, title: e.target.value })} rows={1} />
                  <TextArea label="Project Scope" value={srsContent.scope} onChange={(e) => setSrsContent({ ...srsContent, scope: e.target.value })} rows={3} />
                  <TextArea label="Functional Requirements" value={srsContent.functional} onChange={(e) => setSrsContent({ ...srsContent, functional: e.target.value })} rows={5} hint="Detailed list of what the project must deliver" />
                  <TextArea label="Non-Functional Requirements" value={srsContent.nonFunctional} onChange={(e) => setSrsContent({ ...srsContent, nonFunctional: e.target.value })} rows={3} hint="Quality standards, safety codes, compliance" />
                  <TextArea label="Material Specifications" value={srsContent.materials} onChange={(e) => setSrsContent({ ...srsContent, materials: e.target.value })} rows={3} />
                  <TextArea label="Timeline & Milestones" value={srsContent.timeline} onChange={(e) => setSrsContent({ ...srsContent, timeline: e.target.value })} rows={2} />
                  <TextArea label="Budget Breakdown" value={srsContent.budget} onChange={(e) => setSrsContent({ ...srsContent, budget: e.target.value })} rows={2} />
                  <TextArea label="Additional Notes" value={srsContent.notes} onChange={(e) => setSrsContent({ ...srsContent, notes: e.target.value })} rows={2} />
                  <Button fullWidth icon={Check} onClick={handleSaveSRS}>Save SRS Document</Button>
                </div>
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Select a Project"
              description="Choose a project from the left to view client requirements and build the SRS document."
            />
          )}
        </div>

        <Toast message={toastMsg} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    </>
  );
}
