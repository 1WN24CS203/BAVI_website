'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardCheck, Plus, CheckCircle2, AlertTriangle, XCircle, Clock,
  Calendar, User, Building, Search, FileText
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, SearchInput, TextArea } from '@/components/astryx';

export default function QualityInspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newInsp, setNewInsp] = useState({
    title: '',
    projectName: '',
    inspectorName: '',
    stage: 'Civil Construction',
    category: 'Structural',
    status: 'PASSED',
    score: '100/100',
    notes: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_inspections_registry');
      if (stored) {
        setInspections(JSON.parse(stored));
      } else {
        setInspections([]);
      }
    } catch {
      setInspections([]);
    }
  }, []);

  const saveInspections = (updated) => {
    setInspections(updated);
    try {
      localStorage.setItem('bavi_inspections_registry', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newInsp.title.trim()) return;

    const entry = {
      id: 'insp-' + Date.now(),
      ...newInsp,
      inspectionDate: new Date().toISOString().split('T')[0],
    };

    saveInspections([entry, ...inspections]);
    setModalOpen(false);
    setNewInsp({
      title: '',
      projectName: 'Villa Serenity Penthouse',
      inspectorName: 'Er. Rajesh Kumar',
      stage: 'Civil Construction',
      category: 'Structural',
      status: 'PASSED',
      score: '95/100',
      notes: '',
    });
  };

  const filtered = inspections.filter(item => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--astryx-bg-primary)' }}>
      <DesignerHeader
        title="Quality & Site Inspections"
        subtitle="Construction department audit logs, structural verification, and snag lists"
      />

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: '24px 0' }}>
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid #4ade80' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Total Passed Audits</span>
          <h2 style={{ margin: '6px 0 0', color: '#4ade80', fontSize: '1.8rem' }}>
            {inspections.filter(i => i.status === 'PASSED').length}
          </h2>
        </Card>
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid #fbbf24' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Action Required</span>
          <h2 style={{ margin: '6px 0 0', color: '#fbbf24', fontSize: '1.8rem' }}>
            {inspections.filter(i => i.status === 'ACTION_REQUIRED').length}
          </h2>
        </Card>
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid #60a5fa' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Scheduled Inspections</span>
          <h2 style={{ margin: '6px 0 0', color: '#60a5fa', fontSize: '1.8rem' }}>
            {inspections.filter(i => i.status === 'SCHEDULED').length}
          </h2>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
          <SearchInput
            placeholder="Search inspections, engineers, sites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '320px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'PASSED', 'ACTION_REQUIRED', 'SCHEDULED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  border: filterStatus === st ? '1px solid var(--astryx-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: filterStatus === st ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                  color: filterStatus === st ? 'var(--astryx-gold-light)' : '#888',
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          New Inspection Report
        </Button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map(item => (
          <Card key={item.id} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{item.title}</h3>
                  <Badge variant={item.status === 'PASSED' ? 'success' : (item.status === 'ACTION_REQUIRED' ? 'warning' : 'info')}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                  <span style={{ fontSize: '0.78rem', color: 'var(--astryx-gold)', fontWeight: 600 }}>Score: {item.score}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#888', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Building size={13} /> {item.projectName}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={13} /> {item.inspectorName}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} /> {item.inspectionDate}
                  </span>
                  <span style={{ color: '#aaa' }}>Category: {item.category}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" icon={<FileText size={14} />}>View Full Audit</Button>
              </div>
            </div>

            {item.notes && (
              <div style={{ marginTop: '14px', background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: '8px', borderLeft: '2px solid var(--astryx-gold)', fontSize: '0.85rem', color: '#ccc' }}>
                <strong style={{ color: 'var(--astryx-gold-light)', marginRight: '6px' }}>Inspector Findings:</strong>
                {item.notes}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Quality Inspection Audit">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Inspection Title *</label>
            <TextInput
              required
              placeholder="e.g. Pre-pour Reinforcement Steel Verification"
              value={newInsp.title}
              onChange={(e) => setNewInsp({ ...newInsp, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Project *</label>
              <TextInput
                value={newInsp.projectName}
                onChange={(e) => setNewInsp({ ...newInsp, projectName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Site Engineer / Inspector *</label>
              <TextInput
                value={newInsp.inspectorName}
                onChange={(e) => setNewInsp({ ...newInsp, inspectorName: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Category *</label>
              <Select
                value={newInsp.category}
                onChange={(e) => setNewInsp({ ...newInsp, category: e.target.value })}
                options={[
                  { value: 'Structural', label: 'Structural' },
                  { value: 'Electrical', label: 'Electrical' },
                  { value: 'Plumbing & Drainage', label: 'Plumbing & Drainage' },
                  { value: 'HVAC', label: 'HVAC' },
                  { value: 'Finishing & Joinery', label: 'Finishing & Joinery' },
                  { value: 'Waterproofing', label: 'Waterproofing' },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Result Status *</label>
              <Select
                value={newInsp.status}
                onChange={(e) => setNewInsp({ ...newInsp, status: e.target.value })}
                options={[
                  { value: 'PASSED', label: 'Passed' },
                  { value: 'ACTION_REQUIRED', label: 'Action Required' },
                  { value: 'SCHEDULED', label: 'Scheduled' },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Score *</label>
              <TextInput
                value={newInsp.score}
                onChange={(e) => setNewInsp({ ...newInsp, score: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Inspector Notes & Rectifications</label>
            <TextArea
              rows={3}
              placeholder="Detail observations, defects, or approvals..."
              value={newInsp.notes}
              onChange={(e) => setNewInsp({ ...newInsp, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Audit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
