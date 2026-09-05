'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Check, Clock, Edit3, Send, Eye, AlertCircle } from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextArea, Modal, Toast, Tabs, EmptyState, Divider, Tag, Stepper, Accordion } from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

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
    try {
      const stored = localStorage.getItem('bavi_projects');
      if (stored) setProjects(JSON.parse(stored));
    } catch {}
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
    if (!selectedProject?.client_requirements) {
      showToast('No client requirements to generate SRS from');
      return;
    }
    const req = selectedProject.client_requirements;
    setSrsContent({
      title: `SRS: ${selectedProject.title}`,
      scope: `This Software Requirements Specification covers the architectural and construction requirements for ${selectedProject.title} at ${selectedProject.location || 'specified location'}. Budget: ₹${Number(selectedProject.budget || 0).toLocaleString('en-IN')}.`,
      functional: `Based on client's requirements:\n\n${req}\n\nKey deliverables to be extracted and documented by the architect.`,
      nonFunctional: 'Quality standards: IS codes compliance, structural safety, fire safety, aesthetic finish quality as per BAVI standards.',
      materials: 'Materials to be specified based on client budget range and quality preferences.',
      timeline: `Estimated project timeline from ${selectedProject.start_date || 'TBD'} to ${selectedProject.estimated_completion || 'TBD'}.`,
      budget: `Total budget: ₹${Number(selectedProject.budget || 0).toLocaleString('en-IN')}. Breakdown to be defined per milestone.`,
      notes: 'Additional notes and clarifications to be added after client consultation.',
    });
    showToast('SRS template generated from client requirements!');
  };

  const handleSaveSRS = () => {
    if (!selectedProject) return;
    const updated = projects.map(p => {
      if (p.id === selectedProject.id) {
        return { ...p, srs_content: srsContent, srs_status: 'draft' };
      }
      return p;
    });
    setProjects(updated);
    setSelectedProject({ ...selectedProject, srs_content: srsContent, srs_status: 'draft' });
    localStorage.setItem('bavi_projects', JSON.stringify(updated));
    showToast('SRS document saved successfully!');
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
