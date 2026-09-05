'use client';

import { useState, useEffect } from 'react';
import {
  FileText, Sparkles, CheckCircle2, Clock, Edit3, Send,
  AlertCircle, ShieldCheck, Download, ChevronRight, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Badge, Card, TextArea, TextInput } from '@/components/astryx';

export default function ClientRequirementsPage() {
  const { profile } = useAuth();
  const [data, setData] = useState({
    id: null,
    projectId: null,
    projectName: 'My Residence Project',
    clientName: profile?.full_name || '',
    clientPlainWords: '',
    submittedAt: null,
    status: 'NOT_SUBMITTED',
    srs: null,
  });
  const [isEditingWords, setIsEditingWords] = useState(false);
  const [plainWordsDraft, setPlainWordsDraft] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bavi_client_requirements');
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed);
        setPlainWordsDraft(parsed.clientPlainWords || '');
      } else {
        const fresh = {
          id: 'req-' + Date.now(),
          projectId: 'proj-active',
          projectName: 'My Residence Project',
          clientName: profile?.full_name || 'Client',
          clientPlainWords: '',
          submittedAt: null,
          status: 'NOT_SUBMITTED',
          srs: null,
        };
        setData(fresh);
        setPlainWordsDraft('');
      }
    } catch {
      setData({
        id: 'req-' + Date.now(),
        projectId: 'proj-active',
        projectName: 'My Residence Project',
        clientName: profile?.full_name || 'Client',
        clientPlainWords: '',
        submittedAt: null,
        status: 'NOT_SUBMITTED',
        srs: null,
      });
      setPlainWordsDraft('');
    }
  }, [profile]);

  const handleSavePlainWords = (e) => {
    e.preventDefault();
    const updated = {
      ...data,
      clientPlainWords: plainWordsDraft,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'AWAITING_SRS_REVISION',
    };
    setData(updated);
    try {
      localStorage.setItem('bavi_client_requirements', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    setIsEditingWords(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleApproveSRS = () => {
    const updated = {
      ...data,
      status: 'SRS_CLIENT_APPROVED',
      srs: {
        ...data.srs,
        clientApproved: true,
        clientApprovedAt: new Date().toISOString().split('T')[0],
      }
    };
    setData(updated);
    try {
      localStorage.setItem('bavi_client_requirements', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    setApprovalSuccess(true);
    setTimeout(() => setApprovalSuccess(false), 5000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--astryx-gold)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          <Sparkles size={16} />
          <span>Requirement Analysis & SRS Phase</span>
        </div>
        <h1 style={{ fontSize: '1.8rem', color: '#fff', margin: 0, fontWeight: 600 }}>
          Client Vision & Technical Specification (SRS)
        </h1>
        <p style={{ color: '#888', fontSize: '0.92rem', marginTop: '6px' }}>
          State your home requirements in your own plain words. Our lead architects analyze your desires and engineer the formal Software/Structure Requirements Specification (SRS).
        </p>
      </div>

      {savedSuccess && (
        <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Your requirements were saved and forwarded to your Architect team for SRS formulation!</span>
        </div>
      )}

      {approvalSuccess && (
        <div style={{ background: 'rgba(201, 168, 76, 0.15)', border: '1px solid var(--astryx-gold)', color: 'var(--astryx-gold-light)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} />
          <span>You have formally approved the Architect's SRS Specifications! Construction drawings will now proceed under dual verification.</span>
        </div>
      )}

      {/* Part 1: Client's Plain Words */}
      <Card style={{ marginBottom: '28px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
                1. Your Project Vision in Plain Words
              </h2>
              <Badge variant={data.status === 'SRS_CLIENT_APPROVED' ? 'success' : 'gold'}>
                {data.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>
              Last updated: {data.submittedAt} • Client: {profile?.full_name || data.clientName}
            </span>
          </div>

          {!isEditingWords && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Edit3 size={14} />}
              onClick={() => setIsEditingWords(true)}
            >
              Update My Vision
            </Button>
          )}
        </div>

        {isEditingWords ? (
          <form onSubmit={handleSavePlainWords}>
            <TextArea
              required
              rows={6}
              value={plainWordsDraft}
              onChange={(e) => setPlainWordsDraft(e.target.value)}
              placeholder="Tell us what you want in your own words (e.g. open kitchen, warm colors, quiet office, Italian marble...)"
              style={{ width: '100%', marginBottom: '14px', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" type="button" onClick={() => setIsEditingWords(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" icon={<Send size={14} />}>
                Save & Forward to Architect
              </Button>
            </div>
          </form>
        ) : data.clientPlainWords ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '18px 20px',
            color: '#ddd',
            fontSize: '0.92rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-line'
          }}>
            {data.clientPlainWords}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
            border: '1px dashed rgba(255,255,255,0.1)',
            color: '#888'
          }}>
            <FileText size={32} style={{ color: 'var(--astryx-gold)', marginBottom: '10px' }} />
            <h4 style={{ color: '#eee', margin: '0 0 6px' }}>No Requirements Submitted Yet</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem' }}>
              Describe your living requirements, room preferences, and desired aesthetic in plain everyday language.
            </p>
            <Button variant="primary" size="sm" icon={<Edit3 size={14} />} onClick={() => setIsEditingWords(true)}>
              Define My Vision
            </Button>
          </div>
        )}
      </Card>

      {/* Part 2: Architect-Engineered SRS */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
                2. Architect-Engineered SRS Specification
              </h2>
              {data.srs?.clientApproved ? (
                <Badge variant="success">CLIENT SIGNED-OFF</Badge>
              ) : data.srs ? (
                <Badge variant="warning">AWAITING CLIENT SIGN-OFF</Badge>
              ) : (
                <Badge variant="neutral">NOT YET GENERATED</Badge>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>
              {data.srs ? `Document: ${data.srs.title} • Version: ${data.srs.version} • Lead: ${data.srs.preparedBy}` : 'Awaiting initial requirements submission'}
            </span>
          </div>

          {data.srs && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {!data.srs?.clientApproved ? (
                <Button
                  variant="primary"
                  icon={<CheckCircle2 size={16} />}
                  onClick={handleApproveSRS}
                >
                  Approve & Sign Off SRS
                </Button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  <span>Approved on {data.srs.clientApprovedAt}</span>
                </div>
              )}
              <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                Export PDF
              </Button>
            </div>
          )}
        </div>

        {/* SRS Document Body */}
        {data.srs ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.srs?.sections?.map((sec) => (
              <div
                key={sec.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '16px 20px'
                }}
              >
                <h4 style={{ margin: '0 0 8px', fontSize: '0.98rem', color: 'var(--astryx-gold-light)', fontWeight: 600 }}>
                  {sec.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#ccc', lineHeight: 1.65 }}>
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '36px 20px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            color: '#777',
            fontSize: '0.88rem'
          }}>
            Your architect team will formulate the formal technical SRS specifications once your plain-text requirements are reviewed.
          </div>
        )}

        {/* Dual Approval Footnote */}
        <div style={{ marginTop: '24px', padding: '14px 18px', borderRadius: '8px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={20} style={{ color: 'var(--astryx-gold)' }} />
          <div style={{ fontSize: '0.82rem', color: '#bbb' }}>
            <strong style={{ color: 'var(--astryx-gold-light)' }}>Dual-Permission Contract Rule:</strong> Construction milestones cannot be marked complete without mutual authorization from both the Lead Builder and the Client.
          </div>
        </div>
      </Card>
    </div>
  );
}
