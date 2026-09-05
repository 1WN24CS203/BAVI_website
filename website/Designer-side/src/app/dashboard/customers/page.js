'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Search, Phone, Mail, MapPin, FolderKanban, Plus, 
  CheckCircle2, ChevronRight, ExternalLink, UserPlus, Building, ShieldCheck
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Button, Badge, Card, TextInput, TextArea, Modal, Toast,
  EmptyState, Divider, Tag, SearchInput, Avatar
} from '@/components/astryx';

const DEFAULT_CLIENTS = [
  {
    id: 'cli-demo-1',
    full_name: 'Rajesh Sharma',
    email: 'rajesh.sharma@example.com',
    phone: '+91 98450 12345',
    address: 'BM Road, Channarayapatna',
    role: 'customer',
    project: 'Channarayapatna 4BHK Heritage Villa',
    status: 'Active Client'
  },
  {
    id: 'cli-demo-2',
    full_name: 'Pooja Reddy',
    email: 'pooja.reddy@example.com',
    phone: '+91 98450 67890',
    address: 'Hassan Road, Channarayapatna',
    role: 'customer',
    project: 'Modernist Penthouse Interior',
    status: 'Active Client'
  },
  {
    id: 'cli-demo-3',
    full_name: 'Kavitha Swamy',
    email: 'kavitha.swamy@gmail.com',
    phone: '+91 94480 34567',
    address: 'Mysuru Highway, Channarayapatna',
    role: 'customer',
    project: 'Eco-Luxury Farmhouse Architecture',
    status: 'Active Client'
  }
];

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
    budget: ''
  });

  const showToast = (msg, variant = 'success') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastVisible(true);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    let loadedClients = [];
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer');

        if (data && data.length > 0) {
          loadedClients = data;
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

    if (loadedClients.length === 0) {
      loadedClients = DEFAULT_CLIENTS;
    }

    setClients(loadedClients);
    try {
      localStorage.setItem('bavi_registered_clients', JSON.stringify(loadedClients));
    } catch {}
    setLoading(false);
  };

  const handleOnboardClient = async (e) => {
    e.preventDefault();
    if (!newClient.full_name || !newClient.email) {
      showToast('Please enter client full name and email', 'error');
      return;
    }

    const created = {
      ...newClient,
      id: `cli-${Date.now()}`,
      role: 'customer',
      project: newClient.project_title || 'New Architectural Commission',
      progress: 0,
      status: 'Active Client'
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('profiles').insert([
          {
            full_name: newClient.full_name,
            email: newClient.email,
            phone: newClient.phone,
            address: newClient.address,
            role: 'customer'
          }
        ]);
      } catch (err) {
        console.warn('Supabase save error:', err);
      }
    }

    const updated = [created, ...clients];
    setClients(updated);
    try {
      localStorage.setItem('bavi_registered_clients', JSON.stringify(updated));
    } catch {}
    setShowAddModal(false);
    setNewClient({ full_name: '', email: '', phone: '', address: '', project_title: '', budget: '' });
    showToast(`Client "${newClient.full_name}" registered & onboarded to platform!`);
  };

  const filtered = clients.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.project?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DesignerHeader 
        title="Client Portfolio Management" 
        subtitle="Onboard, register, and manage verified homeowners and commercial clients" 
      />

      <div style={{ padding: '0 4px' }}>
        {/* Top Control Bar with Astryx Search & Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div style={{ maxWidth: '420px', width: '100%' }}>
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client name, email, or address..."
              onClear={() => setSearchTerm('')}
            />
          </div>

          <Button 
            icon={Plus} 
            onClick={() => setShowAddModal(true)}
            size="md"
          >
            Onboard New Client
          </Button>
        </div>

        {/* Client Roster using Astryx Cards */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filtered.map((client) => (
              <Card key={client.id || client.email} variant="gold" padding="md" hoverable>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                  <Avatar name={client.full_name} size="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8f8f8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {client.full_name}
                      </h4>
                      <Tag variant="success">Active Client</Tag>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#a0a0a0', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} color="#c9a84c" /> {client.email}
                    </div>
                  </div>
                </div>

                {/* Assigned Project Box */}
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
            description="Onboard real clients to register their profiles. Once registered, they can be assigned projects, milestones, and bills."
            action={
              <Button icon={Plus} onClick={() => setShowAddModal(true)}>
                Onboard New Client
              </Button>
            }
          />
        )}

        {/* Modal for Onboarding New Client using Astryx Modal */}
        <Modal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          title="Onboard & Register New Client" 
          size="md"
        >
          <form onSubmit={handleOnboardClient} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Divider label="Client Profile Identity" />

            <TextInput
              label="Client Full Name"
              required
              placeholder="e.g. Ramesh Kumar"
              value={newClient.full_name}
              onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextInput
                label="Email Address"
                type="email"
                required
                placeholder="client@email.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                icon={Mail}
              />
              <TextInput
                label="Phone Number"
                placeholder="+91 98450 XXXXX"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                icon={Phone}
              />
            </div>

            <TextInput
              label="Site Location / Address"
              placeholder="e.g. BM Road, Channarayapatna"
              value={newClient.address}
              onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
              icon={MapPin}
            />

            <Divider label="Initial Commission Scope" />

            <TextInput
              label="Commission / Project Title"
              placeholder="e.g. Channarayapatna 3BHK Contemporary Villa"
              value={newClient.project_title}
              onChange={(e) => setNewClient({ ...newClient, project_title: e.target.value })}
              icon={Building}
            />

            <TextInput
              label="Estimated Budget (INR)"
              type="number"
              placeholder="e.g. 4500000"
              value={newClient.budget}
              onChange={(e) => setNewClient({ ...newClient, budget: e.target.value })}
            />

            <Button type="submit" fullWidth size="lg" icon={UserPlus}>
              Register Client into Portfolio
            </Button>
          </form>
        </Modal>

        {/* Toast */}
        <Toast message={toastMsg} variant={toastVariant} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    </>
  );
}
