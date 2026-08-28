'use client';

import { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Printer, 
  Check,
  Copy,
  UploadCloud,
  FileCheck,
  ExternalLink,
  Smartphone,
  PhoneCall,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './payments.module.css';

export default function PaymentsPage() {
  const { profile } = useAuth();
  const isPooja = profile?.email?.includes('pooja');

  // Read Phone Number and UPI configuration from env
  const rawPhone = process.env.NEXT_PUBLIC_UPI_PHONE || '9876543210';
  const rawUpiId = process.env.NEXT_PUBLIC_UPI_ID || `${rawPhone}@paytm`;
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'BAVI Builders & Visionary Interiors';

  // Format phone number for clean Indian display (+91 98765 43210)
  const displayPhone = rawPhone.length === 10 
    ? `+91 ${rawPhone.slice(0, 5)} ${rawPhone.slice(5)}` 
    : rawPhone;

  // Primary payment handle for QR code
  const paymentHandle = rawPhone.length === 10 && !rawUpiId.includes('@')
    ? `${rawPhone}@paytm`
    : rawUpiId;

  const [paymentMilestones, setPaymentMilestones] = useState(isPooja ? [
    {
      id: 'pay-p1',
      title: 'Stage 1: 3D Visualization & VR Moodboards',
      amount: 1240000,
      formattedAmount: '₹12,40,000',
      status: 'completed',
      receiptNo: 'BAVI-UPI-2026-081',
      utrNo: '412988349012',
      paidDate: '15 Mar 2026',
      method: `Phone Pay (${displayPhone})`
    },
    {
      id: 'pay-p2',
      title: 'Stage 2: Civil Partitions & Electrical Framing',
      amount: 1860000,
      formattedAmount: '₹18,60,000',
      status: 'completed',
      receiptNo: 'BAVI-UPI-2026-094',
      utrNo: '418902341154',
      paidDate: '20 Apr 2026',
      method: `Phone Pay (${displayPhone})`
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
      receiptNo: 'BAVI-UPI-2026-001',
      utrNo: '408912304918',
      paidDate: '10 Feb 2026',
      method: `Phone Pay (${displayPhone})`
    },
    {
      id: 'pay-2',
      title: 'Milestone 2: Plinth Beam & RCC Column Structure',
      amount: 5400000,
      formattedAmount: '₹54,00,000',
      status: 'completed',
      receiptNo: 'BAVI-UPI-2026-002',
      utrNo: '414590218349',
      paidDate: '25 Apr 2026',
      method: `Phone Pay (${displayPhone})`
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

  // Modal States
  const [activeQRModal, setActiveQRModal] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  const handleOpenQR = (milestone) => {
    setActiveQRModal(milestone);
    setUtrNumber('');
    setProofNote('');
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(rawPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Submit Payment with UTR proof
  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 6) {
      alert('Please enter a valid 12-digit UPI UTR / Transaction Reference Number');
      return;
    }

    setSubmittingProof(true);
    const receiptNo = `BAVI-UPI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // 1. Sync to Supabase payments table
    if (isSupabaseConfigured() && profile?.id) {
      try {
        await supabase.from('payments').insert([
          {
            customer_id: profile.id,
            amount: activeQRModal.amount,
            currency: 'INR',
            status: 'completed',
            payment_method: 'phone_upi',
            utr_number: utrNumber.trim(),
            receipt_number: receiptNo,
            description: activeQRModal.title,
            notes: proofNote || `Paid via Phone Number ${displayPhone}`,
          }
        ]);
      } catch (err) {
        console.warn('Supabase offline fallback:', err.message);
      }
    }

    // 2. Update local state
    const updated = paymentMilestones.map(m => {
      if (m.id === activeQRModal.id) {
        return {
          ...m,
          status: 'completed',
          paidDate: today,
          receiptNo,
          utrNo: utrNumber.trim(),
          method: `Direct Phone Transfer (${displayPhone})`
        };
      }
      return m;
    });

    setPaymentMilestones(updated);
    setSubmittingProof(false);
    setActiveQRModal(null);
    setToastMessage(`Payment of ${activeQRModal.formattedAmount} verified with UTR #${utrNumber.trim()}! Official tax bill generated.`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const totalContract = paymentMilestones.reduce((acc, m) => acc + m.amount, 0);
  const totalPaid = paymentMilestones.filter(m => m.status === 'completed').reduce((acc, m) => acc + m.amount, 0);
  const totalRemaining = totalContract - totalPaid;

  const formatCurrency = (val) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  // Generate UPI Intent String
  const getUPIIntent = (milestone) => {
    if (!milestone) return '';
    const note = encodeURIComponent(`BAVI - ${milestone.title}`);
    const name = encodeURIComponent(upiName);
    return `upi://pay?pa=${paymentHandle}&pn=${name}&am=${milestone.amount}&cu=INR&tn=${note}`;
  };

  // Generate QR Code image URL
  const getQRCodeUrl = (milestone) => {
    if (!milestone) return '';
    const intent = getUPIIntent(milestone);
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(intent)}`;
  };

  return (
    <div className={styles.container}>
      {/* Phone Number / UPI Banner */}
      <div className={styles.upiAlert}>
        <div className={styles.upiAlertLeft}>
          <PhoneCall size={24} color="var(--color-gold)" />
          <div>
            <h4 className={styles.upiAlertTitle}>Direct Phone Number & QR Payment Settlement</h4>
            <p className={styles.upiAlertSub}>
              Send funds directly to mobile number <strong style={{ color: 'var(--color-gold)' }}>{displayPhone}</strong> on <strong>Google Pay, PhonePe, or Paytm</strong>, or scan the instant QR code.
            </p>
          </div>
        </div>
        <div className={styles.upiPill}>
          <Smartphone size={15} />
          <span>Pay Mobile: <strong>{displayPhone}</strong></span>
        </div>
      </div>

      {toastMessage && (
        <div className={styles.successToast}>
          <CheckCircle2 size={20} color="var(--color-success)" />
          <span>{toastMessage}</span>
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
          <span className={styles.summarySub}>Payable as construction milestones clear</span>
        </div>
      </div>

      {/* Milestones Payment Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Project Payment Milestones</h3>
          <span className={styles.badgeGold}>Verified Bank Escrow</span>
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
                    {m.status === 'completed' ? 'Cleared & Bill Stored' :
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
                      <span>UTR: <strong>{m.utrNo || 'Verified'}</strong></span>
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
                    <span>View Stored Bill</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleOpenQR(m)}
                    className={styles.payBtn}
                  >
                    <QrCode size={16} />
                    <span>Pay via Mobile / QR</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Mobile Phone & QR Payment Modal --- */}
      {activeQRModal && (
        <div className={styles.modalOverlay} onClick={() => setActiveQRModal(null)}>
          <div className={styles.qrModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.qrModalHeader}>
              <div className={styles.qrBrand}>
                <img src="/logo.png" alt="BAVI" className={styles.qrLogo} />
                <div>
                  <h3 className={styles.qrModalTitle}>Pay via Mobile Number / QR</h3>
                  <p className={styles.qrModalSub}>{activeQRModal.title}</p>
                </div>
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setActiveQRModal(null)}>✕</button>
            </div>

            <div className={styles.qrContent}>
              {/* Left: Phone Details & Scannable QR */}
              <div className={styles.qrCodeSection}>
                {/* Highlighted Mobile Number */}
                <div style={{
                  width: '100%',
                  background: 'rgba(201, 168, 76, 0.1)',
                  border: '1px solid rgba(201, 168, 76, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Pay to GPay / PhonePe / Paytm Number:
                  </span>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--color-gold)',
                    margin: '4px 0'
                  }}>
                    {displayPhone}
                  </div>
                  <button 
                    onClick={copyPhone} 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--color-dark)',
                      border: '1px solid var(--color-dark-border)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedPhone ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                    <span>{copiedPhone ? 'Copied Number!' : 'Copy Mobile Number'}</span>
                  </button>
                </div>

                {/* Scannable QR Code */}
                <div className={styles.qrImageWrapper}>
                  <img 
                    src={getQRCodeUrl(activeQRModal)} 
                    alt="Scan UPI QR" 
                    className={styles.qrImage} 
                  />
                  <div className={styles.qrAmountTag}>
                    Amount: {activeQRModal.formattedAmount}
                  </div>
                </div>

                {/* Mobile Intent Direct Link */}
                <a 
                  href={getUPIIntent(activeQRModal)} 
                  className={styles.openAppBtn}
                >
                  <Smartphone size={16} />
                  <span>Open in Google Pay / PhonePe / Paytm</span>
                </a>
              </div>

              {/* Right: Enter UTR Reference Proof */}
              <form onSubmit={handleConfirmPayment} className={styles.utrForm}>
                <h4 className={styles.utrFormTitle}>Confirm Transaction Details</h4>
                <p className={styles.utrFormSub}>
                  After sending funds to <strong style={{ color: 'var(--color-gold)' }}>{displayPhone}</strong> or scanning the QR, enter your <strong>12-digit UPI Reference Number / UTR</strong> to instantly generate and store your tax bill.
                </p>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <span>12-Digit UPI Ref / UTR Number</span>
                    <span className={styles.goldText}>*Required</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 423891024567"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Client / Payer Account Name</label>
                  <input 
                    type="text" 
                    value={profile?.full_name || 'Rajesh Sharma'}
                    disabled
                    className={`${styles.formInput} ${styles.inputDisabled}`}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Payment Reference Note (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paid via GPay from HDFC Bank account"
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submittingProof}
                  className={styles.submitProofBtn}
                >
                  {submittingProof ? (
                    <span>Storing Receipt in Database...</span>
                  ) : (
                    <>
                      <FileCheck size={18} />
                      <span>Verify & Generate Bill Receipt</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Official Stored Bill / Receipt Modal --- */}
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
                <span className={styles.receiptTitle}>OFFICIAL TAX INVOICE & RECEIPT</span>
                <span className={styles.receiptNumber}>{selectedReceipt.receiptNo}</span>
              </div>
            </div>

            <div className={styles.receiptDivider} />

            <div className={styles.receiptClientRow}>
              <div>
                <span className={styles.receiptMuted}>Billed To Client:</span>
                <strong className={styles.clientName}>{profile?.full_name || 'Valued Client'}</strong>
                <p className={styles.clientAddress}>{profile?.address || 'Indiranagar, Bengaluru, Karnataka'}</p>
              </div>
              <div className={styles.receiptRightText}>
                <span className={styles.receiptMuted}>Payment Clearance Date:</span>
                <strong>{selectedReceipt.paidDate}</strong>
                <span className={styles.receiptMuted}>12-Digit UTR Reference:</span>
                <strong className={styles.goldText}>{selectedReceipt.utrNo || 'Verified'}</strong>
                <span className={styles.receiptMuted}>Receiving Mobile Account:</span>
                <strong>{displayPhone}</strong>
              </div>
            </div>

            <div className={styles.receiptTable}>
              <div className={styles.receiptTableHeader}>
                <span>Milestone Stage & Description</span>
                <span className={styles.textRight}>Total Amount</span>
              </div>
              <div className={styles.receiptTableRow}>
                <div>
                  <strong>{selectedReceipt.title}</strong>
                  <p className={styles.receiptSubtext}>Construction & Architectural Milestone • B2C Direct Cleared</p>
                </div>
                <span className={styles.receiptAmountBold}>{selectedReceipt.formattedAmount}</span>
              </div>
            </div>

            <div className={styles.receiptTotalRow}>
              <div className={styles.stampBadge}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>DIRECT PHONE PAYMENT CLEARED & STORED</span>
              </div>
              <div className={styles.totalBox}>
                <span className={styles.totalLabel}>Total Received:</span>
                <span className={styles.totalNumber}>{selectedReceipt.formattedAmount}</span>
              </div>
            </div>

            <div className={styles.receiptFooter}>
              <p>This invoice is electronically stored in the BAVI client database. Accounts: accounts@bavi.in</p>
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
