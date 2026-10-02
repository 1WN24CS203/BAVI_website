'use client';

import { useState, useEffect } from 'react';
import {
  Users, Phone, Mail, MapPin, Plus, UserPlus, Send, Copy, Check, CheckCircle2
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Button, Badge, Card, TextInput, Modal, Toast,
  EmptyState, Divider, SearchInput, Avatar
} from '@/components/astryx';
import s from '../shared.module.css';

// ─── Helpers ────────────────────────────────────────────────────────────────
const randChars = (n, set) => Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join('');
const generatePassword = () => `Bavi#${Math.floor(1000 + Math.random() * 9000)}@${randChars(4, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')}`;
const generateClientCode = () => `BAVI-CLI-${Math.floor(1000 + Math.random() * 9000)}`;

const EMPTY_FORM = { full_name: '', email: '', phone: '', address: '', project_title: '', budget: '' };

export default function DesignerCustomersPage() {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', visible: false, variant: 'success' });

  // Onboard modal
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creds, setCreds] = useState({ code: '', password: '' });

  // Credentials dispatch modal
  const [credModal, setCredModal] = useState(false);
  const [dispatched, setDispatched] = useState(null);
  const [copied, setCopied] = useState(false);

  const showToast = (msg, variant = 'success') => setToast({ msg, visible: true, variant });
  const updateForm = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    setLoading(true);
    let list = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('profiles').select('*').in('role', ['customer', 'client']);
        if (data?.length) {
          list = data.map(c => ({
            ...c,
            client_code: c.metadata?.client_code || c.client_code || c.id,
            designer_approved: c.metadata?.designer_approved ?? true,
          }));
        }
      } catch (err) { console.warn('Supabase fetch error:', err); }
    }
    try {
      const local = JSON.parse(localStorage.getItem('bavi_registered_clients') || '[]');
      if (local.length) {
        const map = new Map();
        [...list, ...local].forEach(c => { if (c.email) map.set(c.email.toLowerCase(), c); });
        list = [...map.values()];
      }
    } catch {}
    setClients(list);
    setLoading(false);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setCreds({ code: generateClientCode(), password: generatePassword() });
    setAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email) { showToast('Name and email are required', 'error'); return; }
    const id = `cli-${Date.now()}`;
    const created = {
      ...form, id, user_id: id,
      client_code: creds.code, password: creds.password,
      role: 'customer', project: form.project_title || 'Architectural Commission',
      progress: 0, status: 'Active Client',
      designer_approved: true, approved_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('profiles').upsert([{
          full_name: form.full_name, email: form.email.toLowerCase().trim(),
          phone: form.phone, address: form.address, role: 'customer',
          metadata: { client_code: creds.code, designer_approved: true, approved_at: created.approved_at }
        }], { onConflict: 'email' });
      } catch (err) { console.warn('Supabase save error:', err); }
    }

    const updated = [created, ...clients];
    setClients(updated);
    try {
      localStorage.setItem('bavi_registered_clients', JSON.stringify(updated));
      const accList = JSON.parse(localStorage.getItem('bavi_registered_accounts') || '[]');
      localStorage.setItem('bavi_registered_accounts', JSON.stringify([created, ...accList]));
    } catch {}

    setAddModal(false);
    setDispatched({ to: form.email.toLowerCase().trim(), clientName: form.full_name, clientId: creds.code, password: creds.password, projectTitle: form.project_title || 'Architectural Commission', loginUrl: 'http://localhost:3000/login' });
    setCredModal(true);
    showToast(`Client "${form.full_name}" registered successfully!`);
  };

  const handleCopy = () => {
    if (!dispatched) return;
    navigator.clipboard.writeText(
      `BAVI CLIENT ACCESS\nClient: ${dispatched.clientName}\nID: ${dispatched.clientId}\nEmail: ${dispatched.to}\nPassword: ${dispatched.password}\nLogin: ${dispatched.loginUrl}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filtered = clients.filter(c =>
    [c.full_name, c.email, c.address, c.client_code, c.project].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <>
      <DesignerHeader
        title="Client Portfolio"
        subtitle="Onboard verified homeowners and commercial clients with designer-issued credentials"
      />

      <div className={s.page}>
        {/* Control Bar */}
        <div className={s.controlBar}>
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, ID, or project..." onClear={() => setSearch('')} />
          <Button variant="primary" icon={Plus} onClick={openAdd}>Onboard New Client</Button>
        </div>

        {/* Client Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--astryx-text-muted)' }}>Loading clients...</div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(client => (
              <Card key={client.id || client.email} variant="default" padding="md" hoverable>
                {/* Card Header: Avatar + Name + Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={client.full_name || client.name} size="md" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--astryx-text-primary)' }}>
                        {client.full_name || client.name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--astryx-text-muted)' }}>{client.email}</div>
                    </div>
                  </div>
                  <Badge variant="gold" dot>Approved</Badge>
                </div>

                {/* Client ID box */}
                <div className={s.credBox} style={{ marginBottom: 12 }}>
                  <div className={s.credLabel}>Client ID</div>
                  <div className={s.credValue}>{client.client_code || client.id}</div>
                </div>

                {/* Project / Address */}
                <div style={{ background: 'var(--astryx-bg-primary)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--astryx-border-subtle)', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--astryx-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}>Commission</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--astryx-text-primary)', marginTop: 4 }}>
                    {client.project || 'Architectural Commission'}
                  </div>
                  {client.address && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--astryx-text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={12} color="var(--astryx-gold)" /> {client.address}
                    </div>
                  )}
                </div>

                {/* Contact Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {client.phone && (
                    <a href={`tel:${client.phone}`}>
                      <Button size="xs" variant="secondary" icon={Phone}>{client.phone}</Button>
                    </a>
                  )}
                  {client.email && (
                    <a href={`mailto:${client.email}`}>
                      <Button size="xs" variant="ghost" icon={Mail}>Email</Button>
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
            action={<Button icon={Plus} onClick={openAdd}>Onboard New Client</Button>}
          />
        )}
      </div>

      {/* Modal: Onboard Client */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Onboard Client & Issue Credentials" size="md"
        footer={<>
          <Button variant="ghost" onClick={() => setAddModal(false)}>Cancel</Button>
          <Button variant="primary" icon={Send} type="submit" form="onboard-form">Register & Dispatch</Button>
        </>}
      >
        <form id="onboard-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Auto-generated Credentials */}
          <Divider label="Auto-Generated Credentials" />
          <div className={s.formGrid}>
            <div>
              <div className={s.credLabel} style={{ marginBottom: 6 }}>Client ID (auto)</div>
              <div className={s.credValue} style={{ padding: '10px 14px', background: 'var(--astryx-bg-primary)', border: '1px solid var(--astryx-border-gold)', borderRadius: 8 }}>
                {creds.code}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div className={s.credLabel}>Temp Password (auto)</div>
                <button type="button" onClick={() => setCreds(c => ({ ...c, password: generatePassword() }))}
                  style={{ background: 'none', border: 'none', color: 'var(--astryx-gold)', fontSize: '0.72rem', cursor: 'pointer' }}>
                  Re-roll
                </button>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--astryx-bg-primary)', border: '1px solid var(--astryx-border-subtle)', borderRadius: 8, fontFamily: 'var(--font-mono)', color: 'var(--astryx-success)', fontWeight: 700, fontSize: '0.88rem' }}>
                {creds.password}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <Divider label="Client Identity" />
          <TextInput label="Full Legal Name" required placeholder="e.g. Ramesh Kumar" value={form.full_name} onChange={e => updateForm('full_name', e.target.value)} />
          <div className={s.formGrid}>
            <TextInput label="Email" type="email" required placeholder="ramesh@gmail.com" value={form.email} onChange={e => updateForm('email', e.target.value)} />
            <TextInput label="Phone" type="tel" placeholder="+91 98450 12345" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
          </div>
          <TextInput label="Site / Billing Address" placeholder="Plot 42, Green Glen, Bengaluru" value={form.address} onChange={e => updateForm('address', e.target.value)} />

          {/* Commission */}
          <Divider label="Commission Details" />
          <div className={s.formGrid}>
            <TextInput label="Project Title" placeholder="Luxury Duplex Residence" value={form.project_title} onChange={e => updateForm('project_title', e.target.value)} />
            <TextInput label="Budget (₹)" type="number" placeholder="5000000" value={form.budget} onChange={e => updateForm('budget', e.target.value)} />
          </div>
        </form>
      </Modal>

      {/* Modal: Credentials Dispatch Preview */}
      <Modal isOpen={credModal} onClose={() => setCredModal(false)} title="✓ Credentials Dispatched" size="md"
        footer={<>
          <Button variant={copied ? 'success' : 'secondary'} icon={copied ? Check : Copy} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Credentials'}
          </Button>
          <Button variant="primary" onClick={() => setCredModal(false)}>Done</Button>
        </>}
      >
        {dispatched && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className={`${s.infoBanner} ${s.infoBannerSuccess}`}>
              <CheckCircle2 size={16} />
              Client registered. Share the credentials below with your client via WhatsApp or Email.
            </div>
            <div style={{ background: 'var(--astryx-bg-primary)', border: '1px solid var(--astryx-border-gold)', borderRadius: 10, padding: 16, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--astryx-text-primary)', lineHeight: 1.8 }}>
              <div><span style={{ color: 'var(--astryx-text-muted)' }}>Client:</span> <strong>{dispatched.clientName}</strong></div>
              <div><span style={{ color: 'var(--astryx-text-muted)' }}>Client ID:</span> <strong style={{ color: 'var(--astryx-gold)' }}>{dispatched.clientId}</strong></div>
              <div><span style={{ color: 'var(--astryx-text-muted)' }}>Login Email:</span> {dispatched.to}</div>
              <div><span style={{ color: 'var(--astryx-text-muted)' }}>Password:</span> <strong style={{ color: 'var(--astryx-success)' }}>{dispatched.password}</strong></div>
              <div><span style={{ color: 'var(--astryx-text-muted)' }}>Portal:</span> <a href={dispatched.loginUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--astryx-info)' }}>{dispatched.loginUrl}</a></div>
              <div><span style={{ color: 'var(--astryx-text-muted)' }}>Project:</span> {dispatched.projectTitle}</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--astryx-text-muted)' }}>
              The client can change their password anytime from their dashboard profile page.
            </div>
          </div>
        )}
      </Modal>

      <Toast message={toast.msg} isVisible={toast.visible} onClose={() => setToast(t => ({ ...t, visible: false }))} variant={toast.variant} />
    </>
  );
}
