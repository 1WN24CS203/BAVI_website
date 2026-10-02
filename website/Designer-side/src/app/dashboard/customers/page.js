'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, Phone, Mail, MapPin, FolderKanban, Plus, 
  CheckCircle2, ChevronRight, ExternalLink, UserPlus, Building, ShieldCheck,
  KeyRound, Send, Copy, Check, Eye, EyeOff, X
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Button, Badge, Card, TextInput, TextArea, Modal, Toast,
  EmptyState, Divider, Tag, SearchInput, Avatar
} from '@/components/astryx';

export default function DesignerCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState('success');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    project_title: '',
    budget: '',
    client_code: '',
    password: '',
  });

  // Dispatched Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [dispatchedEmail, setDispatchedEmail] = useState(null);
  const [copied, setCopied] = useState(false);

  const showToast = (msg, variant = 'success') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastVisible(true);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return `Bavi#${Math.floor(1000 + Math.random() * 9000)}@${code}`;
  };

  const generateClientCode = () => {
    return `BAVI-CLI-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openOnboardModal = () => {
    setNewClient({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      project_title: '',
      budget: '',
      client_code: generateClientCode(),
      password: generatePassword(),
    });
    setShowAddModal(true);
  };

  const fetchClients = async () => {
    let loadedClients = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['customer', 'client']);

        if (data && data.length > 0) {
          loadedClients = data.map(c => ({
            ...c,
            client_code: c.metadata?.client_code || c.client_code || c.id,
            designer_approved: c.metadata?.designer_approved ?? true,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch error:', err);
      }
    }

    try {
      const local = localStorage.getItem('bavi_registered_clients');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const emailMap = new Map();
          [...loadedClients, ...parsed].forEach(c => {
            if (c.email) emailMap.set(c.email.toLowerCase(), c);
          });
          loadedClients = Array.from(emailMap.values());
        }
      }
    } catch {}

    setClients(loadedClients);
    setLoading(false);
  };

  const handleOnboardClient = async (e) => {
    e.preventDefault();
    if (!newClient.full_name || !newClient.email) {
      showToast('Please enter client full name and email', 'error');
      return;
    }

    const clientId = `cli-${Date.now()}`;
    const clientCode = newClient.client_code || generateClientCode();
    const issuedPassword = newClient.password || generatePassword();

    const created = {
      ...newClient,
      id: clientId,
      user_id: clientId,
      client_code: clientCode,
      password: issuedPassword,
      role: 'customer',
      project: newClient.project_title || 'New Architectural Commission',
      progress: 0,
      status: 'Active Client',
      designer_approved: true,
      approved_at: new Date().toISOString(),
    };

    // 1. Sync to Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('profiles').upsert([
          {
            full_name: newClient.full_name,
            email: newClient.email.toLowerCase().trim(),
            phone: newClient.phone,
            address: newClient.address,
            role: 'customer',
            metadata: {
              client_code: clientCode,
              designer_approved: true,
              approved_at: created.approved_at
            }
          }
        ], { onConflict: 'email' });
      } catch (err) {
        console.warn('Supabase save error:', err);
      }
    }

    // 2. Sync to local storage
    const updated = [created, ...clients];
    setClients(updated);
    try {
      localStorage.setItem('bavi_registered_clients', JSON.stringify(updated));

      const accStored = localStorage.getItem('bavi_registered_accounts');
      const accList = accStored ? JSON.parse(accStored) : [];
      localStorage.setItem('bavi_registered_accounts', JSON.stringify([created, ...accList]));
    } catch {}

    setShowAddModal(false);

    // 3. Open official email dispatch preview
    const emailPayload = {
      to: newClient.email.toLowerCase().trim(),
      clientName: newClient.full_name,
      clientId: clientCode,
      password: issuedPassword,
      projectTitle: newClient.project_title || 'Architectural Commission',
      loginUrl: 'http://localhost:3000/login',
      dispatchedAt: new Date().toISOString(),
    };

    setDispatchedEmail(emailPayload);
    setEmailModalOpen(true);

    showToast(`Client "${newClient.full_name}" registered & credentials generated!`);
  };

  const handleCopyCredentials = () => {
    if (!dispatchedEmail) return;
    const text = 
`BAVI ARCHITECTURAL STUDIO — CLIENT ACCESS CREDENTIALS
Client Name: ${dispatchedEmail.clientName}
Client ID: ${dispatchedEmail.clientId}
Portal Login: ${dispatchedEmail.loginUrl}
Email ID: ${dispatchedEmail.to}
Temporary Password: ${dispatchedEmail.password}
Project Title: ${dispatchedEmail.projectTitle}

Please log in to inspect blueprint progress, co-pilot milestones, and approve stage documents.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filtered = clients.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.project?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DesignerHeader 
        title="Client Portfolio Management" 
        subtitle="Onboard, register, and manage verified homeowners and commercial clients with designer-issued credentials" 
      />

      <div style={{ padding: '0 4px' }}>
        {/* Top Control Bar with Search & Onboard Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div style={{ maxWidth: '420px', width: '100%' }}>
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client name, ID, email, or project..."
              onClear={() => setSearchTerm('')}
            />
          </div>
          <Button 
            variant="gold" 
            icon={Plus}
            onClick={openOnboardModal}
          >
            Onboard New Client &amp; Issue ID
          </Button>
        </div>

        {/* Client Roster Grid */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {filtered.map((client) => (
              <Card key={client.id || client.email} variant="bordered" padding="md">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar 
                      name={client.full_name || client.name} 
                      size="md" 
                      color="gold"
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f8f8f8' }}>
                        {client.full_name || client.name}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: '#8e8e8e', marginTop: '2px' }}>
                        {client.email}
                      </div>
                    </div>
                  </div>
                  <Badge variant="gold" dot>Approved Client</Badge>
                </div>

                {/* Client ID & Credential Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(201, 168, 76, 0.08)',
                  border: '1px solid rgba(201, 168, 76, 0.2)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  marginBottom: '10px',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: '#aaa' }}>Client ID:</span>
                  <strong style={{ color: '#c9a84c', letterSpacing: '0.5px' }}>
                    {client.client_code || client.client_id || client.id}
                  </strong>
                </div>

                {/* Commission Summary */}
                <div style={{
                  background: '#161616',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  border: '1px solid #282828',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '0.68rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Assigned Commission
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8f8f8', marginTop: '3px' }}>
                    {client.project || 'Architectural Commission'}
                  </div>
                  {client.address && (
                    <div style={{ fontSize: '0.76rem', color: '#888', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={12} color="#c9a84c" /> {client.address}
                    </div>
                  )}
                </div>

                {/* Contact Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {client.phone && (
                    <a 
                      href={`tel:${client.phone}`} 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#1e1e1e',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#c9a84c',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      <Phone size={12} /> {client.phone}
                    </a>
                  )}
                  {client.email && (
                    <a 
                      href={`mailto:${client.email}`} 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#1e1e1e',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#e0e0e0',
                        textDecoration: 'none'
                      }}
                    >
                      <Mail size={12} /> Email
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UserPlus}
            title="No Clients Found"
            description="Onboard real clients to register their profiles and dispatch portal credentials."
            action={
              <Button icon={Plus} onClick={openOnboardModal}>
                Onboard New Client
              </Button>
            }
          />
        )}

        {/* Modal: Onboard Client & Generate Credentials */}
        <Modal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          title="Onboard & Issue Client Credentials" 
          size="md"
        >
          <form onSubmit={handleOnboardClient} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Divider label="Auto-Generated Client Credentials" />

            <div style={{
              background: 'rgba(201, 168, 76, 0.08)',
              border: '1px dashed rgba(201, 168, 76, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#888', display: 'block', marginBottom: '4px' }}>Client ID</label>
                <input
                  type="text"
                  value={newClient.client_code}
                  readOnly
                  style={{ width: '100%', background: '#0d0d12', border: '1px solid #333', color: '#c9a84c', fontWeight: 700, padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.72rem', color: '#888' }}>Temporary Password</label>
                  <button
                    type="button"
                    onClick={() => setNewClient(p => ({ ...p, password: generatePassword() }))}
                    style={{ background: 'transparent', border: 'none', color: '#c9a84c', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Re-roll
                  </button>
                </div>
                <input
                  type="text"
                  value={newClient.password}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                  style={{ width: '100%', background: '#0d0d12', border: '1px solid #333', color: '#22c55e', fontWeight: 700, padding: '8px', borderRadius: '6px', fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>

            <Divider label="Client Profile Identity" />

            <TextInput
              label="Client Full Legal Name"
              required
              placeholder="e.g. Ramesh Kumar"
              value={newClient.full_name}
              onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Dispatch Email Address"
                type="email"
                required
                placeholder="ramesh@gmail.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
              <TextInput
                label="Primary Phone Number"
                type="tel"
                placeholder="+91 98450 12345"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              />
            </div>

            <TextInput
              label="Site Plot / Permanent Address"
              placeholder="Plot 42, Green Glen Layout, Bengaluru"
              value={newClient.address}
              onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
            />

            <Divider label="Initial Commission Details" />

            <TextInput
              label="Project Title"
              placeholder="e.g. Luxury Duplex Residence"
              value={newClient.project_title}
              onChange={(e) => setNewClient({ ...newClient, project_title: e.target.value })}
            />

            <TextInput
              label="Estimated Budget (₹ INR)"
              type="number"
              placeholder="e.g. 5000000"
              value={newClient.budget}
              onChange={(e) => setNewClient({ ...newClient, budget: e.target.value })}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Button type="submit" variant="gold" icon={Send} style={{ flex: 1 }}>
                Register Client &amp; Dispatch Credentials Mail
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Official Dispatched Email Preview */}
        {emailModalOpen && dispatchedEmail && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{
              background: '#0d0e15',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.95)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 color="#22c55e" size={22} />
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Credentials Dispatched via Email</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{
                background: '#161722',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '18px',
                fontFamily: 'monospace, sans-serif'
              }}>
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '12px', fontSize: '0.8rem', color: '#aaa' }}>
                  <div><strong>From:</strong> BAVI Architectural Concierge &lt;concierge@bavi.in&gt;</div>
                  <div><strong>To:</strong> {dispatchedEmail.to}</div>
                  <div><strong>Subject:</strong> Your Project Booking is Approved — BAVI Client Portal Access Credentials</div>
                </div>

                <div style={{ fontSize: '0.86rem', color: '#e0e0e0', lineHeight: '1.6' }}>
                  <p>Dear {dispatchedEmail.clientName},</p>
                  <p>Your architectural commission for <strong>{dispatchedEmail.projectTitle}</strong> has been approved by the BAVI Studio team.</p>
                  
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px dashed #c9a84c',
                    borderRadius: '8px',
                    padding: '14px',
                    margin: '14px 0'
                  }}>
                    <div style={{ color: '#c9a84c', fontWeight: 700, marginBottom: '6px' }}>Client Access Keys:</div>
                    <div><strong>Client ID:</strong> <span style={{ color: '#fff' }}>{dispatchedEmail.clientId}</span></div>
                    <div><strong>Login Email:</strong> <span style={{ color: '#fff' }}>{dispatchedEmail.to}</span></div>
                    <div><strong>Temporary Password:</strong> <span style={{ color: '#22c55e', fontWeight: 700 }}>{dispatchedEmail.password}</span></div>
                    <div><strong>Portal URL:</strong> <a href={dispatchedEmail.loginUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>{dispatchedEmail.loginUrl}</a></div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#999', margin: 0 }}>
                    You can change this password anytime in your dashboard by submitting a notification to your designer.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button
                  size="sm"
                  variant={copied ? 'success' : 'gold'}
                  icon={copied ? Check : Copy}
                  onClick={handleCopyCredentials}
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEmailModalOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        <Toast message={toastMsg} isVisible={toastVisible} onClose={() => setToastVisible(false)} variant={toastVariant} />
      </div>
    </>
  );
}
