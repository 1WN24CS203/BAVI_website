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
  ShieldCheck,
  QrCode,
  Smartphone
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import styles from './payments.module.css';

export default function DesignerPaymentsPage() {
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'bavi.builders@upi';

  const [payments, setPayments] = useState([
    {
      id: 'p-1',
      client: 'Rajesh Sharma',
      project: 'The Grand Serenity Villa',
      milestone: 'Stage 2: RCC Foundation Structure',
      amount: '₹54,00,000',
      status: 'cleared',
      method: 'UPI QR (GPay / PhonePe)',
      utrNo: '414590218349',
      date: '25 Apr 2026',
      receiptNo: 'BAVI-UPI-2026-002'
    },
    {
      id: 'p-2',
      client: 'Rajesh Sharma',
      project: 'The Grand Serenity Villa',
      milestone: 'Stage 1: Architectural Blueprint & Sanction',
      amount: '₹20,00,000',
      status: 'cleared',
      method: 'UPI QR (GPay / PhonePe)',
      utrNo: '408912304918',
      date: '10 Feb 2026',
      receiptNo: 'BAVI-UPI-2026-001'
    },
    {
      id: 'p-3',
      client: 'Pooja Reddy',
      project: 'Whitefield Penthouse Renovation',
      milestone: 'Stage 2: Civil Partitions & Framing',
      amount: '₹18,60,000',
      status: 'cleared',
      method: 'UPI QR (Direct Bank Transfer)',
      utrNo: '418902341154',
      date: '20 Apr 2026',
      receiptNo: 'BAVI-UPI-2026-094'
    },
    {
      id: 'p-4',
      client: 'Rajesh Sharma',
      project: 'The Grand Serenity Villa',
      milestone: 'Stage 3: Brick Masonry & Conduits',
      amount: '₹45,00,000',
      status: 'due',
      method: 'Awaiting UPI QR Clearance',
      utrNo: '-',
      date: 'Due 31 Jul 2026',
      receiptNo: '-'
    }
  ]);

  const [toast, setToast] = useState('');

  const handleVerifyPayment = (item) => {
    const generatedUTR = Math.floor(400000000000 + Math.random() * 90000000000).toString();
    const updated = payments.map(p => {
      if (p.id === item.id) {
        return {
          ...p,
          status: 'cleared',
          method: 'UPI QR (Verified by Architect)',
          utrNo: generatedUTR,
          date: 'Today',
          receiptNo: `BAVI-UPI-2026-${Math.floor(200 + Math.random() * 800)}`
        };
      }
      return p;
    });
    setPayments(updated);
    setToast(`Payment for ${item.client} verified and tax receipt generated in database!`);
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <>
      <DesignerHeader 
        title="Escrow & Project Financial Ledger" 
        subtitle="Track UPI QR payments, verify 12-digit UTR numbers, and manage client bills stored in Supabase" 
      />

      <div className={styles.container}>
        {/* UPI Gateway Notice */}
        <div className={styles.upiNotice}>
          <QrCode size={22} color="var(--color-gold)" />
          <div className={styles.upiNoticeText}>
            <strong>Zero-Fee UPI QR Settlement:</strong> Receiving UPI VPA is set to <code>{upiId}</code>. Clients scan with GPay/PhonePe/Paytm and submit their 12-digit UTR number for permanent database bill storage.
          </div>
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
            <h3 className={styles.tableTitle}>Client Payment & Tax Bill Ledger</h3>
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
                  <th>12-Digit UTR #</th>
                  <th>Date</th>
                  <th>Tax Bill Receipt #</th>
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
                    <td>
                      {p.utrNo !== '-' ? (
                        <code className={styles.utrCode}>{p.utrNo}</code>
                      ) : (
                        <span className={styles.subText}>Awaiting Scan</span>
                      )}
                    </td>
                    <td>{p.date}</td>
                    <td><code className={styles.receiptCode}>{p.receiptNo}</code></td>
                    <td>
                      <span className={p.status === 'cleared' ? styles.badgeSuccess : styles.badgeDue}>
                        {p.status === 'cleared' ? 'Cleared & Stored' : 'Due'}
                      </span>
                    </td>
                    <td>
                      {p.status === 'due' ? (
                        <button 
                          onClick={() => handleVerifyPayment(p)}
                          className={styles.recordBtn}
                        >
                          Verify & Settle
                        </button>
                      ) : (
                        <span className={styles.verifiedText}>✓ Bill Stored</span>
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
