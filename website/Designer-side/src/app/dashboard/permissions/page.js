'use client';

import { useState, useEffect } from 'react';
import {
  Lock, Shield, ShieldCheck, AlertTriangle, CheckCircle2,
  XCircle, Building, HardHat, Target, Crown, Info
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Button, Badge, Card } from '@/components/astryx';

const DEFAULT_POLICY_RULES = [
  {
    id: 'pol-1',
    department: 'Architecture & Design',
    scope: 'Blueprint design, client plain-text requirements, SRS specifications, 3D renders, stage milestone approval.',
    allowedRoutes: ['/dashboard/projects', '/dashboard/requirements', '/dashboard/documents', '/dashboard/customers', '/dashboard/consultations'],
    crossAccessRestricted: ['Construction procurement & safety audits', 'Marketing callback phone registry', 'Owner key approvals'],
    isolationEnforced: true,
  },
  {
    id: 'pol-2',
    department: 'Construction & Management',
    scope: 'Material & procurement logging, quality site inspections, safety HSE compliance, contractor agency registry, machinery equipment tracking.',
    allowedRoutes: ['/dashboard/projects', '/dashboard/materials', '/dashboard/inspections', '/dashboard/contractors', '/dashboard/safety', '/dashboard/equipment'],
    crossAccessRestricted: ['Architecture design files & SRS generation', 'Marketing prospect lead pipeline', 'Owner system admin'],
    isolationEnforced: true,
  },
  {
    id: 'pol-3',
    department: 'Marketing & Sales',
    scope: 'Callback request triage (client vs non-client public), lead pipeline progression, consultation inquiries.',
    allowedRoutes: ['/dashboard/callbacks', '/dashboard/leads', '/dashboard/consultations', '/dashboard/customers'],
    crossAccessRestricted: ['Technical architectural drawings & SRS documents', 'Construction site logs & contractor agreements', 'Owner security credentials'],
    isolationEnforced: true,
  },
  {
    id: 'pol-4',
    department: 'Owner / Administration',
    scope: 'Unrestricted monitorability across all departments, project oversight, employee registration security keys, keyless entry lock toggles.',
    allowedRoutes: ['ALL ROUTES (Global Command)'],
    crossAccessRestricted: ['None (Full Monitorability & Governance)'],
    isolationEnforced: false,
  },
];

export default function PermissionsManagementPage() {
  const [policies, setPolicies] = useState(DEFAULT_POLICY_RULES);
  const [keylessDisabled, setKeylessDisabled] = useState(true);

  useEffect(() => {
    try {
      const disabled = localStorage.getItem('bavi_owner_keyless_disabled');
      if (disabled !== null) {
        setKeylessDisabled(disabled === 'true');
      }
    } catch {
      setKeylessDisabled(true);
    }
  }, []);

  const toggleKeylessPolicy = () => {
    const nextVal = !keylessDisabled;
    setKeylessDisabled(nextVal);
    try {
      localStorage.setItem('bavi_owner_keyless_disabled', nextVal ? 'true' : 'false');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh', background: 'var(--astryx-bg-primary)' }}>
      <DesignerHeader
        title="Department Isolation & Access Governance"
        subtitle="Owner security settings — zero cross-access enforcement between operational departments"
      />

      {/* Security Banner on Keyless Entry */}
      <Card style={{ margin: '24px 0', padding: '20px', borderLeft: '4px solid var(--astryx-gold)', background: 'rgba(201,168,76,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--astryx-gold)' }} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>Keyless Entry Lockout for Secondary Owners</h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', maxWidth: '650px' }}>
              Rule: Once the primary Site Owner is registered and logged in, automatic keyless entry is locked even for subsequent owner registrations. Subsequent owners must receive manual approval, while regular employees require an issued Security Key code.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Badge variant={keylessDisabled ? 'danger' : 'warning'}>
              {keylessDisabled ? 'KEYLESS ENTRY DISABLED' : 'KEYLESS ACTIVE'}
            </Badge>
            <Button
              variant={keylessDisabled ? 'secondary' : 'primary'}
              size="sm"
              onClick={toggleKeylessPolicy}
            >
              {keylessDisabled ? 'Keep Lock Enforced' : 'Disable Keyless Now'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Isolation Policies by Department */}
      <h3 style={{ margin: '30px 0 16px', color: '#fff', fontSize: '1.1rem' }}>Active Department Isolation Boundaries</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {policies.map(pol => (
          <Card key={pol.id} style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{pol.department}</h4>
              <Badge variant={pol.isolationEnforced ? 'gold' : 'success'}>
                {pol.isolationEnforced ? 'ISOLATED' : 'UNRESTRICTED'}
              </Badge>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#bbb', margin: '0 0 14px', lineHeight: 1.5 }}>
              {pol.scope}
            </p>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.8rem' }}>
              <div style={{ color: '#4ade80', fontWeight: 600, marginBottom: '6px' }}>Authorized Resources:</div>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#ddd' }}>
                {pol.allowedRoutes.map((r, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>{r}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
              <div style={{ color: '#f87171', fontWeight: 600, marginBottom: '6px' }}>Blocked Cross-Access:</div>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#fca5a5' }}>
                {pol.crossAccessRestricted.map((r, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>{r}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
