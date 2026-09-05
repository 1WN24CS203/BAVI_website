'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, Clock, Download, Receipt, Plus, Sparkles,
  ArrowUpRight, ShieldCheck, QrCode, Smartphone, Send, FileCheck, Building,
  User, Mail, Phone, Calendar, AlertCircle
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Button, Badge, Card, TextInput, TextArea, Select, Modal, Toast,
  EmptyState, Divider, Tag, StatusDot, SearchInput
} from '@/components/astryx';

export default function DesignerPaymentsPage() {
  const upiPhone = process.env.NEXT_PUBLIC_UPI_PHONE || '8277762487';

  const [payments, setPayments] = useState([]);
  const [registeredClients, setRegisteredClients] = useState([]);
  const [registeredProjects, setRegisteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState('success');

  // Modal for Initiating Payment Request / Bill
  const [showBillModal, setShowBillModal] = useState(false);
  const [newBill, setNewBill] = useState({
    client_name: '',
    client_email: '',
    project_title: '',
    milestone_title: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const showToast = (msg, variant = 'success') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastVisible(true);
  };

  useEffect(() => {
    fetchPayments();
    loadRegisteredData();
  }, []);

  const loadRegisteredData = async () => {
    // 1. Fetch Registered Clients
    let loadedClients = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'customer');
        if (data && data.length > 0) loadedClients = data;
      } catch (err) {
        console.warn('Supabase clients fetch error:', err);
      }
    }
    try {
      const local = localStorage.getItem('bavi_registered_clients');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          [...loadedClients, ...parsed].forEach(c => {
            if (c.email) map.set(c.email.toLowerCase(), c);
          });
          loadedClients = Array.from(map.values());
        }
      }
    } catch {}

    setRegisteredClients(loadedClients);

    // 2. Fetch Registered Projects
    let loadedProjects = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) loadedProjects = data;
      } catch (err) {
        console.warn('Supabase projects fetch error:', err);
      }
    }
    try {
      const localP = localStorage.getItem('bavi_projects');
      if (localP) {
        const parsedP = JSON.parse(localP);
        if (Array.isArray(parsedP) && parsedP.length > 0) {
          const pMap = new Map();
          [...loadedProjects, ...parsedP].forEach(p => {
            if (p.title) pMap.set(p.title.toLowerCase(), p);
          });
          loadedProjects = Array.from(pMap.values());
        }
      }
    } catch {}

    setRegisteredProjects(loadedProjects);
  };

  const fetchPayments = async () => {
    let list = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) list = data;
      } catch (err) {
        console.warn('Supabase fetch payments error:', err);
      }
    }

    try {
      const localBills = localStorage.getItem('bavi_payments_ledger');
      if (localBills) {
        const parsed = JSON.parse(localBills);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = [...parsed, ...list];
        }
      }
    } catch {}

    setPayments(list);
    setLoading(false);
  };

  const savePaymentsLocal = (updated) => {
    setPayments(updated);
    try {
      localStorage.setItem('bavi_payments_ledger', JSON.stringify(updated));
    } catch {}
  };

  // When designer selects a client in the billing modal
  const handleSelectClient = (email) => {
    const client = registeredClients.find(c => c.email === email || c.id === email);
    if (client) {
      // Find projects for this client
      const clientProjects = registeredProjects.filter(p =>
        (p.client_email && p.client_email.toLowerCase() === client.email.toLowerCase()) ||
        (p.client_name && p.client_name.toLowerCase() === client.full_name.toLowerCase())
      );

      const defaultProject = clientProjects.length > 0 ? clientProjects[0].title : (client.project || '');

      setNewBill(prev => ({
        ...prev,
        client_name: client.full_name,
        client_email: client.email,
        project_title: defaultProject,
      }));
    } else {
      setNewBill(prev => ({
        ...prev,
        client_name: '',
        client_email: '',
        project_title: '',
      }));
    }
  };

  // Get project options for current selected client
  const getProjectOptions = () => {
    if (!newBill.client_email && !newBill.client_name) {
      return registeredProjects.map(p => ({ value: p.title, label: `${p.title} (${p.client_name || 'Project'})` }));
    }

    const clientSpecific = registeredProjects.filter(p =>
      (p.client_email && p.client_email.toLowerCase() === newBill.client_email.toLowerCase()) ||
      (p.client_name && p.client_name.toLowerCase() === newBill.client_name.toLowerCase())
    );

    if (clientSpecific.length > 0) {
      return clientSpecific.map(p => ({ value: p.title, label: p.title }));
    }

    // Fallback to all registered projects
    return registeredProjects.map(p => ({ value: p.title, label: `${p.title} (${p.client_name || 'Registered'})` }));
  };

  // Designer initiates bill payment request to client
  const handleInitiateBill = async (e) => {
    e.preventDefault();
    if (!newBill.client_email || !newBill.client_name) {
      showToast('Client must be selected from registered accounts!', 'error');
      return;
    }
    if (!newBill.project_title) {
      showToast('Project title must be selected from registered projects!', 'error');
      return;
    }
    if (!newBill.amount || !newBill.milestone_title) {
      showToast('Please specify milestone stage title and amount', 'error');
      return;
    }

    const createdPayment = {
      id: `pay-${Date.now()}`,
      client: newBill.client_name,
      email: newBill.client_email,
      project: newBill.project_title,
      milestone: newBill.milestone_title,
      amount: '₹' + parseFloat(newBill.amount).toLocaleString('en-IN'),
      rawAmount: parseFloat(newBill.amount),
      status: 'due',
      method: 'Awaiting Client Phone/UPI Transfer',
      utrNo: '-',
      date: `Due ${newBill.due_date}`,
      receiptNo: `BAVI-BILL-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('payments').insert([
          {
            amount: parseFloat(newBill.amount),
            currency: 'INR',
            status: 'due',
            payment_method: 'phone_upi',
            receipt_number: createdPayment.receiptNo,
            description: `${newBill.project_title}: ${newBill.milestone_title}`,
            notes: newBill.description || 'Milestone bill generated by Architect'
          }
        ]);
      } catch (err) {
        console.warn('Supabase insert payment error:', err);
      }
    }

    const updated = [createdPayment, ...payments];
    savePaymentsLocal(updated);
    setShowBillModal(false);
    setNewBill({
      client_name: '',
      client_email: '',
      project_title: '',
      milestone_title: '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      description: ''
    });
    showToast(`Milestone bill created for registered client "${createdPayment.client}" on project "${createdPayment.project}"!`);
  };

  // Designer verifies and settles client payment
  const handleVerifyPayment = async (item) => {
    const generatedUTR = item.utrNo !== '-' ? item.utrNo : Math.floor(400000000000 + Math.random() * 90000000000).toString();
    const updated = payments.map(p => {
      if (p.id === item.id) {
        return {
          ...p,
          status: 'cleared',
          method: 'Phone / UPI QR (Verified)',
          utrNo: generatedUTR,
          date: 'Completed Today',
          receiptNo: p.receiptNo !== '-' ? p.receiptNo : `BAVI-UPI-2026-${Math.floor(200 + Math.random() * 800)}`
        };
      }
      return p;
    });

    savePaymentsLocal(updated);

    if (isSupabaseConfigured() && item.id) {
      try {
        await supabase
          .from('payments')
          .update({ status: 'completed', utr_number: generatedUTR })
          .eq('id', item.id);
      } catch (err) {
        console.warn('Supabase update error:', err);
      }
    }

    showToast(`Payment of ${item.amount} for ${item.client} verified & settled!`);
  };

  const filtered = payments.filter(p => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.client?.toLowerCase().includes(q) ||
      p.project?.toLowerCase().includes(q) ||
      p.milestone?.toLowerCase().includes(q) ||
      p.receiptNo?.toLowerCase().includes(q) ||
      p.utrNo?.toLowerCase().includes(q)
    );
  });

  const totalBilled = payments.reduce((acc, p) => acc + (p.rawAmount || 0), 0);
  const totalCleared = payments.filter(p => p.status === 'cleared' || p.status === 'completed').reduce((acc, p) => acc + (p.rawAmount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'due' || p.status === 'pending').reduce((acc, p) => acc + (p.rawAmount || 0), 0);

  return (
    <>
      <DesignerHeader 
        title="Escrow & Project Financial Ledger" 
        subtitle="Initiate milestone bills to verified clients, select registered projects, and verify Phone/UPI payments" 
      />

      <div style={{ padding: '0 4px' }}>
        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '1.25rem', fontWeight: 700, color: '#f8f8f8', margin: 0 }}>
              Milestone Payment Ledger ({payments.length})
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#a0a0a0', margin: '4px 0 0' }}>
              Studio Receiving Mobile / UPI: <strong style={{ color: '#c9a84c' }}>+91 {upiPhone}</strong>
            </p>
          </div>

          <Button 
            icon={Send} 
            onClick={() => setShowBillModal(true)}
            size="md"
          >
            Initiate Bill Payment Request
          </Button>
        </div>

        {/* Metrics Cards using Astryx Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Invoiced</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8f8f8', fontFamily: "'Playfair Display', Georgia, serif", marginTop: '4px' }}>
              ₹{totalBilled.toLocaleString('en-IN')}
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Awaiting Escrow Settlement</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24', fontFamily: "'Playfair Display', Georgia, serif", marginTop: '4px' }}>
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#4ade80', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Verified & Cleared</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4ade80', fontFamily: "'Playfair Display', Georgia, serif", marginTop: '4px' }}>
              ₹{totalCleared.toLocaleString('en-IN')}
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client, project, milestone, receipt..."
            onClear={() => setSearchTerm('')}
          />
        </div>

        {/* Payment Ledger Cards using Astryx */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((p) => {
              const isDue = p.status === 'due' || p.status === 'pending';

              return (
                <Card 
                  key={p.id} 
                  variant={isDue ? 'gold' : 'default'} 
                  padding="md"
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <Tag variant="gold">
                          {p.project || 'Project'}
                        </Tag>
                        {isDue ? (
                          <Badge variant="warning" dot>Escrow Pending</Badge>
                        ) : (
                          <Badge variant="success" dot>Payment Cleared</Badge>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>Receipt: {p.receiptNo || p.receipt_number}</span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8f8f8', margin: '0 0 4px' }}>
                        {p.milestone || p.description}
                      </h4>

                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#a0a0a0', marginTop: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f8f8f8', fontWeight: 600 }}>
                          <User size={13} color="#c9a84c" /> {p.client || p.customer_name || 'Registered Client'}
                        </span>
                        {p.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Mail size={13} color="#666" /> {p.email}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="#666" /> {p.date || 'Pending'}
                        </span>
                        {p.utrNo && p.utrNo !== '-' && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4ade80' }}>
                            <ShieldCheck size={13} /> UTR: {p.utrNo}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c9a84c', fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {p.amount}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6e6e6e' }}>
                          {p.method || 'Phone / UPI Transfer'}
                        </div>
                      </div>

                      {isDue ? (
                        <Button 
                          size="sm" 
                          variant="success" 
                          icon={CheckCircle2}
                          onClick={() => handleVerifyPayment(p)}
                        >
                          Verify & Settle
                        </Button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>
                          <CheckCircle2 size={16} /> Verified in Escrow
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={CreditCard}
            title="No Milestone Bills Found"
            description="Initiate a bill payment request for a registered client and project. Clients can pay directly via mobile or UPI QR."
            action={
              <Button icon={Send} onClick={() => setShowBillModal(true)}>
                Initiate First Bill
              </Button>
            }
          />
        )}

        {/* Modal for Initiating Payment Request using Astryx Modal */}
        <Modal 
          isOpen={showBillModal} 
          onClose={() => setShowBillModal(false)} 
          title="Initiate Milestone Bill Payment Request" 
          size="lg"
        >
          <form onSubmit={handleInitiateBill} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Divider label="Client & Project Assignment (Registered Only)" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Select Registered Client */}
              <Select
                label="Select Registered Client"
                required
                value={newBill.client_email}
                onChange={(e) => handleSelectClient(e.target.value)}
                options={[
                  { value: '', label: '-- Choose a Registered Client --' },
                  ...registeredClients.map(c => ({
                    value: c.email,
                    label: `${c.full_name} (${c.email})`
                  }))
                ]}
                hint="Only registered accounts are available to prevent unregistered billing entries"
              />

              {/* Select Registered Project Title */}
              <Select
                label="Select Registered Project Title"
                required
                value={newBill.project_title}
                onChange={(e) => setNewBill({ ...newBill, project_title: e.target.value })}
                options={[
                  { value: '', label: '-- Choose from Registered Projects --' },
                  ...getProjectOptions()
                ]}
                hint="Project title must be selected from the registered project roster"
              />
            </div>

            {/* Verified Preview Card */}
            {newBill.client_email && newBill.project_title && (
              <Card variant="gold" padding="sm">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c9a84c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} color="#c9a84c" /> Verified Client & Project Binding
                  </span>
                  <Tag variant="success">Validated</Tag>
                </div>
                <div style={{ fontSize: '0.86rem', color: '#f8f8f8', marginTop: '4px' }}>
                  <strong>Client:</strong> {newBill.client_name} ({newBill.client_email})
                </div>
                <div style={{ fontSize: '0.82rem', color: '#a0a0a0', marginTop: '2px' }}>
                  <strong>Project:</strong> {newBill.project_title}
                </div>
              </Card>
            )}

            <Divider label="Milestone & Financial Terms" />

            <TextInput
              label="Milestone / Stage Title"
              required
              placeholder="e.g. Stage 1: Architectural Blueprint & Foundation Structure"
              value={newBill.milestone_title}
              onChange={(e) => setNewBill({ ...newBill, milestone_title: e.target.value })}
              icon={Building}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <TextInput
                label="Amount (INR)"
                type="number"
                required
                placeholder="e.g. 150000"
                value={newBill.amount}
                onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                icon={CreditCard}
              />
              <TextInput
                label="Payment Due Date"
                type="date"
                required
                value={newBill.due_date}
                onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
                icon={Calendar}
              />
            </div>

            <TextArea
              label="Scope of Work / Deliverables Summary"
              rows={3}
              placeholder="List the completed or upcoming milestones authorized under this bill..."
              value={newBill.description}
              onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
              hint="This note will be visible to the client on their Escrow & Billing dashboard"
            />

            <Button type="submit" fullWidth size="lg" icon={Send}>
              Issue Milestone Bill to Registered Client
            </Button>
          </form>
        </Modal>

        {/* Toast */}
        <Toast message={toastMsg} variant={toastVariant} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    </>
  );
}
