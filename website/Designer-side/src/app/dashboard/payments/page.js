'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  Receipt, 
  Plus, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import styles from './payments.module.css';

export default function DesignerPaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: 'p-1',
      client: 'Rajesh Sharma',
      project: 'The Grand Serenity Villa',
      milestone: 'Stage 2: RCC Foundation Structure',
      amount: '₹54,00,000',
      status: 'cleared',
      method: 'Stripe Sandbox (•••• 4242)',
      date: '25 Apr 2026',
      receiptNo: 'BAVI-REC-2026-002'
    },
    {
      id: 'p-2',
      client: 'Rajesh Sharma',
      project: 'The Grand Serenity Villa',
      milestone: 'Stage 1: Architectural Blueprint & Sanction',
      amount: '₹20,00,000',
      status: 'cleared',
      method: 'Stripe Sandbox (•••• 4242)',
      date: '10 Feb 2026',
      receiptNo: 'BAVI-REC-2026-001'
    },
    {
      id: 'p-3',
      client: 'Pooja Reddy',
      project: 'Whitefield Penthouse Renovation',
      milestone: 'Stage 2: Civil Partitions & Framing',
      amount: '₹18,60,000',
      status: 'cleared',
      method: 'Stripe Sandbox (•••• 4242)',
      date: '20 Apr 2026',
      receiptNo: 'BAVI-REC-2026-094'
    },
    {
      id: 'p-4',
      client: 'Rajesh Sharma',
      project: 'The Grand Serenity Villa',
      milestone: 'Stage 3: Brick Masonry & Conduits',
      amount: '₹45,00,000',
      status: 'due',
      method: 'Stripe Test Mode Pending',
      date: 'Due 31 Jul 2026',
      receiptNo: '-'
    }
  ]);

  const [toast, setToast] = useState('');

  const handleRecordOffline = (item) => {
    const updated = payments.map(p => {
      if (p.id === item.id) {
        return {
          ...p,
          status: 'cleared',
          method: 'Manual Bank RTGS Verified',
          date: 'Today',
          receiptNo: `BAVI-REC-2026-${Math.floor(200 + Math.random() * 800)}`
        };
      }
      return p;
    });
    setPayments(updated);
    setToast(`Payment for ${item.client} manually recorded as Cleared & Verified!`);
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <>
      <DesignerHeader 
        title="Escrow & Project Financial Ledger" 
        subtitle="Track Stripe milestone clearances, verified bank transfers, and client receipts" 
      />

      <div className={styles.container}>
        {/* Stripe Test Mode Notice */}
        <div className={styles.stripeNotice}>
          <Sparkles size={18} color="var(--color-gold)" />
          <span><strong>Stripe Test Mode Gateway:</strong> Client payments process seamlessly through the instant test card sandbox without requiring PAN verification.</span>
        </div>

        {toast && (
          <div className={styles.toast}>
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toast}</span>
          </div>
        )}

        {/* Ledger Table Card */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Client Payment Ledger</h3>
            <span className={styles.badgeGold}>Verified Real-Time Escrow</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Client & Project</th>
                  <th>Milestone Description</th>
                  <th>Amount</th>
                  <th>Channel / Gateway</th>
                  <th>Date</th>
                  <th>Receipt #</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.client}</strong>
                      <span className={styles.subText}>{p.project}</span>
                    </td>
                    <td>{p.milestone}</td>
                    <td className={styles.amountBold}>{p.amount}</td>
                    <td><span className={styles.gatewayBadge}>{p.method}</span></td>
                    <td>{p.date}</td>
                    <td><code className={styles.receiptCode}>{p.receiptNo}</code></td>
                    <td>
                      <span className={p.status === 'cleared' ? styles.badgeSuccess : styles.badgeDue}>
                        {p.status === 'cleared' ? 'Cleared' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {p.status === 'due' ? (
                        <button 
                          onClick={() => handleRecordOffline(p)}
                          className={styles.recordBtn}
                        >
                          Mark Paid (RTGS)
                        </button>
                      ) : (
                        <span className={styles.verifiedText}>Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
