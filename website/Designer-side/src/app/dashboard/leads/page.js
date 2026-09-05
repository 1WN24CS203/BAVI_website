'use client';

import { useState, useEffect } from 'react';
import {
  Target, Plus, Phone, Mail, Calendar, DollarSign, ArrowRight,
  CheckCircle2, Clock, Filter, User, Building, Sparkles
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, SearchInput } from '@/components/astryx';

const PIPELINE_STAGES = [
  'New Inquiry',
  'Consultation Booked',
  'Site Survey Done',
  'Proposal Sent',
  'Contract Signed',
];

export default function LeadPipelinePage() {
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    clientName: '',
    propertyType: '',
    location: 'Bangalore',
    budget: '',
    stage: 'New Inquiry',
    source: 'Direct Client Portal',
    phone: '',
    email: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_marketing_leads');
      if (stored) {
        setLeads(JSON.parse(stored));
      } else {
        setLeads([]);
      }
    } catch {
      setLeads([]);
    }
  }, []);

  const saveLeads = (updated) => {
    setLeads(updated);
    try {
      localStorage.setItem('bavi_marketing_leads', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const advanceStage = (id) => {
    const updated = leads.map(l => {
      if (l.id === id) {
        const currIdx = PIPELINE_STAGES.indexOf(l.stage);
        if (currIdx < PIPELINE_STAGES.length - 1) {
          return { ...l, stage: PIPELINE_STAGES[currIdx + 1] };
        }
      }
      return l;
    });
    saveLeads(updated);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newLead.clientName.trim()) return;

    const entry = {
      id: 'lead-' + Date.now(),
      ...newLead,
      assignedTo: 'Marketing Team',
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveLeads([entry, ...leads]);
    setModalOpen(false);
    setNewLead({
      clientName: '',
      propertyType: '',
      location: 'Bangalore',
      budget: '₹ 60 Lakhs',
      stage: 'New Inquiry',
      source: 'Website Callback Request',
      phone: '',
      email: '',
    });
  };

  const filtered = leads.filter(l =>
    l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.propertyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--astryx-bg-primary)' }}>
      <DesignerHeader
        title="Marketing & Sales Lead Pipeline"
        subtitle="Manage prospective clients from initial inquiry to signed construction agreement"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', gap: '16px', flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Search client, property, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '340px' }}
        />
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Add Prospective Lead
        </Button>
      </div>

      {/* Kanban Stages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', alignItems: 'flex-start' }}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = filtered.filter(l => l.stage === stage);
          return (
            <div
              key={stage}
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '16px',
                minHeight: '400px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#eee', fontWeight: 600 }}>{stage}</h4>
                <Badge variant={stage === 'Contract Signed' ? 'success' : 'gold'}>
                  {stageLeads.length}
                </Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stageLeads.map(l => (
                  <Card key={l.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>{l.clientName}</h5>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#888' }}>{l.propertyType}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '8px' }}>
                      <span style={{ color: '#777' }}>Budget:</span>
                      <span style={{ color: 'var(--astryx-gold-light)', fontWeight: 600 }}>{l.budget}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#aaa', marginBottom: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone size={11} /> {l.phone}
                      </span>
                    </div>

                    {stage !== 'Contract Signed' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        style={{ width: '100%', fontSize: '0.75rem' }}
                        icon={<ArrowRight size={13} />}
                        onClick={() => advanceStage(l.id)}
                      >
                        Advance Stage
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Sales Lead">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Client Name(s) *</label>
            <TextInput
              required
              placeholder="e.g. Anand & Shilpa Hegde"
              value={newLead.clientName}
              onChange={(e) => setNewLead({ ...newLead, clientName: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Property Scope & Carpet Area *</label>
            <TextInput
              required
              placeholder="e.g. 3BHK Luxury Duplex (3,400 sq.ft)"
              value={newLead.propertyType}
              onChange={(e) => setNewLead({ ...newLead, propertyType: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Contact Phone *</label>
              <TextInput
                required
                placeholder="+91 98..."
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Email Address</label>
              <TextInput
                placeholder="client@domain.com"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Estimated Budget *</label>
              <TextInput
                value={newLead.budget}
                onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Initial Stage</label>
              <Select
                value={newLead.stage}
                onChange={(e) => setNewLead({ ...newLead, stage: e.target.value })}
                options={PIPELINE_STAGES.map(s => ({ value: s, label: s }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Lead</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
