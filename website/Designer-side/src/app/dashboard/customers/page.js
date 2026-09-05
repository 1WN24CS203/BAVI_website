'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  UserPlus
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './customers.module.css';

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
  const [toast, setToast] = useState('');

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
      alert('Please enter client full name and email');
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
    setToast(`Client ${newClient.full_name} onboarded successfully!`);
    setTimeout(() => setToast(''), 3500);
  };

  const filtered = clients.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DesignerHeader 
        title="Client Portfolio Management" 
        subtitle="Onboard and manage homeowners and commercial clients" 
      />

      <div className={styles.container}>
        {/* Top Control Bar */}
        <div className={styles.controlBar}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by client name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button className={styles.addClientBtn} onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Onboard New Client</span>
          </button>
        </div>

        {toast && (
          <div className={styles.toast} style={{ padding: '12px 18px', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid var(--color-success)', borderRadius: '6px', fontSize: '0.85rem' }}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toast}</span>
          </div>
        )}

        {/* Clients Grid / Clean Empty State */}
        {filtered.length > 0 ? (
          <div className={styles.clientsGrid}>
            {filtered.map((client) => (
              <div key={client.id} className={styles.clientCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.clientAvatar}>
                    {(client.full_name || 'C').charAt(0)}
                  </div>
                  <div className={styles.clientMain}>
                    <h3 className={styles.clientName}>{client.full_name}</h3>
                    <span className={styles.statusPill}>{client.status || 'Active Client'}</span>
                  </div>
                </div>

                <div className={styles.projectBox}>
                  <span className={styles.projectLabel}>Assigned Project:</span>
                  <h4 className={styles.projectTitle}>{client.project || 'Architectural Commission'}</h4>
                  {client.address && (
                    <div className={styles.locationRow}>
                      <MapPin size={14} color="var(--color-gold)" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Contact Actions */}
                <div className={styles.contactRow}>
                  {client.phone && (
                    <a href={`tel:${client.phone}`} className={styles.contactIconBtn} title="Call Client">
                      <Phone size={15} />
                      <span>{client.phone}</span>
                    </a>
                  )}
                  {client.email && (
                    <a href={`mailto:${client.email}`} className={styles.contactIconBtn} title="Email Client">
                      <Mail size={15} />
                      <span>{client.email}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--color-dark)',
            border: '1px dashed rgba(201, 168, 76, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '60px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}>
            <UserPlus size={36} color="var(--color-gold)" />
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#f8f8f8', marginBottom: '6px' }}>
                No Clients Onboarded Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                Click <strong>"Onboard New Client"</strong> to add your real clients to the portal.
              </p>
            </div>
          </div>
        )}

        {/* Modal for Onboarding New Client */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }} onClick={() => setShowAddModal(false)}>
            <div style={{
              background: '#141414',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  Onboard New Client
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleOnboardClient} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Client Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newClient.full_name}
                    onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Email Address *</label>
                    <input 
                      type="email"
                      required
                      placeholder="client@email.com"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Phone Number</label>
                    <input 
                      type="tel"
                      placeholder="+91 98765 XXXXX"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Project Title</label>
                  <input 
                    type="text"
                    placeholder="e.g. Channarayapatna Villa Build"
                    value={newClient.project_title}
                    onChange={(e) => setNewClient({ ...newClient, project_title: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Site / Property Address</label>
                  <input 
                    type="text"
                    placeholder="e.g. BM Road, Channarayapatna"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <button 
                  type="submit"
                  style={{
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
                    color: '#000',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  Onboard Client & Save Profile
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
