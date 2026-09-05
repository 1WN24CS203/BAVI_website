'use client';

import { useState, useEffect } from 'react';
import {
  Users, KeyRound, Shield, Mail, Phone, Building, HardHat,
  Target, Crown, Plus, CheckCircle2, XCircle, Search, Filter
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, SearchInput } from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

const DEFAULT_EMPLOYEES = [
  {
    id: 'emp-1',
    full_name: 'Vikramaditya Hegde',
    email: 'bmsce.architect@bavi.in',
    department: 'admin',
    role: 'Principal Architect & Site Owner',
    company_code: 'BAVI-OWNER-ADMIN',
    isOwner: true,
    phone: '+91 99800 11223',
    status: 'ACTIVE',
    joinedDate: '2026-08-01',
  },
  {
    id: 'emp-2',
    full_name: 'Ananya Rao',
    email: 'ananya.rao@bavi.in',
    department: 'architecture',
    role: 'Senior Project Architect',
    company_code: 'BAVI-DES-4102',
    isOwner: false,
    phone: '+91 98451 44556',
    status: 'ACTIVE',
    joinedDate: '2026-08-15',
  },
  {
    id: 'emp-3',
    full_name: 'Er. Rajesh Kumar',
    email: 'rajesh.kumar@bavi.in',
    department: 'construction',
    role: 'Site Project Manager & QC Lead',
    company_code: 'BAVI-DES-7721',
    isOwner: false,
    phone: '+91 97411 99882',
    status: 'ACTIVE',
    joinedDate: '2026-08-20',
  },
  {
    id: 'emp-4',
    full_name: 'Sneha Kulkarni',
    email: 'sneha.k@bavi.in',
    department: 'marketing',
    role: 'Client Acquisition & Callback Lead',
    company_code: 'BAVI-DES-3319',
    isOwner: false,
    phone: '+91 98220 77112',
    status: 'ACTIVE',
    joinedDate: '2026-08-22',
  },
];

export default function EmployeeDirectoryPage() {
  const { getApprovedDesignersList } = useDesignerAuth();
  const [employees, setEmployees] = useState([]);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_approved_designers');
      let list = stored ? JSON.parse(stored) : [];
      // Combine with defaults if needed
      const merged = [...DEFAULT_EMPLOYEES];
      list.forEach(item => {
        if (!merged.some(m => m.email === item.email)) {
          merged.push({
            id: item.id || 'emp-' + Date.now(),
            full_name: item.full_name,
            email: item.email,
            department: item.department || 'architecture',
            role: item.role || 'designer',
            company_code: item.company_code || 'BAVI-TOKEN',
            isOwner: !!item.isOwner,
            phone: item.phone || 'N/A',
            status: 'ACTIVE',
            joinedDate: item.approvedAt ? item.approvedAt.split('T')[0] : '2026-09-01',
          });
        }
      });
      setEmployees(merged);
    } catch {
      setEmployees(DEFAULT_EMPLOYEES);
    }
  }, []);

  const getDeptIcon = (dept) => {
    switch (dept) {
      case 'admin': return Crown;
      case 'architecture': return Building;
      case 'construction': return HardHat;
      case 'marketing': return Target;
      default: return Users;
    }
  };

  const filtered = employees.filter(emp => {
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    const matchesSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (emp.company_code && emp.company_code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--astryx-bg-primary)' }}>
      <DesignerHeader
        title="Employee & Staff Directory"
        subtitle="Owner administration — view employee departments, issued security tokens, and roles"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
          <SearchInput
            placeholder="Search name, token code, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '320px' }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Staff' },
              { id: 'admin', label: 'Owners' },
              { id: 'architecture', label: 'Architecture' },
              { id: 'construction', label: 'Construction' },
              { id: 'marketing', label: 'Marketing' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDeptFilter(d.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  border: deptFilter === d.id ? '1px solid var(--astryx-gold)' : '1px solid rgba(255,255,255,0.1)',
                  background: deptFilter === d.id ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                  color: deptFilter === d.id ? 'var(--astryx-gold-light)' : '#888',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filtered.map(emp => {
          const DeptIcon = getDeptIcon(emp.department);
          return (
            <Card key={emp.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: emp.isOwner ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: emp.isOwner ? '#c9a84c' : '#ccc',
                      fontWeight: 600
                    }}>
                      <DeptIcon size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{emp.full_name}</h4>
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>{emp.role}</span>
                    </div>
                  </div>
                  <Badge variant={emp.isOwner ? 'gold' : 'success'}>
                    {emp.isOwner ? 'OWNER' : emp.department.toUpperCase()}
                  </Badge>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#777' }}>Security Key:</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--astryx-gold-light)', fontWeight: 600 }}>
                      {emp.company_code}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#777' }}>Status:</span>
                    <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> {emp.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#777' }}>Onboarded:</span>
                    <span style={{ color: '#aaa' }}>{emp.joinedDate}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#aaa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} style={{ color: '#666' }} /> {emp.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} style={{ color: '#666' }} /> {emp.phone}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '14px' }}>
                <Button variant="secondary" size="sm" style={{ flex: 1 }}>Manage Access</Button>
                <Button variant="secondary" size="sm" style={{ flex: 1 }}>Audit Log</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
