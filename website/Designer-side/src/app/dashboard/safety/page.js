'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Plus, AlertTriangle, CheckCircle2,
  Calendar, Building, HardHat, FileCheck, Users
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, TextArea } from '@/components/astryx';

const DEFAULT_SAFETY_LOGS = [
  {
    id: 'sft-1',
    incidentType: 'Daily Toolbox Talk & PPE Audit',
    projectName: 'Villa Serenity Penthouse',
    safetyOfficer: 'D. Srinivas (HSE Officer)',
    date: '2026-09-05',
    severity: 'ROUTINE',
    status: 'COMPLIANT',
    workersBriefed: 32,
    details: 'Full PPE mandatory check conducted. All scaffolding harnesses inspected and double-locked before high-elevation exterior plastering.',
  },
  {
    id: 'sft-2',
    incidentType: 'Temporary Electrical Panel Water Ingress Risk',
    projectName: 'Skyline Minimalist Loft',
    safetyOfficer: 'K. Mohan (Safety Lead)',
    date: '2026-09-03',
    severity: 'MODERATE',
    status: 'RESOLVED',
    workersBriefed: 14,
    details: 'Temporary distribution board located near water outlet. Re-routed 4 meters away with weatherproof IP67 enclosure.',
  },
  {
    id: 'sft-3',
    incidentType: 'First Aid Kit & Fire Extinguisher Refill',
    projectName: 'Green Terraces Villa',
    safetyOfficer: 'D. Srinivas (HSE Officer)',
    date: '2026-08-29',
    severity: 'ROUTINE',
    status: 'COMPLIANT',
    workersBriefed: 22,
    details: 'Refilled 4 ABC powder fire extinguishers on ground and first floors. First-aid eye wash station inspected.',
  },
];

export default function SafetyCompliancePage() {
  const [safetyLogs, setSafetyLogs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    incidentType: '',
    projectName: 'Villa Serenity Penthouse',
    safetyOfficer: 'D. Srinivas (HSE Officer)',
    severity: 'ROUTINE',
    status: 'COMPLIANT',
    workersBriefed: 25,
    details: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_safety_registry');
      if (stored) {
        setSafetyLogs(JSON.parse(stored));
      } else {
        setSafetyLogs(DEFAULT_SAFETY_LOGS);
        localStorage.setItem('bavi_safety_registry', JSON.stringify(DEFAULT_SAFETY_LOGS));
      }
    } catch {
      setSafetyLogs(DEFAULT_SAFETY_LOGS);
    }
  }, []);

  const saveLogs = (updated) => {
    setSafetyLogs(updated);
    try {
      localStorage.setItem('bavi_safety_registry', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newLog.incidentType.trim()) return;

    const entry = {
      id: 'sft-' + Date.now(),
      ...newLog,
      date: new Date().toISOString().split('T')[0],
    };

    saveLogs([entry, ...safetyLogs]);
    setModalOpen(false);
    setNewLog({
      incidentType: '',
      projectName: 'Villa Serenity Penthouse',
      safetyOfficer: 'D. Srinivas (HSE Officer)',
      severity: 'ROUTINE',
      status: 'COMPLIANT',
      workersBriefed: 25,
      details: '',
    });
  };

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--astryx-bg-primary)' }}>
      <DesignerHeader
        title="Safety & HSE Compliance"
        subtitle="Zero-harm site enforcement, toolbox briefings, and hazard mitigation records"
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', margin: '24px 0' }}>
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid #4ade80' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Safe Working Days</span>
          <h2 style={{ margin: '6px 0 0', color: '#4ade80', fontSize: '1.8rem' }}>248 Days</h2>
          <span style={{ fontSize: '0.75rem', color: '#666' }}>Zero Lost-Time Incidents</span>
        </Card>
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid var(--astryx-gold)' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>Total Workers Briefed</span>
          <h2 style={{ margin: '6px 0 0', color: 'var(--astryx-gold-light)', fontSize: '1.8rem' }}>
            {safetyLogs.reduce((acc, curr) => acc + (Number(curr.workersBriefed) || 0), 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#666' }}>Across all active sites</span>
        </Card>
        <Card style={{ padding: '16px 20px', borderLeft: '3px solid #60a5fa' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>PPE Compliance Rate</span>
          <h2 style={{ margin: '6px 0 0', color: '#60a5fa', fontSize: '1.8rem' }}>99.4%</h2>
          <span style={{ fontSize: '0.75rem', color: '#666' }}>Audited weekly</span>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Site HSE & Incident Logs</h3>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Record Safety Briefing / Incident
        </Button>
      </div>

      {/* Logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {safetyLogs.map(log => (
          <Card key={log.id} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{log.incidentType}</h3>
                  <Badge variant={log.status === 'COMPLIANT' ? 'success' : (log.status === 'RESOLVED' ? 'info' : 'danger')}>
                    {log.status}
                  </Badge>
                  <Badge variant={log.severity === 'ROUTINE' ? 'default' : (log.severity === 'MODERATE' ? 'warning' : 'danger')}>
                    {log.severity}
                  </Badge>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#888' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building size={13} /> {log.projectName}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HardHat size={13} /> {log.safetyOfficer}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {log.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--astryx-gold-light)' }}>
                    <Users size={13} /> {log.workersBriefed} Workers
                  </span>
                </div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.88rem', color: '#ccc', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
              {log.details}
            </p>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Safety Report / Toolbox Briefing">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Topic / Incident Type *</label>
            <TextInput
              required
              placeholder="e.g. Scaffolding Fall-Arrest Gear Inspection"
              value={newLog.incidentType}
              onChange={(e) => setNewLog({ ...newLog, incidentType: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Site / Project *</label>
              <TextInput
                value={newLog.projectName}
                onChange={(e) => setNewLog({ ...newLog, projectName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Safety Officer *</label>
              <TextInput
                value={newLog.safetyOfficer}
                onChange={(e) => setNewLog({ ...newLog, safetyOfficer: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Severity Level *</label>
              <Select
                value={newLog.severity}
                onChange={(e) => setNewLog({ ...newLog, severity: e.target.value })}
                options={[
                  { value: 'ROUTINE', label: 'Routine / Planned' },
                  { value: 'LOW', label: 'Low Hazard' },
                  { value: 'MODERATE', label: 'Moderate' },
                  { value: 'CRITICAL', label: 'Critical' },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Compliance Status *</label>
              <Select
                value={newLog.status}
                onChange={(e) => setNewLog({ ...newLog, status: e.target.value })}
                options={[
                  { value: 'COMPLIANT', label: 'Compliant' },
                  { value: 'RESOLVED', label: 'Resolved' },
                  { value: 'ACTION_PENDING', label: 'Action Pending' },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Workers Count</label>
              <TextInput
                type="number"
                value={newLog.workersBriefed}
                onChange={(e) => setNewLog({ ...newLog, workersBriefed: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>Briefing / Mitigation Details *</label>
            <TextArea
              required
              rows={3}
              placeholder="Describe measures taken, worker sign-offs, and corrective actions..."
              value={newLog.details}
              onChange={(e) => setNewLog({ ...newLog, details: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit HSE Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
