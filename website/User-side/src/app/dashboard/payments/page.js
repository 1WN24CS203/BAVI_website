'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Download, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Printer,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './payments.module.css';

export default function PaymentsPage() {
  const { profile } = useAuth();
  const isPooja = profile?.email?.includes('pooja');

  const [paymentMilestones, setPaymentMilestones] = useState(isPooja ? [
    {
      id: 'pay-p1',
      title: 'Stage 1: 3D Visualization & VR Moodboards',
      amount: 1240000,
      formattedAmount: '₹12,40,000',
      status: 'completed',
      receiptNo: 'BAVI-REC-2026-081',
      paidDate: '15 Mar 2026',
      method: 'Stripe Test Card (•••• 4242)'
    },
    {
      id: 'pay-p2',
      title: 'Stage 2: Civil Partitions & Electrical Framing',
      amount: 1860000,
      formattedAmount: '₹18,60,000',
      status: 'completed',
      receiptNo: 'BAVI-REC-2026-094',
      paidDate: '20 Apr 2026',
      method: 'Stripe Test Card (•••• 4242)'
    },
    {
      id: 'pay-p3',
      title: 'Stage 3: Master Walk-in Wardrobe & Veneer Paneling',
      amount: 1550000,
      formattedAmount: '₹15,50,000',
      status: 'due',
      dueDate: '10 Jun 2026',
      desc: 'Hafele custom soft-touch hardware and aged teakwood veneer fabrication.'
    },
    {
      id: 'pay-p4',
      title: 'Stage 4: Quartz Modular Kitchen & Built-in Appliances',
      amount: 1000000,
      formattedAmount: '₹10,00,000',
      status: 'pending',
      dueDate: '15 Jul 2026',
      desc: 'Seamless antibacterial quartz countertop and integrated induction hob setup.'
    },
    {
      id: 'pay-p5',
      title: 'Stage 5: Final Styling, Pendant Lights & Handover',
      amount: 550000,
      formattedAmount: '₹5,50,000',
      status: 'pending',
      dueDate: '15 Aug 2026',
      desc: 'Final architectural touch-ups, deep steam sanitization, and warranty documentation.'
    }
  ] : [
    {
      id: 'pay-1',
      title: 'Milestone 1: Architectural Blueprint & BBMP Sanction Fee',
      amount: 2000000,
      formattedAmount: '₹20,00,000',
      status: 'completed',
      receiptNo: 'BAVI-REC-2026-001',
      paidDate: '10 Feb 2026',
      method: 'Stripe Test Card (•••• 4242)'
    },
    {
      id: 'pay-2',
      title: 'Milestone 2: Plinth Beam & RCC Column Structure',
      amount: 5400000,
      formattedAmount: '₹54,00,000',
      status: 'completed',
      receiptNo: 'BAVI-REC-2026-002',
      paidDate: '25 Apr 2026',
      method: 'Stripe Test Card (•••• 4242)'
    },
    {
      id: 'pay-3',
      title: 'Milestone 3: Brick Masonry, Plumbing & Electrical Conduits',
      amount: 4500000,
      formattedAmount: '₹45,00,000',
      status: 'due',
      dueDate: '31 Jul 2026',
      desc: 'Double-coat clay brickwork, Finolex wiring lines, and Astral SDR-11 piping across 3 levels.'
    },
    {
      id: 'pay-4',
      title: 'Milestone 4: Italian Botticino Marble Flooring & False Ceiling',
      amount: 4000000,
      formattedAmount: '₹40,00,000',
      status: 'pending',
      dueDate: '30 Sep 2026',
      desc: 'Zero-joint mirror polish Italian marble laying and moisture-resistant gypsum coves.'
    },
    {
      id: 'pay-5',
      title: 'Milestone 5: Smart Automation, Terrace Pool & Final Handover',
      amount: 2600000,
      formattedAmount: '₹26,00,000',
      status: 'pending',
      dueDate: '30 Nov 2026',
      desc: 'Smart home commissioning, pool heating filtration system, and occupancy certificate handover.'
    }
  ]);

  const [payingId, setPayingId] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Handle Stripe Test Mode Payment
  const handleStripePayment = async (milestone) => {
    setPayingId(milestone.id);
    
    // Simulate Stripe Test checkout processing with live feedback
    setTimeout(() => {
      const receiptNo = `BAVI-REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const updated = paymentMilestones.map(m => {
        if (m.id === milestone.id) {
          return {
            ...m,
            status: 'completed',
            paidDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            receiptNo,
            method: 'Stripe Test Card (•••• 4242)'
          };
        }
        return m;
      });

      setPaymentMilestones(updated);
      setPayingId(null);
      setPaymentSuccess(milestone.title);

      setTimeout(() => setPaymentSuccess(null), 4000);
    }, 1500);
  };

  const totalContract = paymentMilestones.reduce((acc, m) => acc + m.amount, 0);
  const totalPaid = paymentMilestones.filter(m => m.status === 'completed').reduce((acc, m) => acc + m.amount, 0);
  const totalRemaining = totalContract - totalPaid;

  const formatCurrency = (val) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  return (
    <div className={styles.container}>
      {/* Stripe Test Mode Banner */}
      <div className={styles.stripeAlert}>
        <Sparkles size={18} color="var(--color-gold)" />
        <div className={styles.stripeAlertText}>
          <strong>Stripe Test Mode Enabled:</strong> Safe sandbox environment active. Use test card <code>4242 •••• •••• 4242</code>. No PAN submission required.
        </div>
      </div>

      {paymentSuccess && (
        <div className={styles.successToast}>
          <CheckCircle2 size={20} color="var(--color-success)" />
          <span>Payment for <strong>{paymentSuccess}</strong> confirmed via Stripe Test Sandbox!</span>
        </div>
      )}

      {/* Financial Overview Summary */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Contract Value</span>
          <span className={styles.summaryValue}>{formatCurrency(totalContract)}</span>
          <span className={styles.summarySub}>Fixed Guaranteed Price Agreement</span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Paid to Date</span>
          <span className={styles.summaryValueGold}>{formatCurrency(totalPaid)}</span>
          <span className={styles.summarySub}>
            {Math.round((totalPaid / totalContract) * 100)}% of total project value cleared
          </span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Remaining Milestone Balance</span>
          <span className={styles.summaryValue}>{formatCurrency(totalRemaining)}</span>
          <span className={styles.summarySub}>Payable as per stage completion</span>
        </div>
      </div>

      {/* Milestones Payment Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Project Payment Milestones</h3>
          <span className={styles.badgeGold}>Verified Escrow Billing</span>
        </div>

        <div className={styles.milestonesList}>
          {paymentMilestones.map((m, idx) => (
            <div 
              key={m.id} 
              className={`${styles.milestoneItem} ${m.status === 'completed' ? styles.milestonePaid : m.status === 'due' ? styles.milestoneDue : ''}`}
            >
              <div className={styles.milestoneMain}>
                <div className={styles.milestoneTop}>
                  <span className={styles.milestoneIndex}>Stage 0{idx + 1}</span>
                  <span className={`
                    ${styles.statusBadge}
                    ${m.status === 'completed' ? styles.statusPaidBadge :
                      m.status === 'due' ? styles.statusDueBadge : styles.statusPendingBadge}
                  `}>
                    {m.status === 'completed' ? 'Cleared & Receipt Issued' :
                     m.status === 'due' ? 'Payment Due' : 'Upcoming Milestone'}
                  </span>
                </div>

                <h4 className={styles.milestoneTitle}>{m.title}</h4>
                {m.desc && <p className={styles.milestoneDesc}>{m.desc}</p>}

                <div className={styles.milestoneMeta}>
                  {m.status === 'completed' ? (
                    <>
                      <span>Cleared on: <strong>{m.paidDate}</strong></span>
                      <span>•</span>
                      <span>Receipt: <strong>{m.receiptNo}</strong></span>
                      <span>•</span>
                      <span>Method: <strong>{m.method}</strong></span>
                    </>
                  ) : (
                    <span>Due Date: <strong>{m.dueDate}</strong></span>
                  )}
                </div>
              </div>

              <div className={styles.milestoneAction}>
                <span className={styles.amountDisplay}>{m.formattedAmount}</span>

                {m.status === 'completed' ? (
                  <button 
                    onClick={() => setSelectedReceipt(m)}
                    className={styles.viewReceiptBtn}
                  >
                    <Receipt size={16} />
                    <span>View Receipt</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStripePayment(m)}
                    disabled={payingId === m.id}
                    className={styles.payBtn}
                  >
                    {payingId === m.id ? (
                      <span>Processing Stripe...</span>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Pay with Stripe (Test)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className={styles.modalOverlay} onClick={() => setSelectedReceipt(null)}>
          <div className={styles.receiptModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.receiptHeader}>
              <div className={styles.receiptBrand}>
                <img src="/logo.png" alt="BAVI" className={styles.receiptLogo} />
                <div>
                  <h3 className={styles.receiptBrandName}>BAVI</h3>
                  <p className={styles.receiptBrandSub}>Bahubali Builders & Visionary Interiors</p>
                </div>
              </div>
              <div className={styles.receiptMetaTop}>
                <span className={styles.receiptTitle}>OFFICIAL RECEIPT</span>
                <span className={styles.receiptNumber}>{selectedReceipt.receiptNo}</span>
              </div>
            </div>

            <div className={styles.receiptDivider} />

            <div className={styles.receiptClientRow}>
              <div>
                <span className={styles.receiptMuted}>Billed To:</span>
                <strong className={styles.clientName}>{profile?.full_name || 'Valued Client'}</strong>
                <p className={styles.clientAddress}>{profile?.address || 'Indiranagar, Bengaluru, Karnataka'}</p>
              </div>
              <div className={styles.receiptRightText}>
                <span className={styles.receiptMuted}>Payment Date:</span>
                <strong>{selectedReceipt.paidDate}</strong>
                <span className={styles.receiptMuted}>Payment Channel:</span>
                <strong>Stripe Test Sandbox</strong>
              </div>
            </div>

            <div className={styles.receiptTable}>
              <div className={styles.receiptTableHeader}>
                <span>Milestone Description</span>
                <span className={styles.textRight}>Amount</span>
              </div>
              <div className={styles.receiptTableRow}>
                <div>
                  <strong>{selectedReceipt.title}</strong>
                  <p className={styles.receiptSubtext}>Construction & Architectural Milestone Payment</p>
                </div>
                <span className={styles.receiptAmountBold}>{selectedReceipt.formattedAmount}</span>
              </div>
            </div>

            <div className={styles.receiptTotalRow}>
              <div className={styles.stampBadge}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>PAID & VERIFIED</span>
              </div>
              <div className={styles.totalBox}>
                <span className={styles.totalLabel}>Total Paid (INR):</span>
                <span className={styles.totalNumber}>{selectedReceipt.formattedAmount}</span>
              </div>
            </div>

            <div className={styles.receiptFooter}>
              <p>Thank you for choosing BAVI. For billing questions, reach us at accounts@bavi.in</p>
              <div className={styles.receiptActions}>
                <button onClick={() => window.print()} className={styles.printBtn}>
                  <Printer size={15} />
                  <span>Print Receipt</span>
                </button>
                <button onClick={() => setSelectedReceipt(null)} className={styles.closeReceiptBtn}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
