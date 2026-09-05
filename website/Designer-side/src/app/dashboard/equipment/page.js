'use client';

import { useState, useEffect } from 'react';
import {
  Wrench, Plus, CheckCircle2, Clock, AlertTriangle, Building,
  Search, Truck, ShieldCheck, Gauge, Calendar
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, SearchInput } from '@/components/astryx';

export default function EquipmentTrackerPage() {
  const [equipment, setEquipment] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newEquip, setNewEquip] = useState({
    equipmentName: '',
    category: 'Heavy Earthmoving',
    serialNo: '',
    assignedProject: '',
    operator: '',
    operationalStatus: 'OPERATIONAL',
    maintenanceDue: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_equipment_registry');
      if (stored) {
        setEquipment(JSON.parse(stored));
      } else {
        setEquipment([]);
      }
    } catch {
      setEquipment([]);
    }
  }, []);

  const saveEquipment = (updated) => {
    setEquipment(updated);
    try {
      localStorage.setItem('bavi_equipment_registry', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newEquip.equipmentName.trim()) return;

    const entry = {
      id: 'eq-' + Date.now(),
      ...newEquip,
      hoursLogged: '0 hrs',
    };

    saveEquipment([entry, ...equipment]);
    setModalOpen(false);
    setNewEquip({
      equipmentName: '',
      category: 'Heavy Earthmoving',
      serialNo: '',
      assignedProject: 'Villa Serenity Penthouse',
      operator: '',
      operationalStatus: 'OPERATIONAL',
      maintenanceDue: '2026-10-01',
    });
  };

  const filtered = equipment.filter(eq =>
    eq.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.assignedProject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.serialNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--astryx-bg-primary)' }}>
      <DesignerHeader
        title="Heavy Machinery & Equipment Tracker"
        subtitle="Track site plant assets, operational health, and preventative maintenance"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', gap: '16px', flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Search machinery, asset serial, or site..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '340px' }}
        />
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Register Equipment Asset
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filtered.map(eq => (
          <Card key={eq.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
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
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#fff' }}>{eq.equipmentName}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{eq.serialNo}</span>
                  </div>
                </div>
                <Badge variant={eq.operationalStatus === 'OPERATIONAL' ? 'success' : 'warning'}>
                  {eq.operationalStatus.replace('_', ' ')}
                </Badge>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#777' }}>Deployment Site:</span>
                  <span style={{ color: '#eee', fontWeight: 500 }}>{eq.assignedProject}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#777' }}>Designated Operator:</span>
                  <span style={{ color: 'var(--astryx-gold-light)' }}>{eq.operator || 'Assigned Crew'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#777' }}>Category:</span>
                  <span style={{ color: '#bbb' }}>{eq.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#777' }}>Next Maintenance:</span>
                  <span style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {eq.maintenanceDue}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
              <Button variant="secondary" size="sm" style={{ flex: 1 }}>Service Log</Button>
              <Button variant="secondary" size="sm" style={{ flex: 1 }}>Reassign Site</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Machinery / Plant Asset">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Equipment Model & Name *</label>
            <TextInput
              required
              placeholder="e.g. JCB 3DX Super Backhoe Loader"
              value={newEquip.equipmentName}
              onChange={(e) => setNewEquip({ ...newEquip, equipmentName: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Category *</label>
              <Select
                value={newEquip.category}
                onChange={(e) => setNewEquip({ ...newEquip, category: e.target.value })}
                options={[
                  { value: 'Heavy Earthmoving', label: 'Heavy Earthmoving' },
                  { value: 'Concreting Machinery', label: 'Concreting Machinery' },
                  { value: 'Survey & Alignment', label: 'Survey & Alignment' },
                  { value: 'Access & Staging', label: 'Access & Staging' },
                  { value: 'Power & Generator', label: 'Power & Generator' },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Asset / Serial No *</label>
              <TextInput
                required
                placeholder="e.g. JCB-3DX-BLR-12"
                value={newEquip.serialNo}
                onChange={(e) => setNewEquip({ ...newEquip, serialNo: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Deployed Project *</label>
              <TextInput
                value={newEquip.assignedProject}
                onChange={(e) => setNewEquip({ ...newEquip, assignedProject: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Qualified Operator</label>
              <TextInput
                placeholder="Name of operator"
                value={newEquip.operator}
                onChange={(e) => setNewEquip({ ...newEquip, operator: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Equipment Asset</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
