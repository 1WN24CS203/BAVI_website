'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, KeyRound, Shield, Mail, Phone, Building, HardHat,
  Target, Crown, Plus, CheckCircle2, XCircle, Search, Filter,
  Activity, RefreshCw, ExternalLink, ShieldAlert, Clock
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card, TextInput, Select, Modal, SearchInput, Toast } from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

export default function EmployeeDirectoryPage() {
  const router = useRouter();
  const { getApprovedDesignersList, logActivity, getAllActivityLog } = useDesignerAuth();
  const [employees, setEmployees] = useState([]);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal and action states
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    role: '',
    department: 'architecture',
    company_code: '',
    status: 'ACTIVE',
    phone: '',
  });

  // Toast state
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  const handleOpenManageAccess = (emp) => {
    setSelectedEmp(emp);
    setEditForm({
      full_name: emp.full_name,
      role: emp.role || '',
      department: emp.department || 'architecture',
      company_code: emp.company_code || '',
      status: emp.status || 'ACTIVE',
      phone: emp.phone || '',
    });
    setManageModalOpen(true);
  };

  const handleRegenerateKey = () => {
    const deptCode = editForm.department === 'admin' ? 'OWNER' :
                     editForm.department === 'construction' ? 'CONST' :
                     editForm.department === 'marketing' ? 'MKTG' : 'ARCH';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setEditForm(prev => ({ ...prev, company_code: `BAVI-${deptCode}-${random}` }));
  };

  const handleSaveAccess = (e) => {
    e?.preventDefault();
    if (!selectedEmp) return;

    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedEmp.id || emp.email === selectedEmp.email) {
        return {
          ...emp,
          role: editForm.role,
          department: editForm.department,
          company_code: editForm.company_code,
          status: editForm.status,
          phone: editForm.phone,
        };
      }
      return emp;
    });

    setEmployees(updatedEmployees);

    // Sync with localStorage
    if (selectedEmp.isOwner) {
      try {
        const ownerStored = localStorage.getItem('bavi_site_owner');
        if (ownerStored) {
          const owner = JSON.parse(ownerStored);
          const updatedOwner = {
            ...owner,
            role: editForm.role,
            company_code: editForm.company_code,
            phone: editForm.phone,
          };
          localStorage.setItem('bavi_site_owner', JSON.stringify(updatedOwner));
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      try {
        const stored = localStorage.getItem('bavi_approved_designers');
        let list = stored ? JSON.parse(stored) : [];
        list = list.map(item => {
          if (item.email === selectedEmp.email || item.id === selectedEmp.id) {
            return {
              ...item,
              role: editForm.role,
              department: editForm.department,
              company_code: editForm.company_code,
              status: editForm.status,
              phone: editForm.phone,
            };
          }
          return item;
        });
        localStorage.setItem('bavi_approved_designers', JSON.stringify(list));
      } catch (err) {
        console.warn(err);
      }
    }

    logActivity?.('updated_employee_access', 'employee', selectedEmp.full_name, {
      newDepartment: editForm.department,
      newStatus: editForm.status,
      newRole: editForm.role,
      reissuedCode: editForm.company_code,
    });

    setManageModalOpen(false);
    showToast(`Security permissions updated for ${selectedEmp.full_name}`);
  };

  const handleOpenAuditLog = (emp) => {
    setSelectedEmp(emp);
    setAuditModalOpen(true);
  };

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
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => handleOpenManageAccess(emp)}
                >
                  Manage Access
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                  onClick={() => handleOpenAuditLog(emp)}
                >
                  Audit Log
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    )}

    {/* Manage Access Modal */}
    <Modal
      isOpen={manageModalOpen}
      onClose={() => setManageModalOpen(false)}
      title={`Manage Security & Access: ${selectedEmp?.full_name || ''}`}
    >
      {selectedEmp && (
        <form onSubmit={handleSaveAccess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{selectedEmp.full_name}</div>
              <div style={{ fontSize: '0.78rem', color: '#888' }}>{selectedEmp.email} • {selectedEmp.isOwner ? 'Site Owner' : 'Employee Staff'}</div>
            </div>
            <Badge variant={selectedEmp.isOwner ? 'gold' : 'info'}>
              {selectedEmp.isOwner ? 'OWNER ACCOUNT' : 'STAFF'}
            </Badge>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>
              Role / Designation Title *
            </label>
            <TextInput
              required
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              placeholder="e.g. Senior Project Architect"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>
                Operational Department *
              </label>
              <Select
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                options={[
                  { value: 'architecture', label: 'Architecture & Design' },
                  { value: 'construction', label: 'Construction & Management' },
                  { value: 'marketing', label: 'Marketing & Sales' },
                  { value: 'admin', label: 'Owner Administration' },
                ]}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>
                Authorization Status *
              </label>
              <Select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                options={[
                  { value: 'ACTIVE', label: 'ACTIVE - Full Authorized Access' },
                  { value: 'SUSPENDED', label: 'SUSPENDED - Revoke Dashboard Entry' },
                ]}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: '#bbb', marginBottom: '6px', display: 'block' }}>
              Registered Phone Number
            </label>
            <TextInput
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="+91 99999 00000"
            />
          </div>

          {/* Security Key Section */}
          <div style={{
            background: 'rgba(201,168,76,0.06)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '8px',
            padding: '14px',
            marginTop: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--astryx-gold-light)', fontWeight: 600 }}>
                <KeyRound size={14} /> Issued Security Token
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                icon={<RefreshCw size={12} />}
                onClick={handleRegenerateKey}
              >
                Reissue Token
              </Button>
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              color: '#fff',
              letterSpacing: '1px',
              background: 'rgba(0,0,0,0.3)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}>
              {editForm.company_code || 'NO-TOKEN-ASSIGNED'}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#888' }}>
              This cryptographic key is required during staff sign-in to unlock department credentials.
            </p>
          </div>

          {/* Cross-Access Matrix Shortcut */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#ccc' }}>
              <Shield size={16} style={{ color: 'var(--astryx-gold)' }} />
              <span>Cross-Department Policy & Lockout Matrix</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="xs"
              icon={<ExternalLink size={12} />}
              onClick={() => {
                setManageModalOpen(false);
                router.push('/dashboard/permissions');
              }}
            >
              View Matrix
            </Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="ghost" type="button" onClick={() => setManageModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<CheckCircle2 size={15} />}>
              Save Security Settings
            </Button>
          </div>
        </form>
      )}
    </Modal>

    {/* Audit Log Modal */}
    <Modal
      isOpen={auditModalOpen}
      onClose={() => setAuditModalOpen(false)}
      title={`Activity Audit Log: ${selectedEmp?.full_name || ''}`}
    >
      {selectedEmp && (() => {
        const allLogs = getAllActivityLog?.() || [];
        const empLogs = allLogs.filter(l => 
          l.actor_name?.toLowerCase() === selectedEmp.full_name?.toLowerCase() ||
          l.actor_id === selectedEmp.id ||
          l.resource_name?.toLowerCase() === selectedEmp.full_name?.toLowerCase()
        );

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{selectedEmp.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Role: {selectedEmp.role} • Dept: {selectedEmp.department?.toUpperCase()}</div>
              </div>
              <Badge variant={selectedEmp.isOwner ? 'gold' : 'neutral'}>
                {empLogs.length} Events Recorded
              </Badge>
            </div>

            {empLogs.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}>
                {empLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(201,168,76,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--astryx-gold)',
                        flexShrink: 0
                      }}>
                        <Activity size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.84rem', color: '#eee', fontWeight: 600 }}>
                          {log.action?.replace(/_/g, ' ')?.toUpperCase()}
                        </div>
                        {log.resource_name && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--astryx-gold-light)', marginTop: '2px' }}>
                            Target: {log.resource_name}
                          </div>
                        )}
                        {log.details && (
                          <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '2px' }}>
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#666', whiteSpace: 'nowrap' }}>
                      <Clock size={11} />
                      <span>{new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '36px 16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px dashed rgba(255,255,255,0.08)',
                color: '#888'
              }}>
                <Activity size={28} style={{ color: 'var(--astryx-gold)', marginBottom: '8px' }} />
                <h5 style={{ margin: '0 0 4px', color: '#eee', fontSize: '0.92rem' }}>No Activity Logged Yet</h5>
                <p style={{ margin: 0, fontSize: '0.78rem' }}>
                  Action events (milestone approvals, uploads, logins) performed by {selectedEmp.full_name} will appear here.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={<ExternalLink size={13} />}
                onClick={() => {
                  setAuditModalOpen(false);
                  router.push('/dashboard/monitor');
                }}
              >
                Open Full Activity Monitor
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAuditModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        );
      })()}
    </Modal>

    {/* Toast Notification */}
    <Toast message={toastMsg} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
  </div>
);
}
