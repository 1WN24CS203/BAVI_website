'use client';

import { useState, useEffect } from 'react';
import {
  HardHat, Plus, Star, Phone, Mail, CheckCircle2, AlertCircle,
  Building, Search, ShieldCheck, MapPin, Users
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, SearchInput } from '@/components/astryx';

export default function ContractorRegistryPage() {
  const [contractors, setContractors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newContractor, setNewContractor] = useState({
    agencyName: '',
    leadContact: '',
    specialty: 'Civil & Structural Masonry',
    phone: '',
    email: '',
    workforceCount: 0,
    currentSite: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_contractors_registry');
      if (stored) {
        setContractors(JSON.parse(stored));
      } else {
        setContractors([]);
      }
    } catch {
      setContractors([]);
    }
  }, []);

  const saveContractors = (updated) => {
    setContractors(updated);
    try {
      localStorage.setItem('bavi_contractors_registry', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newContractor.agencyName.trim()) return;

    const entry = {
      id: 'cntr-' + Date.now(),
      ...newContractor,
      activeProjects: 1,
      rating: '4.8/5.0',
      complianceStatus: 'VERIFIED',
    };

    saveContractors([entry, ...contractors]);
    setModalOpen(false);
    setNewContractor({
      agencyName: '',
      leadContact: '',
      specialty: 'Civil & Structural Masonry',
      phone: '',
      email: '',
      workforceCount: 10,
      currentSite: 'Villa Serenity Penthouse',
    });
  };

  const filtered = contractors.filter(c =>
    c.agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.leadContact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--astryx-bg-primary)' }}>
      <DesignerHeader
        title="Contractor & Vendor Registry"
        subtitle="Vetted specialist agencies, on-site personnel counts, and compliance ratings"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', gap: '16px', flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Search agency, trade specialty, or site..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '360px' }}
        />
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Register Partner Agency
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filtered.map(c => (
          <Card key={c.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{c.agencyName}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--astryx-gold-light)', fontWeight: 500 }}>{c.specialty}</span>
                </div>
                <Badge variant={c.complianceStatus === 'VERIFIED' ? 'success' : 'warning'}>
                  {c.complianceStatus}
                </Badge>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#777' }}>Lead In-Charge:</span>
                  <span style={{ color: '#eee' }}>{c.leadContact}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#777' }}>Active Site:</span>
                  <span style={{ color: '#bbb' }}>{c.currentSite}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#777' }}>On-Site Laborers:</span>
                  <span style={{ color: '#bbb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} /> {c.workforceCount} Personnel
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#777' }}>Performance Rating:</span>
                  <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Star size={12} fill="#fbbf24" /> {c.rating}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#aaa', marginBottom: '14px' }}>
                <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#888', textDecoration: 'none' }}>
                  <Phone size={12} /> {c.phone}
                </a>
                <a href={`mailto:${c.email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#888', textDecoration: 'none' }}>
                  <Mail size={12} /> Email
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              <Button variant="secondary" size="sm" style={{ flex: 1 }}>Labor Roll</Button>
              <Button variant="secondary" size="sm" style={{ flex: 1 }}>Safety Card</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Contractor Agency">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Agency Name *</label>
            <TextInput
              required
              placeholder="e.g. MasterStone Granite & Tile Works"
              value={newContractor.agencyName}
              onChange={(e) => setNewContractor({ ...newContractor, agencyName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Trade Specialty *</label>
              <Select
                value={newContractor.specialty}
                onChange={(e) => setNewContractor({ ...newContractor, specialty: e.target.value })}
                options={[
                  { value: 'Civil & Structural Masonry', label: 'Civil & Structural Masonry' },
                  { value: 'Electrical & Automation', label: 'Electrical & Automation' },
                  { value: 'Custom Millwork & Italian Joinery', label: 'Custom Millwork & Italian Joinery' },
                  { value: 'Plumbing & Concealed Piping', label: 'Plumbing & Concealed Piping' },
                  { value: 'HVAC & Climate Ducting', label: 'HVAC & Climate Ducting' },
                  { value: 'Glazing & Façade', label: 'Glazing & Façade' },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Site Lead Person *</label>
              <TextInput
                required
                placeholder="Name of contractor supervisor"
                value={newContractor.leadContact}
                onChange={(e) => setNewContractor({ ...newContractor, leadContact: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Contact Phone *</label>
              <TextInput
                required
                placeholder="+91 98..."
                value={newContractor.phone}
                onChange={(e) => setNewContractor({ ...newContractor, phone: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Official Email</label>
              <TextInput
                placeholder="agency@domain.com"
                value={newContractor.email}
                onChange={(e) => setNewContractor({ ...newContractor, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Assigned Project *</label>
              <TextInput
                value={newContractor.currentSite}
                onChange={(e) => setNewContractor({ ...newContractor, currentSite: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Labor Strength Count</label>
              <TextInput
                type="number"
                value={newContractor.workforceCount}
                onChange={(e) => setNewContractor({ ...newContractor, workforceCount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Onboard Contractor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
