'use client';

import { useState, useEffect } from 'react';
import {
  Layers, Plus, Trash2, CheckCircle2, XCircle, Clock,
  ShieldAlert, Crown, Cpu, AlertTriangle, Check, X,
  Building, HardHat, Target, Activity, Info
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Card, Badge, Button } from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

const PROTECTED_DEPTS = ['admin', 'tech', 'architecture', 'construction', 'marketing'];

const DEPT_ICONS = {
  admin: Crown,
  architecture: Building,
  construction: HardHat,
  marketing: Target,
  tech: Cpu,
};

const STATUS_COLORS = {
  PENDING: { bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.35)', text: '#c9a84c', badge: 'gold' },
  APPROVED: { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.3)', text: '#4ade80', badge: 'success' },
  REJECTED: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', text: '#f87171', badge: 'danger' },
};

export default function DepartmentManagementPage() {
  const {
    designer,
    departments,
    submitDepartmentRequest,
    approveDepartmentRequest,
    rejectDepartmentRequest,
    getDepartmentRequests,
  } = useDesignerAuth();

  const isTech = designer?.department === 'tech';
  const isOwner = designer?.isOwner || designer?.department === 'admin';

  const [requests, setRequests] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [newDept, setNewDept] = useState({ key: '', display: '' });
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const refresh = () => setRequests(getDepartmentRequests ? getDepartmentRequests() : []);

  useEffect(() => { refresh(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmitAdd = () => {
    setError('');
    if (!newDept.key.trim() || !newDept.display.trim()) {
      setError('Both department key and display name are required.');
      return;
    }
    if (PROTECTED_DEPTS.includes(newDept.key.toLowerCase().replace(/\s+/g, '_'))) {
      setError('This key is reserved. Choose a unique department key.');
      return;
    }
    try {
      submitDepartmentRequest('add', { key: newDept.key.trim(), display: newDept.display.trim() });
      setShowAddModal(false);
      setNewDept({ key: '', display: '' });
      refresh();
      showToast('Add request submitted — awaiting owner approval.');
    } catch (e) { setError(e.message); }
  };

  const handleSubmitRemove = (deptKey, deptDisplay) => {
    try {
      submitDepartmentRequest('remove', { key: deptKey, display: deptDisplay });
      setShowRemoveModal(null);
      refresh();
      showToast('Remove request submitted — awaiting owner approval.');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleApprove = (reqId) => {
    try {
      approveDepartmentRequest(reqId);
      refresh();
      showToast('Department change approved and applied!');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleReject = () => {
    try {
      rejectDepartmentRequest(rejectModal, rejectReason || 'Not approved by owner');
      setRejectModal(null);
      setRejectReason('');
      refresh();
      showToast('Request rejected.');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const historyRequests = requests.filter(r => r.status !== 'PENDING');
  const deptList = Object.values(departments || {});

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--astryx-bg-primary, #0a0a0a)' }}>
      <DesignerHeader
        title="Department Management"
        subtitle={isTech
          ? 'Tech & Digitalization — propose department additions or removals for owner approval'
          : 'Owner — review and approve department structure change requests from Tech team'}
      />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '10px',
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.12)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(74,222,128,0.35)'}`,
          borderRadius: '10px', padding: '14px 20px',
          color: toast.type === 'error' ? '#f87171' : '#4ade80',
          fontSize: '0.88rem', fontWeight: 600, backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Info banner for Tech dept */}
      {isTech && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          background: 'rgba(147,112,219,0.08)', border: '1px solid rgba(147,112,219,0.3)',
          borderRadius: '10px', padding: '16px 20px', marginBottom: '28px',
        }}>
          <Info size={18} style={{ color: '#9370db', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.87rem', color: '#bbb', lineHeight: 1.6 }}>
            <strong style={{ color: '#c0a0f0' }}>Tech & Digitalization Authority:</strong> You can propose adding new departments or removing custom departments. All changes require <strong style={{ color: '#e0c57b' }}>Site Owner approval</strong>. Core departments (Architecture, Construction, Marketing, Tech, Admin) are protected and cannot be removed.
          </div>
        </div>
      )}

      {/* Owner pending banner */}
      {isOwner && pendingRequests.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: '10px', padding: '16px 20px', marginBottom: '28px',
        }}>
          <Clock size={18} style={{ color: '#c9a84c', flexShrink: 0 }} />
          <span style={{ fontSize: '0.87rem', color: '#e0c57b', fontWeight: 600 }}>
            {pendingRequests.length} department change request{pendingRequests.length > 1 ? 's' : ''} awaiting your approval
          </span>
        </div>
      )}

      {/* Active Departments */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--astryx-gold, #c9a84c)' }} />
            Active Departments ({deptList.length})
          </h3>
          {isTech && (
            <Button variant="primary" size="sm" icon={Plus}
              onClick={() => { setShowAddModal(true); setError(''); }}>
              Propose New Department
            </Button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {deptList.map((dept) => {
            const Icon = DEPT_ICONS[dept.name] || Layers;
            const isProtected = PROTECTED_DEPTS.includes(dept.name);
            const hasPending = requests.some(r => r.deptKey === dept.name && r.status === 'PENDING');
            return (
              <Card key={dept.name} style={{
                padding: '20px',
                border: dept.name === 'tech' ? '1px solid rgba(147,112,219,0.35)' : undefined,
                background: dept.name === 'tech' ? 'rgba(147,112,219,0.04)' : undefined,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: dept.name === 'tech' ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: dept.name === 'tech' ? '#9370db' : 'var(--astryx-gold, #c9a84c)',
                    }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{dept.display}</div>
                      <code style={{ color: '#555', fontSize: '0.75rem' }}>{dept.name}</code>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                    <Badge variant={isProtected ? 'secondary' : 'success'} size="sm">
                      {isProtected ? 'Protected' : 'Custom'}
                    </Badge>
                    {dept.name === 'tech' && <Badge variant="primary" size="sm">Dept. Authority</Badge>}
                  </div>
                </div>
                {!isProtected && isTech && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {hasPending ? (
                      <span style={{ fontSize: '0.78rem', color: '#c9a84c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> Removal pending owner approval
                      </span>
                    ) : (
                      <button
                        onClick={() => setShowRemoveModal({ key: dept.name, display: dept.display })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: '6px', padding: '6px 12px',
                          color: '#f87171', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        }}>
                        <Trash2 size={13} /> Propose Removal
                      </button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pending Requests — Owner */}
      {isOwner && pendingRequests.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ margin: '0 0 18px', color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#c9a84c' }} />
            Pending Approval ({pendingRequests.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {pendingRequests.map(req => (
              <Card key={req.id} style={{ padding: '20px', borderLeft: '3px solid #c9a84c', background: 'rgba(201,168,76,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Badge variant={req.action === 'add' ? 'success' : 'danger'} size="sm">
                    {req.action === 'add' ? '+ ADD DEPARTMENT' : '- REMOVE DEPARTMENT'}
                  </Badge>
                  <Badge variant="gold" size="sm">PENDING</Badge>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{req.deptDisplay}</div>
                  <code style={{ color: '#555', fontSize: '0.75rem' }}>{req.deptKey}</code>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '16px' }}>
                  Requested by <strong style={{ color: '#c0a0f0' }}>{req.requestedBy}</strong> · {new Date(req.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleApprove(req.id)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.35)',
                    borderRadius: '7px', padding: '9px', color: '#4ade80',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  }}>
                    <Check size={15} /> Approve
                  </button>
                  <button onClick={() => setRejectModal(req.id)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '7px', padding: '9px', color: '#f87171',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  }}>
                    <X size={15} /> Reject
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending view for Tech */}
      {isTech && !isOwner && pendingRequests.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ margin: '0 0 18px', color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#c9a84c' }} /> Your Pending Requests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingRequests.map(req => (
              <div key={req.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: '8px', padding: '14px 18px',
              }}>
                <div>
                  <span style={{ color: '#e0c57b', fontWeight: 700, fontSize: '0.9rem' }}>{req.deptDisplay}</span>
                  <span style={{ color: '#888', fontSize: '0.8rem', marginLeft: '10px' }}>({req.action === 'add' ? 'Add' : 'Remove'} request)</span>
                </div>
                <Badge variant="gold" size="sm">Awaiting Owner</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {historyRequests.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 18px', color: '#fff', fontSize: '1.05rem' }}>Request History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {historyRequests.map(req => {
              const sc = STATUS_COLORS[req.status] || STATUS_COLORS.PENDING;
              return (
                <div key={req.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: sc.bg, border: `1px solid ${sc.border}`,
                  borderRadius: '8px', padding: '12px 18px', gap: '12px', flexWrap: 'wrap',
                }}>
                  <div>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{req.deptDisplay}</span>
                    <span style={{ color: '#666', fontSize: '0.78rem', marginLeft: '8px' }}>
                      · {req.action === 'add' ? 'Add' : 'Remove'} · by {req.requestedBy}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {req.status === 'REJECTED' && req.rejectionReason && (
                      <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{req.rejectionReason}</span>
                    )}
                    <Badge variant={sc.badge} size="sm">{req.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Dept Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: '#111', border: '1px solid rgba(147,112,219,0.4)',
            borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '440px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Cpu size={20} style={{ color: '#9370db' }} />
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Propose New Department</h3>
            </div>
            <p style={{ color: '#888', fontSize: '0.83rem', marginBottom: '24px', lineHeight: 1.5 }}>
              This request will be sent to the Site Owner for approval.
            </p>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '7px', padding: '10px 14px', marginBottom: '16px',
                color: '#f87171', fontSize: '0.83rem',
              }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#bbb', marginBottom: '6px' }}>
                Department Key <span style={{ color: '#666' }}>(e.g. hr_operations)</span>
              </label>
              <input value={newDept.key}
                onChange={(e) => setNewDept({ ...newDept, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                placeholder="hr_operations"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#bbb', marginBottom: '6px' }}>
                Display Name <span style={{ color: '#666' }}>(e.g. HR & Operations)</span>
              </label>
              <input value={newDept.display}
                onChange={(e) => setNewDept({ ...newDept, display: e.target.value })}
                placeholder="HR & Operations"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowAddModal(false); setError(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
                Cancel
              </button>
              <button onClick={handleSubmitAdd}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #9370db)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm Modal */}
      {showRemoveModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: '#111', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '400px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldAlert size={22} style={{ color: '#f87171' }} />
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>Propose Department Removal</h3>
            </div>
            <p style={{ color: '#bbb', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '24px' }}>
              You are requesting the removal of <strong style={{ color: '#f87171' }}>{showRemoveModal.display}</strong>. This goes to the Owner for approval.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowRemoveModal(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
                Cancel
              </button>
              <button onClick={() => handleSubmitRemove(showRemoveModal.key, showRemoveModal.display)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                Submit Removal Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: '#111', border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '400px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '1.05rem' }}>Reject Department Request</h3>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#bbb', marginBottom: '8px' }}>Reason (optional)</label>
            <textarea rows={3} value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Not aligned with current org structure..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '0.88rem', resize: 'vertical', outline: 'none',
                marginBottom: '20px', boxSizing: 'border-box',
              }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
                Cancel
              </button>
              <button onClick={handleReject}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
