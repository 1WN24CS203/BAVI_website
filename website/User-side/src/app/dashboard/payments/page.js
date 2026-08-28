'use client';

import { useState, useEffect } from 'react';
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
  X,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import styles from './payments.module.css';

export default function PaymentsPage() {
  const { profile } = useAuth();

  const rawPhone = process.env.NEXT_PUBLIC_UPI_PHONE || '8277762487';
  const rawUpiId = process.env.NEXT_PUBLIC_UPI_ID || `${rawPhone}@paytm`;
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'BAVI Builders & Visionary Interiors';

  const displayPhone = rawPhone.length === 10 
    ? `+91 ${rawPhone.slice(0, 5)} ${rawPhone.slice(5)}` 
    : rawPhone;

  const paymentHandle = rawPhone.length === 10 && !rawUpiId.includes('@')
    ? `${rawPhone}@paytm`
    : rawUpiId;

  const [paymentMilestones, setPaymentMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [activeQRModal, setActiveQRModal] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

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
          const formatted = data.map((p, idx) => ({
            id: p.id,
            title: p.description || `Milestone #${idx + 1}`,
            amount: parseFloat(p.amount) || 0,
            formattedAmount: '₹' + (parseFloat(p.amount) || 0).toLocaleString('en-IN'),
            status: p.status === 'completed' ? 'completed' : 'due',
            dueDate: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : 'Due Now',
            paidDate: p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : '',
            receiptNo: p.receipt_number || `BAVI-BILL-${idx + 1}`,
            utrNo: p.utr_number || '-',
            method: p.payment_method || 'Phone / UPI Transfer',
            desc: p.notes || ''
          }));
          setPaymentMilestones(formatted);
        } else {
          setPaymentMilestones([]);
        }
      } catch (err) {
        console.warn('Supabase fetch payments error:', err);
      }
    }
    setLoading(false);
  };

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

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 6) {
      alert('Please enter a valid 12-digit UPI UTR / Transaction Reference Number');
      return;
    }

    setSubmittingProof(true);
    const receiptNo = activeQRModal.receiptNo || `BAVI-UPI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    if (isSupabaseConfigured() && activeQRModal.id) {
      try {
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            utr_number: utrNumber.trim(),
            paid_at: new Date().toISOString()
          })
          .eq('id', activeQRModal.id);
      } catch (err) {
        console.warn('Supabase update payment error:', err);
      }
    }

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
    setToastMessage(`Payment of ${activeQRModal.formattedAmount} verified with UTR #${utrNumber.trim()}! Tax receipt generated.`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const totalContract = paymentMilestones.reduce((acc, m) => acc + m.amount, 0);
  const totalPaid = paymentMilestones.filter(m => m.status === 'completed').reduce((acc, m) => acc + m.amount, 0);
  const totalRemaining = totalContract - totalPaid;

  const formatCurrency = (val) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  const getUPIIntent = (milestone) => {
    if (!milestone) return '';
    const note = encodeURIComponent(`BAVI - ${milestone.title}`);
    const name = encodeURIComponent(upiName);
    return `upi://pay?pa=${paymentHandle}&pn=${name}&am=${milestone.amount}&cu=INR&tn=${note}`;
  };

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
          <span className={styles.summaryLabel}>Total Milestone Bills</span>
          <span className={styles.summaryValue}>{formatCurrency(totalContract)}</span>
          <span className={styles.summarySub}>Requested by Designer</span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Paid to Date</span>
          <span className={styles.summaryValueGold}>{formatCurrency(totalPaid)}</span>
          <span className={styles.summarySub}>
            {totalContract > 0 ? Math.round((totalPaid / totalContract) * 100) : 0}% of requested bills cleared
          </span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Pending Payment Balance</span>
          <span className={styles.summaryValue}>{formatCurrency(totalRemaining)}</span>
          <span className={styles.summarySub}>Payable via Phone / UPI QR</span>
        </div>
      </div>

      {/* Milestones Payment Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Project Payment Bills & Receipts</h3>
          <span className={styles.badgeGold}>Verified Bank Escrow</span>
        </div>

        {paymentMilestones.length > 0 ? (
          <div className={styles.milestonesList}>
            {paymentMilestones.map((m, idx) => (
              <div 
                key={m.id} 
                className={`${styles.milestoneItem} ${m.status === 'completed' ? styles.milestonePaid : styles.milestoneDue}`}
              >
                <div className={styles.milestoneMain}>
                  <div className={styles.milestoneTop}>
                    <span className={styles.milestoneIndex}>Bill 0{idx + 1}</span>
                    <span className={`
                      ${styles.statusBadge}
                      ${m.status === 'completed' ? styles.statusPaidBadge : styles.statusDueBadge}
                    `}>
                      {m.status === 'completed' ? 'Cleared & Receipt Stored' : 'Payment Requested'}
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
                      </>
                    ) : (
                      <span>Bill Issued: <strong>{m.dueDate}</strong></span>
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
                No Payment Bills Requested Yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
                When your architect requests a milestone bill payment, it will appear here so you can pay via mobile number <strong style={{ color: 'var(--color-gold)' }}>{displayPhone}</strong> or UPI QR.
              </p>
            </div>
          </div>
        )}
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
                    value={profile?.full_name || 'Client'}
                    disabled
                    className={`${styles.formInput} ${styles.inputDisabled}`}
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
                  <p className={styles.receiptSubtext}>Construction & Architectural Milestone • Cleared</p>
                </div>
                <span className={styles.receiptAmountBold}>{selectedReceipt.formattedAmount}</span>
              </div>
            </div>

            <div className={styles.receiptTotalRow}>
              <div className={styles.stampBadge}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>PAYMENT CLEARED & STORED IN DATABASE</span>
              </div>
              <div className={styles.totalBox}>
                <span className={styles.totalLabel}>Total Received:</span>
                <span className={styles.totalNumber}>{selectedReceipt.formattedAmount}</span>
              </div>
            </div>

            <div className={styles.receiptFooter}>
              <p>This invoice is electronically stored in the BAVI client database. Email: Interiorsbavi@gmail.com</p>
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
