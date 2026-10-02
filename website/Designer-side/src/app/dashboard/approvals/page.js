'use client';

import { useState, useEffect } from 'react';
import {
  KeyRound, ShieldCheck, Mail, Search, Lock,
  CheckCircle2, XCircle, Clock, Eye, EyeOff,
  Award, Compass, Copy, Check, Phone, ArrowRight
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useDesignerAuth } from '@/context/AuthContext';
import {
  Button, Badge, Card, TextInput, Modal, Toast, Tabs,
  EmptyState, Divider, SearchInput, Avatar, Table
} from '@/components/astryx';
import s from '../shared.module.css';

// Status badge helper
const StatusBadge = ({ status }) => {
  const map = {
    APPROVED: 'success', APPLIED: 'success',
    REJECTED: 'danger', PENDING: 'warning',
    'Awaiting Authorization': 'warning',
  };
  return <Badge variant={map[status] || 'neutral'}>{status === 'APPLIED' ? '✓ Applied' : status === 'PENDING' ? 'Pending' : status}</Badge>;
};

export default function ApprovalsPage() {
  const { designer, getRequests, approveRequest, rejectRequest, getEmailChangeRequests, approveEmailChangeRequest, rejectEmailChangeRequest, logActivity } = useDesignerAuth();

  const [activeTab, setActiveTab] = useState('ACCESS');
  const [toast, setToast] = useState({ msg: '', visible: false, variant: 'success' });
  const showToast = (msg, variant = 'success') => setToast({ msg, visible: true, variant });

  // Access requests state
  const [requests, setRequests] = useState([]);
  const [reqSearch, setReqSearch] = useState('');
  const [reqFilter, setReqFilter] = useState('ALL');
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Email change requests
  const [emailReqs, setEmailReqs] = useState([]);
  const [emailSearch, setEmailSearch] = useState('');
  const [emailFilter, setEmailFilter] = useState('ALL');
  const [approvingEmailId, setApprovingEmailId] = useState(null);
  const [rejectingEmailId, setRejectingEmailId] = useState(null);
  const [emailRejectReason, setEmailRejectReason] = useState('');

  // Client password log
  const [pwLog, setPwLog] = useState([]);
  const [pwSearch, setPwSearch] = useState('');
  const [pwFilter, setPwFilter] = useState('ALL');
  const [revealed, setRevealed] = useState({});

  const loadAll = () => {
    setRequests(getRequests());
    setEmailReqs(getEmailChangeRequests());
    try {
      const stored = JSON.parse(localStorage.getItem('bavi_client_password_requests') || '[]');
      setPwLog(stored);
    } catch { setPwLog([]); }
  };

  useEffect(() => { loadAll(); }, []);

  // ── Access Requests Handlers ──────────────────────────────────────────────
  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await approveRequest(id);
      loadAll();
      showToast(`Approved! Key ${res.token} issued to ${res.request.fullName}`);
    } catch (err) { alert(err.message); }
    finally { setApprovingId(null); }
  };
  const handleReject = async (id) => {
    try {
      await rejectRequest(id, rejectReason || 'Credentials could not be verified.');
      loadAll();
      setRejectingId(null); setRejectReason('');
      showToast('Request rejected.');
    } catch (err) { alert(err.message); }
  };
  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Email Change Handlers ─────────────────────────────────────────────────
  const handleApproveEmail = async (id) => {
    setApprovingEmailId(id);
    try {
      const res = await approveEmailChangeRequest(id);
      loadAll();
      showToast(`Email updated for ${res.target.fullName} to ${res.newEmail}`);
    } catch (err) { alert(err.message); }
    finally { setApprovingEmailId(null); }
  };
  const handleRejectEmail = async (id) => {
    try {
      await rejectEmailChangeRequest(id, emailRejectReason || 'Request not approved by Site Owner.');
      loadAll();
      setRejectingEmailId(null); setEmailRejectReason('');
      showToast('Email change request rejected.');
    } catch (err) { alert(err.message); }
  };

  // ── Derived counts ────────────────────────────────────────────────────────
  const pendingKeys = requests.filter(r => r.status === 'PENDING').length;
  const pendingEmail = emailReqs.filter(r => r.status === 'PENDING').length;
  const appliedPw = pwLog.filter(r => r.status === 'APPLIED').length;

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filteredReqs = requests.filter(r => {
    const matchTab = reqFilter === 'ALL' || r.status === reqFilter;
    const matchSearch = [r.fullName, r.email, r.specialization, r.councilRegNo].some(v => v?.toLowerCase().includes(reqSearch.toLowerCase()));
    return matchTab && matchSearch;
  });
  const filteredEmail = emailReqs.filter(r => {
    const matchTab = emailFilter === 'ALL' || r.status === emailFilter;
    const matchSearch = [r.fullName, r.currentEmail, r.requestedEmail].some(v => v?.toLowerCase().includes(emailSearch.toLowerCase()));
    return matchTab && matchSearch;
  });
  const filteredPw = pwLog.filter(r => {
    const matchTab = pwFilter === 'ALL' || r.status === pwFilter;
    const matchSearch = [r.client_name, r.client_email, r.client_code].some(v => v?.toLowerCase().includes(pwSearch.toLowerCase()));
    return matchTab && matchSearch;
  });

  const tabs = [
    { value: 'ACCESS', label: 'Designer Access Keys', icon: KeyRound, count: pendingKeys },
    { value: 'PASSWORDS', label: 'Client Password Log', icon: Lock, count: appliedPw },
    { value: 'EMAIL', label: 'Email Changes', icon: Mail, count: pendingEmail },
  ];

  return (
    <>
      <DesignerHeader
        title="Authorization & Verification Desk"
        subtitle="Review credential submissions, issue security keys, and manage client change requests"
      />

      <div className={s.page}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills" />

        {/* ── SECTION 1: DESIGNER ACCESS REQUESTS ─────────────────────────────── */}
        {activeTab === 'ACCESS' && (
          <>
            <div className={s.controlBar}>
              <div className={s.filterGroup}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
                  <button key={tab} onClick={() => setReqFilter(tab)}
                    className={`${s.filterPill} ${reqFilter === tab ? s.filterPillActive : ''}`}>
                    {tab === 'ALL' ? `All (${requests.length})` : tab === 'PENDING' ? `Pending (${pendingKeys})` : tab === 'APPROVED' ? `Approved` : 'Rejected'}
                  </button>
                ))}
              </div>
              <SearchInput value={reqSearch} onChange={e => setReqSearch(e.target.value)} placeholder="Search by name, email, CoA reg..." onClear={() => setReqSearch('')} />
            </div>

            {filteredReqs.length > 0 ? (
              <div className={s.threeGrid}>
                {filteredReqs.map(req => (
                  <Card key={req.id} variant="default" padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--astryx-text-primary)' }}>{req.fullName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--astryx-text-muted)', marginTop: 2 }}>
                          {req.department?.toUpperCase()} · {req.requestedRole?.toUpperCase()}
                        </div>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className={s.detailRowList} style={{ marginBottom: 12 }}>
                      <div className={s.detailRow}><Mail size={14} /> {req.email}</div>
                      {req.phone && <div className={s.detailRow}><Phone size={14} /> {req.phone}</div>}
                      {req.councilRegNo && <div className={s.detailRow}><Award size={14} /> CoA: {req.councilRegNo}</div>}
                      {req.specialization && <div className={s.detailRow}><Compass size={14} /> {req.specialization}</div>}
                    </div>
                    {req.status === 'APPROVED' && req.generatedCode && (
                      <div className={s.credBox} style={{ marginBottom: 10 }}>
                        <div className={s.credLabel}>Issued Security Key</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className={s.credValue} style={{ flex: 1 }}>{req.generatedCode}</div>
                          <button onClick={() => handleCopy(req.generatedCode, req.id)} style={{ background: 'none', border: 'none', color: 'var(--astryx-gold)', cursor: 'pointer' }}>
                            {copiedId === req.id ? <Check size={15} color="var(--astryx-success)" /> : <Copy size={15} />}
                          </button>
                        </div>
                      </div>
                    )}
                    {req.status === 'PENDING' && (
                      <div className={s.actionRow}>
                        <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => handleApprove(req.id)} loading={approvingId === req.id}>
                          Authorize & Issue Key
                        </Button>
                        {rejectingId === req.id ? (
                          <>
                            <TextInput placeholder="Reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                            <Button size="sm" variant="danger" onClick={() => handleReject(req.id)}>Confirm</Button>
                            <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button size="sm" variant="danger" icon={XCircle} onClick={() => setRejectingId(req.id)}>Decline</Button>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={KeyRound} title="No Access Requests" description="No designer signup requests matching filter criteria." />
            )}
          </>
        )}

        {/* ── SECTION 2: CLIENT PASSWORD LOG ───────────────────────────────────── */}
        {activeTab === 'PASSWORDS' && (
          <>
            <div className={`${s.infoBanner} ${s.infoBannerSuccess}`}>
              <ShieldCheck size={16} />
              <span><strong>Client Self-Service:</strong> Clients update their own passwords directly. Each change appears here as an audit trail.</span>
            </div>
            <div className={s.controlBar}>
              <div className={s.filterGroup}>
                {['ALL', 'APPLIED', 'PENDING'].map(tab => (
                  <button key={tab} onClick={() => setPwFilter(tab)}
                    className={`${s.filterPill} ${pwFilter === tab ? s.filterPillActive : ''}`}>
                    {tab === 'ALL' ? `All (${pwLog.length})` : tab === 'APPLIED' ? `Auto-Applied (${appliedPw})` : `Legacy Pending`}
                  </button>
                ))}
              </div>
              <SearchInput value={pwSearch} onChange={e => setPwSearch(e.target.value)} placeholder="Search by client name, email..." onClear={() => setPwSearch('')} />
            </div>
            {filteredPw.length > 0 ? (
              <div className={s.threeGrid}>
                {filteredPw.map(req => (
                  <Card key={req.id} variant="default" padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--astryx-text-primary)' }}>{req.client_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--astryx-text-muted)', marginTop: 2 }}>ID: {req.client_code || req.client_id}</div>
                      </div>
                      <StatusBadge status={req.status || 'APPLIED'} />
                    </div>
                    <div className={s.detailRowList} style={{ marginBottom: 10 }}>
                      <div className={s.detailRow}><Mail size={14} /> {req.client_email}</div>
                      <div className={s.detailRow}><Clock size={14} /> {new Date(req.submitted_at).toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ background: 'var(--astryx-success-bg)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '10px 12px', fontSize: '0.8rem', color: '#6ee7b7', display: 'flex', gap: 7, alignItems: 'center' }}>
                      <CheckCircle2 size={14} />
                      Password updated by client on {new Date(req.submitted_at).toLocaleDateString('en-IN')}
                    </div>
                    {req.reason && <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--astryx-text-muted)' }}>Reason: {req.reason}</div>}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={ShieldCheck} title="No Password Changes Yet" description="Client password updates appear here as an audit log." />
            )}
          </>
        )}

        {/* ── SECTION 3: EMAIL CHANGE REQUESTS ─────────────────────────────────── */}
        {activeTab === 'EMAIL' && (
          <>
            <div className={s.controlBar}>
              <div className={s.filterGroup}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
                  <button key={tab} onClick={() => setEmailFilter(tab)}
                    className={`${s.filterPill} ${emailFilter === tab ? s.filterPillActive : ''}`}>
                    {tab === 'ALL' ? `All (${emailReqs.length})` : tab === 'PENDING' ? `Pending (${pendingEmail})` : tab}
                  </button>
                ))}
              </div>
              <SearchInput value={emailSearch} onChange={e => setEmailSearch(e.target.value)} placeholder="Search by name or email..." onClear={() => setEmailSearch('')} />
            </div>
            {filteredEmail.length > 0 ? (
              <div className={s.threeGrid}>
                {filteredEmail.map(req => (
                  <Card key={req.id} variant="default" padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--astryx-text-primary)' }}>{req.fullName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--astryx-text-muted)', marginTop: 2 }}>
                          {req.department?.toUpperCase()} · {req.role?.toUpperCase()}
                        </div>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className={s.detailRowList} style={{ marginBottom: 12 }}>
                      <div className={s.detailRow}><Mail size={14} /> <del style={{ opacity: 0.5 }}>{req.currentEmail}</del></div>
                      <div className={s.detailRow}><ArrowRight size={14} color="var(--astryx-gold)" /> <strong style={{ color: 'var(--astryx-success)' }}>{req.requestedEmail}</strong></div>
                    </div>
                    {req.reason && <div style={{ fontSize: '0.78rem', color: 'var(--astryx-text-muted)', marginBottom: 12 }}>Reason: {req.reason}</div>}
                    {req.status === 'PENDING' && (
                      <div className={s.actionRow}>
                        <Button size="sm" variant="success" icon={CheckCircle2} onClick={() => handleApproveEmail(req.id)} loading={approvingEmailId === req.id}>
                          Approve & Update Email
                        </Button>
                        {rejectingEmailId === req.id ? (
                          <>
                            <TextInput placeholder="Reason..." value={emailRejectReason} onChange={e => setEmailRejectReason(e.target.value)} />
                            <Button size="sm" variant="danger" onClick={() => handleRejectEmail(req.id)}>Confirm</Button>
                            <Button size="sm" variant="ghost" onClick={() => setRejectingEmailId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button size="sm" variant="danger" icon={XCircle} onClick={() => setRejectingEmailId(req.id)}>Decline</Button>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState icon={Mail} title="No Email Change Requests" description="No staff email update requests found." />
            )}
          </>
        )}
      </div>

      <Toast message={toast.msg} isVisible={toast.visible} onClose={() => setToast(t => ({ ...t, visible: false }))} variant={toast.variant} />
    </>
  );
}
