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
  Sparkles
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { useDesignerAuth } from '@/context/AuthContext';
import styles from './approvals.module.css';

export default function DesignerApprovalsPage() {
  const { 
    designer, 
    getRequests, 
    approveRequest, 
    rejectRequest,
    getEmailChangeRequests,
    approveEmailChangeRequest,
    rejectEmailChangeRequest
  } = useDesignerAuth();

  // Active section: 'ACCESS' | 'EMAIL'
  const [activeSection, setActiveSection] = useState('ACCESS');

  // Access requests state
  const [requests, setRequests] = useState([]);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
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

  const loadAll = () => {
    const all = getRequests();
    setRequests(all);
    const emails = getEmailChangeRequests();
    setEmailRequests(emails);
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

  // Counts
  const pendingKeyCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const pendingEmailCount = emailRequests.filter(r => r.status === 'PENDING').length;

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

  return (
    <>
      <DesignerHeader 
        title="Owner Authorization & Verification Desk" 
        subtitle="Review credential submissions, issue unique security keys, and approve corporate email update requests." 
      />

      <div className={styles.container}>
        {/* Metric Cards */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Pending Key Requests</span>
              <Clock size={20} className={styles.metricIconGold} />
            </div>
            <div className={styles.metricValueGold}>{pendingKeyCount}</div>
            <span className={styles.metricSub}>Awaiting security key issuance</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Pending Email Changes</span>
              <Mail size={20} className={styles.metricIconGold} />
            </div>
            <div className={styles.metricValueGold}>{pendingEmailCount}</div>
            <span className={styles.metricSub}>Staff email update requests</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Approved Architects</span>
              <CheckCircle2 size={20} className={styles.metricIconSuccess} />
            </div>
            <div className={styles.metricValue}>{approvedCount}</div>
            <span className={styles.metricSub}>Active authorized designers</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Current Administrator</span>
              <Crown size={20} className={styles.metricIconGold} />
            </div>
            <div className={styles.metricValue} style={{ fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {designer?.full_name || 'Site Owner'}
            </div>
            <span className={styles.metricSub}>Primary Site Authority</span>
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
            <span>Access & Key Requests</span>
            {pendingKeyCount > 0 && (
              <span className={`${styles.countBadge} ${styles.countBadgePending}`}>
                {pendingKeyCount}
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

        {/* SECTION 1: ACCESS REQUESTS */}
        {activeSection === 'ACCESS' && (
          <>
            {/* Filter and Search Bar */}
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
                  placeholder="Search by name, email, COA reg..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {/* Requests List */}
            {filteredRequests.length > 0 ? (
              <div className={styles.requestsList}>
                {filteredRequests.map((req) => (
                  <div key={req.id} className={`${styles.requestCard} ${req.status === 'PENDING' ? styles.cardPending : ''}`}>
                    <div className={styles.cardHeader}>
                      <div className={styles.applicantInfo}>
                        <div className={styles.avatar}>
                          {req.fullName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 className={styles.applicantName}>{req.fullName}</h3>
                            <span className={`${styles.statusBadge} ${
                              req.status === 'APPROVED' ? styles.badgeApproved :
                              req.status === 'PENDING' ? styles.badgePending :
                              styles.badgeRejected
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <div className={styles.applicantSpecialty}>{req.specialization}</div>
                        </div>
                      </div>

                      {req.status === 'APPROVED' && req.generatedCode && (
                        <div className={styles.tokenDisplay}>
                          <span className={styles.tokenLabel}>Assigned Security Key:</span>
                          <div className={styles.tokenValueWrap}>
                            <code className={styles.tokenCode}>{req.generatedCode}</code>
                            <button 
                              onClick={() => handleCopy(req.generatedCode, req.id)} 
                              className={styles.copyBtn}
                              title="Copy Token"
                            >
                              {copiedId === req.id ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <Mail size={14} color="#888" />
                        <span>{req.email}</span>
                      </div>
                      {req.phone && (
                        <div className={styles.detailItem}>
                          <Phone size={14} color="#888" />
                          <span>{req.phone}</span>
                        </div>
                      )}
                      {req.councilRegNo && (
                        <div className={styles.detailItem}>
                          <Award size={14} color="var(--color-gold)" />
                          <span>COA Reg: <strong>{req.councilRegNo}</strong></span>
                        </div>
                      )}
                      <div className={styles.detailItem}>
                        <Clock size={14} color="#888" />
                        <span>Requested: {new Date(req.requestedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {req.bio && (
                      <div className={styles.bioBox}>
                        <strong>Portfolio / Experience Statement:</strong> {req.bio}
                      </div>
                    )}

                    {/* Action Buttons for PENDING */}
                    {req.status === 'PENDING' && (
                      <div className={styles.actionRow}>
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={approvingId === req.id}
                          className={styles.approveBtn}
                        >
                          <KeyRound size={15} />
                          <span>{approvingId === req.id ? 'Generating Key...' : 'Approve & Issue Unique Key'}</span>
                        </button>

                        {rejectingId === req.id ? (
                          <div className={styles.rejectForm}>
                            <input
                              type="text"
                              placeholder="Reason for rejection (optional)..."
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
                            <span>Reject</span>
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
                <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: '8px 0 4px' }}>No Applications Found</h4>
                <p style={{ color: '#888', fontSize: '0.85rem', maxWidth: '380px' }}>
                  {filterTab === 'PENDING' 
                    ? 'All pending designer access requests have been approved or reviewed!'
                    : 'No access requests matching your current filter criteria.'}
                </p>
              </div>
            )}
          </>
        )}

        {/* SECTION 2: EMAIL CHANGE REQUESTS */}
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
                    {tab === 'APPROVED' && `Approved (${emailRequests.filter(r => r.status === 'APPROVED').length})`}
                    {tab === 'REJECTED' && 'Rejected'}
                  </button>
                ))}
              </div>

              <div className={styles.searchWrap}>
                <Search size={16} className={styles.searchIcon} />
                <input 
                  type="text"
                  placeholder="Search by name, current email, or new email..."
                  value={emailSearchTerm}
                  onChange={(e) => setEmailSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {filteredEmailRequests.length > 0 ? (
              <div className={styles.requestsList}>
                {filteredEmailRequests.map((req) => (
                  <div key={req.id} className={`${styles.requestCard} ${req.status === 'PENDING' ? styles.cardPending : ''}`}>
                    <div className={styles.cardHeader}>
                      <div className={styles.applicantInfo}>
                        <div className={styles.avatar}>
                          {req.fullName?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 className={styles.applicantName}>{req.fullName}</h3>
                            <span className={`${styles.statusBadge} ${
                              req.status === 'APPROVED' ? styles.badgeApproved :
                              req.status === 'PENDING' ? styles.badgePending :
                              styles.badgeRejected
                            }`}>
                              {req.status}
                            </span>
                            {req.department && (
                              <span className={styles.emailDepartmentTag}>
                                {req.department}
                              </span>
                            )}
                          </div>
                          <div className={styles.applicantSpecialty}>
                            Token: {req.company_code || 'Verified Staff'} • Role: {req.role || 'Designer'}
                          </div>
                        </div>
                      </div>

                      {req.status === 'APPROVED' && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={16} />
                          <span>Approved by {req.approvedBy || 'Owner'}</span>
                        </div>
                      )}
                    </div>

                    {/* Email Flow Visualizer */}
                    <div className={styles.emailFlowWrap}>
                      <div className={styles.emailFlowOld}>
                        <Mail size={14} />
                        <span>Current: <strong>{req.currentEmail}</strong></span>
                      </div>
                      <ArrowRight size={16} color="var(--color-gold)" />
                      <div className={styles.emailFlowNew}>
                        <Mail size={14} />
                        <span>Requested New: <strong>{req.requestedEmail}</strong></span>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <Clock size={14} color="#888" />
                        <span>Submitted: {new Date(req.requestedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {req.approvedAt && (
                        <div className={styles.detailItem}>
                          <CheckCircle2 size={14} color="var(--color-success)" />
                          <span>Approved: {new Date(req.approvedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      {req.rejectedAt && (
                        <div className={styles.detailItem}>
                          <XCircle size={14} color="#f87171" />
                          <span>Rejected: {new Date(req.rejectedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {req.reason && (
                      <div className={styles.bioBox}>
                        <strong>Reason for Email Change:</strong> {req.reason}
                      </div>
                    )}

                    {req.rejectionReason && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #f87171', color: '#fca5a5', fontSize: '0.82rem' }}>
                        <strong>Rejection Reason:</strong> {req.rejectionReason}
                      </div>
                    )}

                    {/* Action Buttons for PENDING */}
                    {req.status === 'PENDING' && (
                      <div className={styles.actionRow}>
                        <button
                          onClick={() => handleApproveEmail(req.id)}
                          disabled={approvingEmailId === req.id}
                          className={styles.approveBtn}
                        >
                          <CheckCircle2 size={15} />
                          <span>{approvingEmailId === req.id ? 'Updating Account...' : 'Approve & Update Email ID'}</span>
                        </button>

                        {rejectingEmailId === req.id ? (
                          <div className={styles.rejectForm}>
                            <input
                              type="text"
                              placeholder="Reason for declining email change..."
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
                <p style={{ color: '#888', fontSize: '0.85rem', maxWidth: '380px' }}>
                  {emailFilterTab === 'PENDING' 
                    ? 'All email change requests have been reviewed!' 
                    : 'No email change requests matching your current filter criteria.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
