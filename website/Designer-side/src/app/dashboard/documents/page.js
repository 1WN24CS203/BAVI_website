'use client';

import { useState, useEffect } from 'react';
import {
  Upload, FileText, Download, Eye, Plus, Search, Filter,
  CheckCircle2, Clock, AlertCircle, File, FolderKanban, Trash2, ExternalLink
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, SearchInput, EmptyState } from '@/components/astryx';

export default function DocumentUploadCenterPage() {
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '',
    category: 'Architectural Drawings',
    stage: 'Concept Design',
    projectName: '',
    clientName: '',
    fileSize: '5.0 MB',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_documents_registry');
      if (stored) {
        setDocuments(JSON.parse(stored));
      } else {
        setDocuments([]);
      }
    } catch {
      setDocuments([]);
    }

    try {
      const storedClients = localStorage.getItem('bavi_registered_clients');
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      }
      const storedProjects = localStorage.getItem('bavi_projects_registry');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (e) {
      console.warn('Failed to load registered clients or projects:', e);
    }
  }, []);

  const saveDocs = (updated) => {
    setDocuments(updated);
    try {
      localStorage.setItem('bavi_documents_registry', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newDoc.name.trim()) return;

    const doc = {
      id: 'doc-' + Date.now(),
      name: newDoc.name.trim(),
      category: newDoc.category,
      stage: newDoc.stage,
      projectName: newDoc.projectName || 'General Architecture',
      clientName: newDoc.clientName || 'Registered Client',
      fileSize: newDoc.fileSize || '5.0 MB',
      uploadedBy: 'Architect Team',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Uploaded',
      type: newDoc.name.endsWith('.pdf') ? 'pdf' : (newDoc.name.endsWith('.dwg') ? 'cad' : 'doc'),
    };

    saveDocs([doc, ...documents]);
    setUploadModalOpen(false);
    setNewDoc({
      name: '',
      category: 'Architectural Drawings',
      stage: 'Concept Design',
      projectName: '',
      clientName: '',
      fileSize: '5.0 MB',
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this document from the portal?')) {
      saveDocs(documents.filter(d => d.id !== id));
    }
  };

  const filtered = documents.filter(doc => {
    const matchesCat = filterCategory === 'ALL' || doc.category === filterCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ['ALL', 'Architectural Drawings', 'Engineering & Structural', '3D Renders & Visualizations', 'Statutory & Permits', 'Cost Estimates & BOQ'];

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--astryx-bg-primary)' }}>
      <DesignerHeader
        title="Document Upload Center"
        subtitle="Manage architectural blueprints, permits, 3D renders, contracts, and stage verification files"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '300px' }}>
          <SearchInput
            placeholder="Search blueprints, client, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '320px' }}
          />
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  border: filterCategory === cat ? '1px solid var(--astryx-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: filterCategory === cat ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                  color: filterCategory === cat ? 'var(--astryx-gold-light)' : '#888',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" icon={<Upload size={16} />} onClick={() => setUploadModalOpen(true)}>
          Upload Stage Document
        </Button>
      </div>

      {/* Grid of Documents */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Stage Documents Found"
          description={searchQuery || filterCategory !== 'ALL'
            ? "No documents match the active filter criteria."
            : "No architectural or stage verification documents have been uploaded yet. Upload blueprints or permits to verify milestones."}
          action={
            <Button variant="primary" icon={<Upload size={16} />} onClick={() => setUploadModalOpen(true)}>
              Upload First Document
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map(doc => (
            <Card key={doc.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      background: 'rgba(201,168,76,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--astryx-gold)'
                    }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', wordBreak: 'break-all' }}>{doc.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>{doc.fileSize} • {doc.uploadedAt}</span>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'Client Approved' ? 'success' : (doc.status === 'Verified' ? 'gold' : 'warning')}>
                    {doc.status}
                  </Badge>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#777' }}>Project:</span>
                    <span style={{ color: '#eee', fontWeight: 500 }}>{doc.projectName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#777' }}>Client:</span>
                    <span style={{ color: 'var(--astryx-gold-light)' }}>{doc.clientName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#777' }}>Stage:</span>
                    <span style={{ color: '#aaa' }}>{doc.stage}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#777' }}>Category:</span>
                    <span style={{ color: '#bbb' }}>{doc.category}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <Button variant="secondary" size="sm" icon={<Eye size={14} />} style={{ flex: 1 }}>
                  Preview
                </Button>
                <Button variant="secondary" size="sm" icon={<Download size={14} />} style={{ flex: 1 }}>
                  Download
                </Button>
                <Button variant="ghost" size="sm" icon={<Trash2 size={14} style={{ color: '#ff5c5c' }} />} onClick={() => handleDelete(doc.id)} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Stage Verification Document"
      >
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Document / File Name *</label>
            <TextInput
              required
              placeholder="e.g. Master_Plan_Permit_Signed.pdf"
              value={newDoc.name}
              onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Category *</label>
              <Select
                value={newDoc.category}
                onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                options={[
                  { value: 'Architectural Drawings', label: 'Architectural Drawings' },
                  { value: 'Engineering & Structural', label: 'Engineering & Structural' },
                  { value: '3D Renders & Visualizations', label: '3D Renders & Visualizations' },
                  { value: 'Statutory & Permits', label: 'Statutory & Permits' },
                  { value: 'Cost Estimates & BOQ', label: 'Cost Estimates & BOQ' },
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Milestone Stage *</label>
              <Select
                value={newDoc.stage}
                onChange={(e) => setNewDoc({ ...newDoc, stage: e.target.value })}
                options={[
                  { value: 'Concept Design', label: '1. Concept Design' },
                  { value: 'Schematic Design', label: '2. Schematic Design' },
                  { value: 'Design Development', label: '3. Design Development' },
                  { value: 'Working Drawings', label: '4. Working Drawings' },
                  { value: 'Civil Construction', label: '5. Civil Construction' },
                  { value: 'Finishing & Handover', label: '6. Finishing & Handover' },
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Project *</label>
              {projects.length > 0 ? (
                <Select
                  value={newDoc.projectName}
                  onChange={(e) => setNewDoc({ ...newDoc, projectName: e.target.value })}
                  options={[
                    { value: '', label: '-- Select Registered Project --' },
                    ...projects.map(p => ({ value: p.title || p.name, label: p.title || p.name }))
                  ]}
                />
              ) : (
                <TextInput
                  placeholder="e.g. Master Residence"
                  value={newDoc.projectName}
                  onChange={(e) => setNewDoc({ ...newDoc, projectName: e.target.value })}
                />
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Client Name *</label>
              {clients.length > 0 ? (
                <Select
                  value={newDoc.clientName}
                  onChange={(e) => setNewDoc({ ...newDoc, clientName: e.target.value })}
                  options={[
                    { value: '', label: '-- Select Registered Client --' },
                    ...clients.map(c => ({ value: c.name || c.full_name, label: `${c.name || c.full_name}` }))
                  ]}
                />
              ) : (
                <TextInput
                  placeholder="e.g. Client Name"
                  value={newDoc.clientName}
                  onChange={(e) => setNewDoc({ ...newDoc, clientName: e.target.value })}
                />
              )}
            </div>
          </div>

          <div style={{
            border: '2px dashed rgba(201,168,76,0.3)',
            borderRadius: '10px',
            padding: '24px',
            textAlign: 'center',
            background: 'rgba(201,168,76,0.03)',
            cursor: 'pointer'
          }}>
            <Upload size={32} style={{ color: 'var(--astryx-gold)', marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#eee' }}>Drag and drop files here or click to select</p>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>Supports PDF, DWG, DXF, PNG, JPG, XLSX (Max 100MB)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" type="button" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Complete Upload</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
