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
  AlertCircle
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { useDesignerAuth } from '@/context/AuthContext';
import styles from './approvals.module.css';

export default function DesignerApprovalsPage() {
  const { designer, getRequests, approveRequest, rejectRequest } = useDesignerAuth();
  const [requests, setRequests] = useState([]);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = () => {
    const all = getRequests();
    setRequests(all);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await approveRequest(id);
      loadRequests();
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
      loadRequests();
      setRejectingId(null);
      setRejectReason('');
      setToast('Request was marked as rejected.');
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

  const filteredRequests = requests.filter(r => {
    const matchesTab = filterTab === 'ALL' || r.status === filterTab;
    const matchesSearch = 
      r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.councilRegNo?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;

  return (
    <>
      <DesignerHeader 
        title="Designer Access & Key Approvals" 
        subtitle="Review credential submissions, issue unique security keys, and manage portal authorizations." 
      />

      <div className={styles.container}>
        {/* Metric Cards */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricTop}>
              <span className={styles.metricLabel}>Pending Key Requests</span>
              <Clock size={20} className={styles.metricIconGold} />
            </div>
            <div className={styles.metricValueGold}>{pendingCount}</div>
            <span className={styles.metricSub}>Awaiting your architectural review</span>
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
                {tab === 'PENDING' && `Pending (${pendingCount})`}
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
      </div>
    </>
  );
}
