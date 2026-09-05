'use client';

import { useState, useEffect } from 'react';
import {
  Users, KeyRound, Shield, Mail, Phone, Building, HardHat,
  Target, Crown, Plus, CheckCircle2, XCircle, Search, Filter
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, SearchInput } from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

export default function EmployeeDirectoryPage() {
  const { getApprovedDesignersList } = useDesignerAuth();
  const [employees, setEmployees] = useState([]);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_approved_designers');
      let list = stored ? JSON.parse(stored) : [];
      
      // Include registered owner if present
      const ownerStored = localStorage.getItem('bavi_site_owner');
      const realEmployees = [];

      if (ownerStored) {
        const owner = JSON.parse(ownerStored);
        realEmployees.push({
          id: owner.id || 'owner-1',
          full_name: owner.full_name,
          email: owner.email,
          department: 'admin',
          role: 'Principal Architect & Site Owner',
          company_code: owner.company_code || 'BAVI-OWNER-ADMIN',
          isOwner: true,
          phone: owner.phone || 'N/A',
          status: 'ACTIVE',
          joinedDate: owner.registeredAt ? owner.registeredAt.split('T')[0] : 'Today',
        });
      }

      list.forEach(item => {
        if (!realEmployees.some(m => m.email === item.email)) {
          realEmployees.push({
            id: item.id || 'emp-' + Date.now(),
            full_name: item.full_name,
            email: item.email,
            department: item.department || 'architecture',
            role: item.role || 'designer',
            company_code: item.company_code || 'BAVI-TOKEN',
            isOwner: !!item.isOwner,
            phone: item.phone || 'N/A',
            status: 'ACTIVE',
            joinedDate: item.approvedAt ? item.approvedAt.split('T')[0] : 'New',
          });
        }
      });
      setEmployees(realEmployees);
    } catch {
      setEmployees([]);
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

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: '1px dashed rgba(255,255,255,0.1)',
          color: '#888'
        }}>
          <Users size={36} style={{ color: 'var(--astryx-gold)', marginBottom: '12px' }} />
          <h3 style={{ color: '#fff', margin: '0 0 6px', fontSize: '1.1rem' }}>No Employees Enrolled Yet</h3>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            When staff members apply and you approve their security tokens, they will appear in this directory.
          </p>
        </div>
      ) : (
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
    )}
  </div>
);
}
