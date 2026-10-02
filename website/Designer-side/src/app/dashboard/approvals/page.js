'use client';

import { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Award, 
  Compass, 
  Copy, 
  Check, 
  Search,
  Crown,
  AlertCircle,
  ArrowRight,
  Layers,
  Sparkles,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { useDesignerAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './approvals.module.css';

export default function DesignerApprovalsPage() {
  const { 
    designer, 
    getRequests, 
    approveRequest, 
    rejectRequest,
    getEmailChangeRequests,
    approveEmailChangeRequest,
    rejectEmailChangeRequest,
    logActivity
  } = useDesignerAuth();

  // Active section: 'ACCESS' | 'EMAIL' | 'CLIENT_PASSWORDS'
  const [activeSection, setActiveSection] = useState('ACCESS');

  // Access requests state
  const [requests, setRequests] = useState([]);
  const [filterTab, setFilterTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Email change requests state
  const [emailRequests, setEmailRequests] = useState([]);
  const [emailFilterTab, setEmailFilterTab] = useState('ALL');
  const [emailSearchTerm, setEmailSearchTerm] = useState('');
  const [approvingEmailId, setApprovingEmailId] = useState(null);
  const [rejectingEmailId, setRejectingEmailId] = useState(null);
  const [emailRejectReason, setEmailRejectReason] = useState('');

  // Client Password Change Requests State
  const [clientPwRequests, setClientPwRequests] = useState([]);
  const [pwFilterTab, setPwFilterTab] = useState('ALL');
  const [pwSearchTerm, setPwSearchTerm] = useState('');
  const [approvingPwId, setApprovingPwId] = useState(null);
  const [rejectingPwId, setRejectingPwId] = useState(null);
  const [pwRejectReason, setPwRejectReason] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState({});

  const loadAll = () => {
    const all = getRequests();
    setRequests(all);
    const emails = getEmailChangeRequests();
    setEmailRequests(emails);

    // Load Client Password Requests
    try {
      const storedPw = localStorage.getItem('bavi_client_password_requests');
      if (storedPw) {
        setClientPwRequests(JSON.parse(storedPw));
      } else {
        setClientPwRequests([]);
      }
    } catch {
      setClientPwRequests([]);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // --- Handlers for Access Requests ---
  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await approveRequest(id);
      loadAll();
      setToast(`Approved! Key ${res.token} issued to ${res.request.fullName}`);
      setTimeout(() => setToast(''), 4500);
    } catch (err) {
      alert(err.message || 'Approval failed.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequest(id, rejectReason || 'Credentials could not be verified by owner.');
      loadAll();
      setRejectingId(null);
      setRejectReason('');
      setToast('Access request was marked as rejected.');
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      alert(err.message || 'Failed to reject.');
    }
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Handlers for Email Change Requests ---
  const handleApproveEmail = async (id) => {
    setApprovingEmailId(id);
    try {
      const res = await approveEmailChangeRequest(id);
      loadAll();
      setToast(`Success! Email for ${res.target.fullName} updated to ${res.newEmail}`);
      setTimeout(() => setToast(''), 4500);
    } catch (err) {
      alert(err.message || 'Failed to approve email change.');
    } finally {
      setApprovingEmailId(null);
    }
  };

  const handleRejectEmail = async (id) => {
    try {
      await rejectEmailChangeRequest(id, emailRejectReason || 'Request not approved by Site Owner.');
      loadAll();
      setRejectingEmailId(null);
      setEmailRejectReason('');
      setToast('Email change request was rejected.');
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      alert(err.message || 'Failed to reject email change.');
    }
  };

  // --- Handlers for Client Password Change Requests ---
  const handleApproveClientPassword = async (id) => {
    setApprovingPwId(id);
    try {
      const req = clientPwRequests.find(r => r.id === id);
      if (!req) return;

      const newPassword = req.requested_password;

      // 1. Update in bavi_registered_clients
      try {
        const stored = localStorage.getItem('bavi_registered_clients');
        if (stored) {
          const list = JSON.parse(stored);
          const idx = list.findIndex(c => c.email?.toLowerCase() === req.client_email?.toLowerCase());
          if (idx >= 0) {
            list[idx].password = newPassword;
            localStorage.setItem('bavi_registered_clients', JSON.stringify(list));
          }
        }
      } catch {}

      // 2. Update in bavi_registered_accounts
      try {
        const accStored = localStorage.getItem('bavi_registered_accounts');
        if (accStored) {
          const accs = JSON.parse(accStored);
          const aIdx = accs.findIndex(a => a.email?.toLowerCase() === req.client_email?.toLowerCase());
          if (aIdx >= 0) {
            accs[aIdx].password = newPassword;
            localStorage.setItem('bavi_registered_accounts', JSON.stringify(accs));
          }
        }
      } catch {}

      // 3. Update in Supabase profiles if configured
      if (isSupabaseConfigured() && req.client_email) {
        try {
          await supabase.from('profiles').update({
            metadata: {
              password_updated_at: new Date().toISOString(),
              authorized_by_designer: designer?.full_name || 'Design Team Architect'
            }
          }).eq('email', req.client_email.toLowerCase());
        } catch {}
      }

      // 4. Mark request APPROVED in bavi_client_password_requests
      const updatedReqs = clientPwRequests.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: 'APPROVED',
            approved_at: new Date().toISOString(),
            approved_by: designer?.full_name || 'Design Team Architect',
          };
        }
        return r;
      });

      localStorage.setItem('bavi_client_password_requests', JSON.stringify(updatedReqs));
      setClientPwRequests(updatedReqs);

      setToast(`Authorized! Password updated for client ${req.client_name}. Client can now sign in with new credentials.`);
      setTimeout(() => setToast(''), 4500);

      logActivity('approved_client_password_change', 'client', req.client_name, {
        email: req.client_email,
        approved_by: designer?.full_name
      });
    } catch (err) {
      alert(err.message || 'Failed to approve password update.');
    } finally {
      setApprovingPwId(null);
    }
  };

  const handleRejectClientPassword = async (id) => {
    try {
      const updatedReqs = clientPwRequests.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: 'REJECTED',
            rejected_at: new Date().toISOString(),
            rejected_by: designer?.full_name || 'Design Team Architect',
            rejection_reason: pwRejectReason || 'Declined per security protocol.'
          };
        }
        return r;
      });

      localStorage.setItem('bavi_client_password_requests', JSON.stringify(updatedReqs));
      setClientPwRequests(updatedReqs);
      setRejectingPwId(null);
      setPwRejectReason('');
      setToast('Client password change request was declined.');
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      alert(err.message || 'Failed to reject request.');
    }
  };

  const togglePasswordVisibility = (id) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Counts
  const pendingKeyCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const pendingEmailCount = emailRequests.filter(r => r.status === 'PENDING').length;
  const pendingClientPwCount = clientPwRequests.filter(r => r.status === 'PENDING').length;

  // Filtered lists
  const filteredRequests = requests.filter(r => {
    const matchesTab = filterTab === 'ALL' || r.status === filterTab;
    const matchesSearch = 
      r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.councilRegNo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredEmailRequests = emailRequests.filter(r => {
    const matchesTab = emailFilterTab === 'ALL' || r.status === emailFilterTab;
    const matchesSearch = 
      r.fullName?.toLowerCase().includes(emailSearchTerm.toLowerCase()) ||
      r.currentEmail?.toLowerCase().includes(emailSearchTerm.toLowerCase()) ||
      r.requestedEmail?.toLowerCase().includes(emailSearchTerm.toLowerCase()) ||
      r.reason?.toLowerCase().includes(emailSearchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredClientPwRequests = clientPwRequests.filter(r => {
    const matchesTab = pwFilterTab === 'ALL' || r.status === pwFilterTab;
    const matchesSearch = 
      r.client_name?.toLowerCase().includes(pwSearchTerm.toLowerCase()) ||
      r.client_email?.toLowerCase().includes(pwSearchTerm.toLowerCase()) ||
      r.client_code?.toLowerCase().includes(pwSearchTerm.toLowerCase()) ||
      r.reason?.toLowerCase().includes(pwSearchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <DesignerHeader 
        title="Owner Authorization &amp; Verification Desk" 
        subtitle="Review credential submissions, issue unique security keys, and authorize client credential change requests." 
      />

      <div className={styles.container}>
        {/* Metric Cards */}
        <div className={styles.metricsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Pending Key Requests</span>
              <Clock size={20} className={styles.metricIconGold} />
            </div>
            <div className={styles.metricValueGold}>{pendingKeyCount}</div>
            <span className={styles.metricSub}>Designer access keys</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Client Password Changes</span>
              <Lock size={20} className={styles.metricIconGold} />
            </div>
            <div className={styles.metricValueGold}>{clientPwRequests.length}</div>
            <span className={styles.metricSub}>Client credential audit log</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Staff Email Changes</span>
              <Mail size={20} className={styles.metricIconGold} />
            </div>
            <div className={styles.metricValueGold}>{pendingEmailCount}</div>
            <span className={styles.metricSub}>Corporate email requests</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Approved Architects</span>
              <CheckCircle2 size={20} className={styles.metricIconSuccess} />
            </div>
            <div className={styles.metricValue}>{approvedCount}</div>
            <span className={styles.metricSub}>Active authorized designers</span>
          </div>
        </div>

        {toast && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Section Nav Tabs */}
        <div className={styles.sectionNav}>
          <button
            onClick={() => setActiveSection('ACCESS')}
            className={`${styles.sectionNavBtn} ${activeSection === 'ACCESS' ? styles.sectionNavBtnActive : ''}`}
          >
            <KeyRound size={16} />
            <span>Designer Access Keys</span>
            {pendingKeyCount > 0 && (
              <span className={`${styles.countBadge} ${styles.countBadgePending}`}>
                {pendingKeyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('CLIENT_PASSWORDS')}
            className={`${styles.sectionNavBtn} ${activeSection === 'CLIENT_PASSWORDS' ? styles.sectionNavBtnActive : ''}`}
          >
            <ShieldCheck size={16} />
            <span>Client Password Updates</span>
            {pendingClientPwCount > 0 && (
              <span className={`${styles.countBadge} ${styles.countBadgePending}`}>
                {pendingClientPwCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('EMAIL')}
            className={`${styles.sectionNavBtn} ${activeSection === 'EMAIL' ? styles.sectionNavBtnActive : ''}`}
          >
            <Mail size={16} />
            <span>Email Change Requests</span>
            {pendingEmailCount > 0 && (
              <span className={`${styles.countBadge} ${styles.countBadgePending}`}>
                {pendingEmailCount}
              </span>
            )}
          </button>
        </div>

        {/* SECTION 1: DESIGNER ACCESS REQUESTS */}
        {activeSection === 'ACCESS' && (
          <>
            <div className={styles.controlBar}>
              <div className={styles.filterTabs}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.filterBtn} ${filterTab === tab ? styles.filterBtnActive : ''}`}
                    onClick={() => setFilterTab(tab)}
                  >
                    {tab === 'ALL' && `All Applications (${requests.length})`}
                    {tab === 'PENDING' && `Pending (${pendingKeyCount})`}
                    {tab === 'APPROVED' && `Approved (${approvedCount})`}
                    {tab === 'REJECTED' && 'Rejected'}
                  </button>
                ))}
              </div>

              <div className={styles.searchWrap}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search applicants by name, email, CoA reg..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {filteredRequests.length > 0 ? (
              <div className={styles.requestsGrid}>
                {filteredRequests.map((req) => (
                  <div key={req.id} className={styles.requestCard}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.applicantName}>{req.fullName}</h4>
                        <span className={styles.applicantDept}>
                          {req.department?.toUpperCase()} • {req.requestedRole?.toUpperCase()}
                        </span>
                      </div>
                      <span className={`${styles.statusBadge} ${
                        req.status === 'APPROVED' ? styles.statusApproved :
                        req.status === 'REJECTED' ? styles.statusRejected :
                        styles.statusPending
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className={styles.detailsList}>
                      <div className={styles.detailRow}>
                        <Mail size={14} className={styles.detailIcon} />
                        <span>{req.email}</span>
                      </div>
                      {req.phone && (
                        <div className={styles.detailRow}>
                          <Phone size={14} className={styles.detailIcon} />
                          <span>{req.phone}</span>
                        </div>
                      )}
                      {req.councilRegNo && (
                        <div className={styles.detailRow}>
                          <Award size={14} className={styles.detailIcon} />
                          <span>CoA Reg: <strong>{req.councilRegNo}</strong></span>
                        </div>
                      )}
                      {req.specialization && (
                        <div className={styles.detailRow}>
                          <Compass size={14} className={styles.detailIcon} />
                          <span>{req.specialization}</span>
                        </div>
                      )}
                    </div>

                    {req.bio && (
                      <div className={styles.bioBox}>
                        <strong>Background:</strong> {req.bio}
                      </div>
                    )}

                    {req.status === 'APPROVED' && req.generatedCode && (
                      <div className={styles.keyIssuedBox}>
                        <div className={styles.keyLabel}>ISSUED SECURITY ACCESS KEY:</div>
                        <div className={styles.keyRow}>
                          <code className={styles.keyCode}>{req.generatedCode}</code>
                          <button
                            onClick={() => handleCopy(req.generatedCode, req.id)}
                            className={styles.copyBtn}
                            title="Copy Code"
                          >
                            {copiedId === req.id ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    )}

                    {req.status === 'PENDING' && (
                      <div className={styles.actionRow}>
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={approvingId === req.id}
                          className={styles.approveBtn}
                        >
                          <CheckCircle2 size={15} />
                          <span>{approvingId === req.id ? 'Authorizing...' : 'Authorize & Issue Key'}</span>
                        </button>

                        {rejectingId === req.id ? (
                          <div className={styles.rejectForm}>
                            <input
                              type="text"
                              placeholder="Reason for declining access..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className={styles.rejectInput}
                            />
                            <button onClick={() => handleReject(req.id)} className={styles.confirmRejectBtn}>Confirm</button>
                            <button onClick={() => setRejectingId(null)} className={styles.cancelRejectBtn}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setRejectingId(req.id)} className={styles.rejectBtn}>
                            <XCircle size={15} />
                            <span>Decline</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <KeyRound size={36} color="var(--color-gold)" />
                <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '8px 0 4px' }}>No Access Requests Found</h4>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>No pending architectural signup requests matching filter criteria.</p>
              </div>
            )}
          </>
        )}

        {/* SECTION 2: CLIENT PASSWORD CHANGE AUDIT LOG */}
        {activeSection === 'CLIENT_PASSWORDS' && (
          <>
            {/* Info Banner */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.07)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.83rem',
              color: '#b0e8c0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldCheck size={16} color="#22c55e" />
              <span>
                <strong>Client Self-Service Password Updates:</strong> Clients can now update their own password directly from their profile. Each change is automatically applied and logged here for your audit trail.
              </span>
            </div>

            <div className={styles.controlBar}>
              <div className={styles.filterTabs}>
                {['ALL', 'APPLIED', 'APPROVED', 'PENDING', 'REJECTED'].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.filterBtn} ${pwFilterTab === tab ? styles.filterBtnActive : ''}`}
                    onClick={() => setPwFilterTab(tab)}
                  >
                    {tab === 'ALL' && `All Changes (${clientPwRequests.length})`}
                    {tab === 'APPLIED' && `Auto-Applied (${clientPwRequests.filter(r => r.status === 'APPLIED').length})`}
                    {tab === 'APPROVED' && `Manually Approved`}
                    {tab === 'PENDING' && `Pending (${pendingClientPwCount})`}
                    {tab === 'REJECTED' && `Declined`}
                  </button>
                ))}
              </div>

              <div className={styles.searchWrap}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by client name, email, client ID..."
                  value={pwSearchTerm}
                  onChange={(e) => setPwSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {filteredClientPwRequests.length > 0 ? (
              <div className={styles.requestsGrid}>
                {filteredClientPwRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isRevealed = Boolean(revealedPasswords[req.id]);

                  return (
                    <div key={req.id} className={styles.requestCard}>
                      <div className={styles.cardHeader}>
                        <div>
                          <h4 className={styles.applicantName}>{req.client_name}</h4>
                          <span className={styles.applicantDept}>
                            Client ID: <strong>{req.client_code || req.client_id}</strong>
                          </span>
                        </div>
                        <span className={`${styles.statusBadge} ${
                          req.status === 'APPLIED' ? styles.statusApproved :
                          req.status === 'APPROVED' ? styles.statusApproved :
                          req.status === 'REJECTED' ? styles.statusRejected :
                          styles.statusPending
                        }`}>
                          {req.status === 'APPLIED' ? '✓ Applied' : req.status === 'PENDING' ? 'Awaiting Authorization' : req.status}
                        </span>
                      </div>

                      <div className={styles.detailsList}>
                        <div className={styles.detailRow}>
                          <Mail size={14} className={styles.detailIcon} />
                          <span>{req.client_email}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <Clock size={14} className={styles.detailIcon} />
                          <span>Submitted: {new Date(req.submitted_at).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Password Box */}
                      <div style={{
                        background: 'rgba(201, 168, 76, 0.08)',
                        border: '1px solid rgba(201, 168, 76, 0.25)',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        margin: '12px 0',
                        fontSize: '0.84rem'
                      }}>
                        {req.status === 'APPLIED' || req.status === 'APPROVED' ? (
                          <div style={{ fontSize: '0.8rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={14} />
                            Password updated successfully by client on {new Date(req.submitted_at).toLocaleString('en-IN')}
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                Requested New Password:
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(req.id)}
                                style={{ background: 'transparent', border: 'none', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
                              >
                                {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                                {isRevealed ? 'Hide' : 'Reveal'}
                              </button>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e', letterSpacing: isRevealed ? '0.5px' : '3px' }}>
                              {isRevealed ? (req.requested_password || '(hidden)') : '••••••••••••'}
                            </div>
                          </>
                        )}
                      </div>

                      {req.reason && (
                        <div className={styles.bioBox}>
                          <strong>Client Reason:</strong> {req.reason}
                        </div>
                      )}

                      {req.approved_at && (
                        <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '8px' }}>
                          ✓ Authorized by {req.approved_by || 'Designer'} on {new Date(req.approved_at).toLocaleDateString('en-IN')}
                        </div>
                      )}

                      {/* Action Row for PENDING */}
                      {isPending && (
                        <div className={styles.actionRow} style={{ marginTop: '14px' }}>
                          <button
                            onClick={() => handleApproveClientPassword(req.id)}
                            disabled={approvingPwId === req.id}
                            className={styles.approveBtn}
                          >
                            <CheckCircle2 size={15} />
                            <span>{approvingPwId === req.id ? 'Updating...' : 'Authorize & Apply Password'}</span>
                          </button>

                          {rejectingPwId === req.id ? (
                            <div className={styles.rejectForm}>
                              <input
                                type="text"
                                placeholder="Reason for declining..."
                                value={pwRejectReason}
                                onChange={(e) => setPwRejectReason(e.target.value)}
                                className={styles.rejectInput}
                              />
                              <button onClick={() => handleRejectClientPassword(req.id)} className={styles.confirmRejectBtn}>Confirm</button>
                              <button onClick={() => setRejectingPwId(null)} className={styles.cancelRejectBtn}>Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setRejectingPwId(req.id)} className={styles.rejectBtn}>
                              <XCircle size={15} />
                              <span>Decline</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <ShieldCheck size={36} color="var(--color-gold)" />
                <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '8px 0 4px' }}>No Password Changes Yet</h4>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>
                  Client password updates appear here as an audit log. Clients can change their own passwords directly from their profile portal.
                </p>
              </div>
            )}
          </>
        )}

        {/* SECTION 3: EMAIL CHANGE REQUESTS */}
        {activeSection === 'EMAIL' && (
          <>
            <div className={styles.controlBar}>
              <div className={styles.filterTabs}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.filterBtn} ${emailFilterTab === tab ? styles.filterBtnActive : ''}`}
                    onClick={() => setEmailFilterTab(tab)}
                  >
                    {tab === 'ALL' && `All Requests (${emailRequests.length})`}
                    {tab === 'PENDING' && `Pending (${pendingEmailCount})`}
                    {tab === 'APPROVED' && `Approved`}
                    {tab === 'REJECTED' && 'Rejected'}
                  </button>
                ))}
              </div>

              <div className={styles.searchWrap}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by staff name, old email, new email..."
                  value={emailSearchTerm}
                  onChange={(e) => setEmailSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {filteredEmailRequests.length > 0 ? (
              <div className={styles.requestsGrid}>
                {filteredEmailRequests.map((req) => (
                  <div key={req.id} className={styles.requestCard}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.applicantName}>{req.fullName}</h4>
                        <span className={styles.applicantDept}>
                          {req.department?.toUpperCase()} • {req.role?.toUpperCase()}
                        </span>
                      </div>
                      <span className={`${styles.statusBadge} ${
                        req.status === 'APPROVED' ? styles.statusApproved :
                        req.status === 'REJECTED' ? styles.statusRejected :
                        styles.statusPending
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className={styles.detailsList}>
                      <div className={styles.detailRow}>
                        <Mail size={14} className={styles.detailIcon} />
                        <span>Current: <del style={{ color: '#888' }}>{req.currentEmail}</del></span>
                      </div>
                      <div className={styles.detailRow}>
                        <ArrowRight size={14} style={{ color: 'var(--color-gold)' }} />
                        <span>Requested New: <strong style={{ color: '#4ade80' }}>{req.requestedEmail}</strong></span>
                      </div>
                    </div>

                    {req.reason && (
                      <div className={styles.bioBox}>
                        <strong>Reason:</strong> {req.reason}
                      </div>
                    )}

                    {req.status === 'PENDING' && (
                      <div className={styles.actionRow}>
                        <button
                          onClick={() => handleApproveEmail(req.id)}
                          disabled={approvingEmailId === req.id}
                          className={styles.approveBtn}
                        >
                          <CheckCircle2 size={15} />
                          <span>{approvingEmailId === req.id ? 'Updating...' : 'Approve & Update Email ID'}</span>
                        </button>

                        {rejectingEmailId === req.id ? (
                          <div className={styles.rejectForm}>
                            <input
                              type="text"
                              placeholder="Reason for declining..."
                              value={emailRejectReason}
                              onChange={(e) => setEmailRejectReason(e.target.value)}
                              className={styles.rejectInput}
                            />
                            <button onClick={() => handleRejectEmail(req.id)} className={styles.confirmRejectBtn}>Confirm</button>
                            <button onClick={() => setRejectingEmailId(null)} className={styles.cancelRejectBtn}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setRejectingEmailId(req.id)} className={styles.rejectBtn}>
                            <XCircle size={15} />
                            <span>Decline Request</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Mail size={36} color="var(--color-gold)" />
                <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '8px 0 4px' }}>No Email Change Requests</h4>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>No staff email update requests found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
