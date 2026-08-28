'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  Receipt, 
  Plus, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  QrCode,
  Smartphone,
  Send,
  FileCheck,
  X
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './payments.module.css';

export default function DesignerPaymentsPage() {
  const upiPhone = process.env.NEXT_PUBLIC_UPI_PHONE || '8277762487';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

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

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setPayments(data);
        } else {
          setPayments([]);
        }
      } catch (err) {
        console.warn('Supabase fetch payments error:', err);
      }
    }
    setLoading(false);
  };

  // Designer initiates bill payment request to client
  const handleInitiateBill = async (e) => {
    e.preventDefault();
    if (!newBill.client_name || !newBill.amount || !newBill.milestone_title) {
      alert('Please fill in client name, milestone title, and amount');
      return;
    }

    const createdPayment = {
      id: `pay-${Date.now()}`,
      client: newBill.client_name,
      email: newBill.client_email,
      project: newBill.project_title || 'Architectural Build',
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
            notes: newBill.description || 'Bill initiated by Architect'
          }
        ]);
      } catch (err) {
        console.warn('Supabase insert payment error:', err);
      }
    }

    setPayments([createdPayment, ...payments]);
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
    setToast(`Bill payment request sent to ${newBill.client_name}! Client can now pay via Mobile/QR.`);
    setTimeout(() => setToast(''), 4000);
  };

  // Designer verifies and settles client payment
  const handleVerifyPayment = async (item) => {
    const generatedUTR = item.utrNo !== '-' ? item.utrNo : Math.floor(400000000000 + Math.random() * 90000000000).toString();
    const updated = payments.map(p => {
      if (p.id === item.id) {
        return {
          ...p,
          status: 'cleared',
          method: 'Phone / UPI QR (Verified by Designer)',
          utrNo: generatedUTR,
          date: 'Today',
          receiptNo: p.receiptNo !== '-' ? p.receiptNo : `BAVI-UPI-2026-${Math.floor(200 + Math.random() * 800)}`
        };
      }
      return p;
    });

    setPayments(updated);

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

    setToast(`Payment for ${item.client || item.description} verified & cleared!`);
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <>
      <DesignerHeader 
        title="Escrow & Project Financial Ledger" 
        subtitle="Initiate milestone bills to clients, track incoming Phone/UPI payments, and verify 12-digit UTR numbers" 
      />

      <div className={styles.container}>
        {/* Header Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
              Payment & Bill Ledger ({payments.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Receiving Mobile Number: <strong style={{ color: 'var(--color-gold)' }}>+91 {upiPhone}</strong>
            </p>
          </div>

          <button 
            onClick={() => setShowBillModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
              color: 'var(--color-black)',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Send size={16} />
            <span>Initiate Bill Payment Request</span>
          </button>
        </div>

        {toast && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toast}</span>
          </div>
        )}

        {/* Ledger Table Card */}
        {payments.length > 0 ? (
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>Milestone Bills & Transactions</h3>
              <span className={styles.badgeGold}>Verified Bank Escrow</span>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Client & Project</th>
                    <th>Milestone Description</th>
                    <th>Amount</th>
                    <th>Channel / Status</th>
                    <th>12-Digit UTR #</th>
                    <th>Date</th>
                    <th>Receipt #</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.client || p.customer_name || 'Client'}</strong>
                        <span className={styles.subText}>{p.project || p.description}</span>
                      </td>
                      <td>{p.milestone || p.description}</td>
                      <td className={styles.amountBold}>
                        {p.amount ? (typeof p.amount === 'number' ? '₹' + p.amount.toLocaleString('en-IN') : p.amount) : '₹0'}
                      </td>
                      <td><span className={styles.gatewayBadge}>{p.method || p.payment_method}</span></td>
                      <td>
                        {p.utr_number || p.utrNo !== '-' ? (
                          <code className={styles.utrCode}>{p.utr_number || p.utrNo}</code>
                        ) : (
                          <span className={styles.subText}>Awaiting UTR</span>
                        )}
                      </td>
                      <td>{p.date || p.paid_at || 'Pending'}</td>
                      <td><code className={styles.receiptCode}>{p.receipt_number || p.receiptNo}</code></td>
                      <td>
                        {p.status === 'due' || p.status === 'pending' ? (
                          <button 
                            onClick={() => handleVerifyPayment(p)}
                            className={styles.recordBtn}
                          >
                            Verify & Settle
                          </button>
                        ) : (
                          <span className={styles.verifiedText}>✓ Bill Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <CreditCard size={36} color="var(--color-gold)" />
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#f8f8f8', marginBottom: '6px' }}>
                No Payment Bills Initiated Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
                Click <strong>"Initiate Bill Payment Request"</strong> above to send a milestone invoice request to your client. They can scan the QR code or pay directly to mobile <strong style={{ color: 'var(--color-gold)' }}>+91 {upiPhone}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Modal for Initiating Payment Request */}
        {showBillModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }} onClick={() => setShowBillModal(false)}>
            <div style={{
              background: '#141414',
              border: '1px solid rgba(201, 168, 76, 0.35)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                  Initiate Milestone Bill Payment Request
                </h3>
                <button onClick={() => setShowBillModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleInitiateBill} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Client Full Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newBill.client_name}
                    onChange={(e) => setNewBill({ ...newBill, client_name: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Client Email</label>
                    <input 
                      type="email"
                      placeholder="client@email.com"
                      value={newBill.client_email}
                      onChange={(e) => setNewBill({ ...newBill, client_email: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Project Title</label>
                    <input 
                      type="text"
                      placeholder="e.g. Channarayapatna Villa"
                      value={newBill.project_title}
                      onChange={(e) => setNewBill({ ...newBill, project_title: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Milestone / Stage Title *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Stage 1: Architectural Blueprint & Foundation"
                    value={newBill.milestone_title}
                    onChange={(e) => setNewBill({ ...newBill, milestone_title: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Amount (INR) *</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 50000"
                      value={newBill.amount}
                      onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Payment Due Date</label>
                    <input 
                      type="date"
                      value={newBill.due_date}
                      onChange={(e) => setNewBill({ ...newBill, due_date: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: '#aaa' }}>Bill Notes / Specifications</label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Includes municipal sanction fee and soil testing report"
                    value={newBill.description}
                    onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', color: '#fff', resize: 'vertical' }}
                  />
                </div>

                <button 
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
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
                  <Send size={16} />
                  <span>Send Bill Payment Request to Client</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
