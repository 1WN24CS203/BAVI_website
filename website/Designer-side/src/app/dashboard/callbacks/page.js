'use client';

import { useState, useEffect } from 'react';
import {
  PhoneCall, Clock, CheckCircle2, User, Mail, Phone, MessageSquare,
  AlertCircle, Filter, Plus, Calendar, ArrowUpRight
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import {
  Button, Badge, Card, TextInput, TextArea, Select, Modal, Toast, Tabs,
  EmptyState, Divider, Tag, StatusDot, SearchInput, Table, Avatar
} from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

export default function CallbackRequestsPage() {
  const { designer, logActivity } = useDesignerAuth();
  const [callbacks, setCallbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCallback, setNewCallback] = useState({
    name: '', phone: '', email: '', is_client: false, subject: '', message: '',
    preferred_time: '', priority: 'normal',
  });

  useEffect(() => {
    loadCallbacks();
  }, []);

  const loadCallbacks = () => {
    try {
      const stored = localStorage.getItem('bavi_callback_requests');
      if (stored) setCallbacks(JSON.parse(stored));
    } catch {}
  };

  const saveCallbacks = (data) => {
    localStorage.setItem('bavi_callback_requests', JSON.stringify(data));
    setCallbacks(data);
  };

  const showToast = (msg) => { setToastMsg(msg); setToastVisible(true); };

  const handleAddCallback = (e) => {
    e.preventDefault();
    if (!newCallback.name || !newCallback.phone) {
      return;
    }
    const cb = {
      ...newCallback,
      id: `cb-${Date.now()}`,
      status: 'new',
      created_at: new Date().toISOString(),
      assigned_to_name: designer?.full_name || '',
    };
    const updated = [cb, ...callbacks];
    saveCallbacks(updated);
    setShowAddModal(false);
    setNewCallback({ name: '', phone: '', email: '', is_client: false, subject: '', message: '', preferred_time: '', priority: 'normal' });
    showToast(`Callback from "${cb.name}" recorded successfully!`);
    logActivity('added_callback', 'callback', cb.name, { phone: cb.phone, is_client: cb.is_client });
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = callbacks.map(c => c.id === id ? { ...c, status: newStatus, contacted_at: newStatus === 'contacted' ? new Date().toISOString() : c.contacted_at } : c);
    saveCallbacks(updated);
    showToast(`Callback status updated to "${newStatus}"`);
  };

  const clientCallbacks = callbacks.filter(c => c.is_client);
  const nonClientCallbacks = callbacks.filter(c => !c.is_client);

  const getFilteredCallbacks = () => {
    let filtered = callbacks;
    if (activeTab === 'client') filtered = clientCallbacks;
    else if (activeTab === 'non-client') filtered = nonClientCallbacks;
    else if (activeTab === 'new') filtered = callbacks.filter(c => c.status === 'new');
    else if (activeTab === 'contacted') filtered = callbacks.filter(c => c.status === 'contacted');

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const filtered = getFilteredCallbacks();

  const tabs = [
    { value: 'all', label: 'All Requests', count: callbacks.length },
    { value: 'client', label: 'From Clients', count: clientCallbacks.length },
    { value: 'non-client', label: 'From Non-Clients', count: nonClientCallbacks.length },
    { value: 'new', label: 'New / Uncontacted', count: callbacks.filter(c => c.status === 'new').length },
    { value: 'contacted', label: 'Contacted', count: callbacks.filter(c => c.status === 'contacted' || c.status === 'completed').length },
  ];

  const priorityColors = { low: 'neutral', normal: 'info', high: 'warning', urgent: 'danger' };
  const statusColors = { new: 'warning', contacted: 'info', scheduled: 'gold', completed: 'success', cancelled: 'danger' };

  return (
    <>
      <DesignerHeader
        title="Callback Request Manager"
        subtitle="Track and manage callback requests from clients and prospective leads — sorted and separated"
      />

      <div style={{ padding: '0 4px' }}>
        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Callbacks</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8f8f8', fontFamily: "'Playfair Display', Georgia, serif" }}>{callbacks.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>From Clients</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#c9a84c', fontFamily: "'Playfair Display', Georgia, serif" }}>{clientCallbacks.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>From Non-Clients</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa', fontFamily: "'Playfair Display', Georgia, serif" }}>{nonClientCallbacks.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Pending Response</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fbbf24', fontFamily: "'Playfair Display', Georgia, serif" }}>{callbacks.filter(c => c.status === 'new').length}</div>
          </Card>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills" />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, phone, email..." onClear={() => setSearchTerm('')} />
            <Button icon={Plus} onClick={() => setShowAddModal(true)} size="sm">Add Callback</Button>
          </div>
        </div>

        {/* Callback List */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((cb) => (
              <Card key={cb.id} variant={cb.status === 'new' ? 'gold' : 'default'} padding="md" hoverable>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                    <Avatar name={cb.name} size="md" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8f8f8' }}>{cb.name}</span>
                        <Badge variant={cb.is_client ? 'gold' : 'info'} size="sm">{cb.is_client ? 'Client' : 'Non-Client'}</Badge>
                        <Badge variant={priorityColors[cb.priority]} size="sm">{cb.priority}</Badge>
                        <Badge variant={statusColors[cb.status]} size="sm" dot>{cb.status}</Badge>
                      </div>
                      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#a0a0a0' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {cb.phone}</span>
                        {cb.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {cb.email}</span>}
                        {cb.preferred_time && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Preferred: {cb.preferred_time}</span>}
                      </div>
                      {cb.subject && <div style={{ fontSize: '0.82rem', color: '#f8f8f8', marginTop: '6px', fontWeight: 600 }}>{cb.subject}</div>}
                      {cb.message && <div style={{ fontSize: '0.78rem', color: '#a0a0a0', marginTop: '3px', lineHeight: 1.5 }}>{cb.message}</div>}
                      <div style={{ fontSize: '0.7rem', color: '#4a4a4a', marginTop: '6px' }}>
                        Received: {new Date(cb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {cb.status === 'new' && (
                      <Button size="xs" variant="success" onClick={() => handleStatusChange(cb.id, 'contacted')}>Mark Contacted</Button>
                    )}
                    {cb.status === 'contacted' && (
                      <Button size="xs" variant="primary" onClick={() => handleStatusChange(cb.id, 'completed')}>Mark Completed</Button>
                    )}
                    {cb.status !== 'cancelled' && cb.status !== 'completed' && (
                      <Button size="xs" variant="ghost" onClick={() => handleStatusChange(cb.id, 'cancelled')}>Cancel</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PhoneCall}
            title="No Callback Requests"
            description="Callback requests from clients and leads will appear here. Add one manually or they'll come from the client portal."
            action={<Button icon={Plus} onClick={() => setShowAddModal(true)}>Add First Callback</Button>}
          />
        )}

        {/* Add Callback Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Record New Callback Request" size="md">
          <form onSubmit={handleAddCallback} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <TextInput label="Name" required placeholder="Full name" value={newCallback.name} onChange={(e) => setNewCallback({ ...newCallback, name: e.target.value })} icon={User} />
              <TextInput label="Phone" required placeholder="+91 XXXXX XXXXX" value={newCallback.phone} onChange={(e) => setNewCallback({ ...newCallback, phone: e.target.value })} icon={Phone} />
            </div>
            <TextInput label="Email" placeholder="email@domain.com" value={newCallback.email} onChange={(e) => setNewCallback({ ...newCallback, email: e.target.value })} icon={Mail} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <Select label="Type" value={newCallback.is_client ? 'client' : 'non-client'} onChange={(e) => setNewCallback({ ...newCallback, is_client: e.target.value === 'client' })} options={[{ value: 'client', label: 'Existing Client' }, { value: 'non-client', label: 'Non-Client / Lead' }]} />
              <Select label="Priority" value={newCallback.priority} onChange={(e) => setNewCallback({ ...newCallback, priority: e.target.value })} options={[{ value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]} />
              <TextInput label="Preferred Time" placeholder="e.g. 2-4 PM" value={newCallback.preferred_time} onChange={(e) => setNewCallback({ ...newCallback, preferred_time: e.target.value })} icon={Clock} />
            </div>
            <TextInput label="Subject" placeholder="Regarding..." value={newCallback.subject} onChange={(e) => setNewCallback({ ...newCallback, subject: e.target.value })} />
            <TextArea label="Message / Notes" rows={3} placeholder="Details about the callback request..." value={newCallback.message} onChange={(e) => setNewCallback({ ...newCallback, message: e.target.value })} />
            <Button type="submit" fullWidth icon={PhoneCall}>Record Callback Request</Button>
          </form>
        </Modal>

        <Toast message={toastMsg} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    </>
  );
}
