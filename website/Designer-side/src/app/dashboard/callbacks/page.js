'use client';

import { useState, useEffect } from 'react';
import {
  PhoneCall, Clock, CheckCircle2, User, Mail, Phone, MessageSquare,
  AlertCircle, Filter, Calendar, ArrowUpRight, Sparkles, CheckCircle, RefreshCw, ShieldCheck
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import {
  Button, Badge, Card, Toast, Tabs,
  EmptyState, Divider, Tag, StatusDot, SearchInput, Avatar
} from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

const DEFAULT_CALLBACKS = [
  {
    id: 'cb-init-1',
    name: 'Vikramaditya Rao',
    clientName: 'Vikramaditya Rao',
    phone: '+91 99801 44552',
    email: 'vikram.rao@gmail.com',
    is_client: false,
    isClient: false,
    subject: 'Luxury Villa Architecture',
    message: 'Looking for turnkey architectural design for a 40x60 plot on BM Road, Channarayapatna.',
    status: 'pending',
    priority: 'high',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    requestedAt: new Date(Date.now() - 3600000 * 2).toISOString().replace('T', ' ').slice(0, 16),
  },
  {
    id: 'cb-init-2',
    name: 'Rajesh Sharma',
    clientName: 'Rajesh Sharma',
    phone: '+91 98450 12345',
    email: 'rajesh.sharma@example.com',
    is_client: true,
    isClient: true,
    subject: 'Priority Client Assistance',
    message: 'Direct callback requested from Client Dashboard regarding Stage 2 electrical conduit alignment.',
    status: 'attended',
    attended_by: 'Lead Architect',
    attended_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    priority: 'urgent',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    requestedAt: new Date(Date.now() - 3600000 * 6).toISOString().replace('T', ' ').slice(0, 16),
  },
  {
    id: 'cb-init-3',
    name: 'Ananya Hegde',
    clientName: 'Ananya Hegde',
    phone: '+91 87622 99881',
    email: 'ananya.hegde@outlook.com',
    is_client: false,
    isClient: false,
    subject: 'Bespoke Interior Design',
    message: 'Inquiry for modern Scandinavian interior styling for 3BHK flat in Channarayapatna.',
    status: 'resolved',
    attended_by: 'Design Director',
    attended_at: new Date(Date.now() - 86400000).toISOString(),
    resolved_at: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    priority: 'normal',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    requestedAt: new Date(Date.now() - 86400000 * 2).toISOString().replace('T', ' ').slice(0, 16),
  }
];

export default function CallbackRequestsPage() {
  const { designer, logActivity } = useDesignerAuth();
  const [callbacks, setCallbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    loadCallbacks();
  }, []);

  const normalizeStatus = (rawStatus) => {
    if (!rawStatus) return 'pending';
    const s = String(rawStatus).toLowerCase();
    if (s === 'attended' || s === 'contacted') return 'attended';
    if (s === 'resolved' || s === 'completed') return 'resolved';
    return 'pending'; // Covers 'pending', 'new', 'unattended', etc.
  };

  const loadCallbacks = () => {
    try {
      const stored = localStorage.getItem('bavi_callback_requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map(c => ({
            ...c,
            name: c.name || c.clientName || 'Inquiry Contact',
            phone: c.phone || 'Not provided',
            is_client: Boolean(c.is_client ?? c.isClient ?? false),
            status: normalizeStatus(c.status),
            created_at: c.created_at || c.requestedAt || new Date().toISOString(),
          }));
          setCallbacks(normalized);
          return;
        }
      }
    } catch {}

    // Initial fallback if nothing stored yet
    setCallbacks(DEFAULT_CALLBACKS);
    try {
      localStorage.setItem('bavi_callback_requests', JSON.stringify(DEFAULT_CALLBACKS));
    } catch {}
  };

  const saveCallbacks = (data) => {
    localStorage.setItem('bavi_callback_requests', JSON.stringify(data));
    setCallbacks(data);
  };

  const showToast = (msg) => { setToastMsg(msg); setToastVisible(true); };

  // Status Workflow Handlers
  const handleMarkAttended = (id) => {
    const updated = callbacks.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'attended',
          attended_at: new Date().toISOString(),
          attended_by: designer?.full_name || 'Design Team Architect',
        };
      }
      return c;
    });
    saveCallbacks(updated);
    showToast('Callback request marked as Attended!');
    const target = callbacks.find(c => c.id === id);
    logActivity('attended_callback', 'callback', target?.name || 'Inquiry', { status: 'attended' });
  };

  const handleMarkResolved = (id) => {
    const updated = callbacks.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          attended_at: c.attended_at || new Date().toISOString(),
          attended_by: c.attended_by || designer?.full_name || 'Design Team Architect',
        };
      }
      return c;
    });
    saveCallbacks(updated);
    showToast('Callback request marked as Resolved!');
    const target = callbacks.find(c => c.id === id);
    logActivity('resolved_callback', 'callback', target?.name || 'Inquiry', { status: 'resolved' });
  };

  const handleRevertPending = (id) => {
    const updated = callbacks.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'pending',
        };
      }
      return c;
    });
    saveCallbacks(updated);
    showToast('Callback request moved back to Pending (Unattended)');
  };

  // Filter Categories
  const pendingCallbacks = callbacks.filter(c => c.status === 'pending');
  const attendedCallbacks = callbacks.filter(c => c.status === 'attended');
  const resolvedCallbacks = callbacks.filter(c => c.status === 'resolved');
  const clientCallbacks = callbacks.filter(c => c.is_client);
  const nonClientCallbacks = callbacks.filter(c => !c.is_client);

  const getFilteredCallbacks = () => {
    let list = callbacks;
    if (activeTab === 'pending') list = pendingCallbacks;
    else if (activeTab === 'attended') list = attendedCallbacks;
    else if (activeTab === 'resolved') list = resolvedCallbacks;
    else if (activeTab === 'client') list = clientCallbacks;
    else if (activeTab === 'non-client') list = nonClientCallbacks;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const filtered = getFilteredCallbacks();

  const tabs = [
    { value: 'all', label: 'All Requests', count: callbacks.length },
    { value: 'pending', label: 'Pending (Unattended)', count: pendingCallbacks.length },
    { value: 'attended', label: 'Attended', count: attendedCallbacks.length },
    { value: 'resolved', label: 'Resolved', count: resolvedCallbacks.length },
    { value: 'client', label: 'From Registered Clients', count: clientCallbacks.length },
    { value: 'non-client', label: 'Website Inquiries', count: nonClientCallbacks.length },
  ];

  return (
    <>
      <DesignerHeader
        title="Callback & Inquiry Concierge"
        subtitle="Live feed of user-side consultation requests and client inquiries — track attended and resolved status"
      />

      <div style={{ padding: '0 4px' }}>
        {/* Notice Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(201, 168, 76, 0.08)',
          border: '1px solid rgba(201, 168, 76, 0.28)',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#c9a84c" />
            <span style={{ fontSize: '0.86rem', color: '#e8e8e8' }}>
              <strong>Inbound Inquiries Live Feed:</strong> Entries originate exclusively from the client-side website inquiry form and client dashboard consultation requests.
            </span>
          </div>
          <Tag variant="gold">User-Side Automated Feed</Tag>
        </div>

        {/* Metrics Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Inbound</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8f8f8', fontFamily: "'Playfair Display', Georgia, serif" }}>{callbacks.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Pending (Unattended)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fbbf24', fontFamily: "'Playfair Display', Georgia, serif" }}>{pendingCallbacks.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Attended (In Progress)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa', fontFamily: "'Playfair Display', Georgia, serif" }}>{attendedCallbacks.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#4ade80', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Resolved</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#4ade80', fontFamily: "'Playfair Display', Georgia, serif" }}>{resolvedCallbacks.length}</div>
          </Card>
        </div>

        {/* Controls Bar (No Manual Add Button) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills" />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, email, subject..."
              onClear={() => setSearchTerm('')}
            />
            <Button size="sm" variant="outline" icon={RefreshCw} onClick={loadCallbacks}>
              Sync Live Feed
            </Button>
          </div>
        </div>

        {/* Callback List */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((cb) => {
              const isPending = cb.status === 'pending';
              const isAttended = cb.status === 'attended';
              const isResolved = cb.status === 'resolved';

              return (
                <Card
                  key={cb.id}
                  variant={isPending ? 'gold' : isAttended ? 'elevated' : 'default'}
                  padding="md"
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                      <Avatar name={cb.name} size="md" />
                      <div style={{ flex: 1 }}>
                        {/* Header Tags */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8f8f8' }}>{cb.name}</span>

                          {/* Status Tag */}
                          {isPending && (
                            <Tag variant="warning">
                              🟡 Pending (Unattended)
                            </Tag>
                          )}
                          {isAttended && (
                            <Tag variant="info">
                              🔵 Attended
                            </Tag>
                          )}
                          {isResolved && (
                            <Tag variant="success">
                              🟢 Resolved
                            </Tag>
                          )}

                          {/* Origin Tag */}
                          {cb.is_client ? (
                            <Tag variant="gold">
                              👑 Registered Client
                            </Tag>
                          ) : (
                            <Tag variant="neutral">
                              🌐 Website Inquiry
                            </Tag>
                          )}

                          {cb.priority && cb.priority !== 'normal' && (
                            <Badge variant={cb.priority === 'urgent' ? 'danger' : 'warning'} size="sm">
                              {cb.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>

                        {/* Contact Information */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#a0a0a0', marginBottom: '8px' }}>
                          <a href={`tel:${cb.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#c9a84c', textDecoration: 'none' }}>
                            <Phone size={13} /> {cb.phone}
                          </a>
                          {cb.email && (
                            <a href={`mailto:${cb.email}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e0e0e0', textDecoration: 'none' }}>
                              <Mail size={13} /> {cb.email}
                            </a>
                          )}
                          {cb.preferred_time && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#888' }}>
                              <Clock size={13} /> Preferred: {cb.preferred_time}
                            </span>
                          )}
                        </div>

                        {/* Subject & Message */}
                        {cb.subject && (
                          <div style={{ fontSize: '0.85rem', color: '#f8f8f8', fontWeight: 600, marginBottom: '4px' }}>
                            {cb.subject}
                          </div>
                        )}
                        {cb.message && (
                          <div style={{
                            fontSize: '0.82rem',
                            color: '#b0b0b0',
                            lineHeight: 1.5,
                            background: '#161616',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            borderLeft: '3px solid #c9a84c'
                          }}>
                            {cb.message}
                          </div>
                        )}

                        {/* Timestamps & Attended/Resolved Details */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.73rem', color: '#666' }}>
                          <span>
                            Received: {new Date(cb.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>

                          {cb.attended_at && (
                            <span style={{ color: '#60a5fa', fontWeight: 500 }}>
                              • Attended by {cb.attended_by || 'Architect'} on {new Date(cb.attended_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}

                          {cb.resolved_at && (
                            <span style={{ color: '#4ade80', fontWeight: 500 }}>
                              • Resolved on {new Date(cb.resolved_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            variant="info"
                            icon={PhoneCall}
                            onClick={() => handleMarkAttended(cb.id)}
                          >
                            Mark as Attended
                          </Button>
                          <Button
                            size="sm"
                            variant="success"
                            icon={CheckCircle2}
                            onClick={() => handleMarkResolved(cb.id)}
                          >
                            Direct Resolve
                          </Button>
                        </>
                      )}

                      {isAttended && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            icon={CheckCircle2}
                            onClick={() => handleMarkResolved(cb.id)}
                          >
                            Mark as Resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevertPending(cb.id)}
                          >
                            Revert to Pending
                          </Button>
                        </>
                      )}

                      {isResolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={RefreshCw}
                          onClick={() => handleMarkAttended(cb.id)}
                        >
                          Re-open (Mark Attended)
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={PhoneCall}
            title="No Inbound Callback Requests Found"
            description="Callback requests are automatically populated when clients and prospective leads submit inquiry forms or request phone consultations from the client-side portal."
            action={
              <Button variant="outline" icon={RefreshCw} onClick={loadCallbacks}>
                Check for New Inbound Inquiries
              </Button>
            }
          />
        )}

        <Toast message={toastMsg} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    </>
  );
}
