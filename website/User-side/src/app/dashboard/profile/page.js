'use client';

import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Lock, CheckCircle2, Shield, Save, 
  KeyRound, Send, AlertCircle, Clock, Sparkles, Check, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Card, Badge, Button, TextInput, Modal, Toast, Avatar, StatusDot, Divider
} from '@/components/astryx';
import s from '../shared.module.css';

export default function ProfilePage() {
  const { profile, updateProfile, updatePassword, requestPasswordChange, getClientPasswordRequests } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastVariant, setToastVariant] = useState('success');

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    reason: 'Updating to my private confidential password',
  });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);

  const showToast = (msg, variant = 'success') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastVisible(true);
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
      loadRequests();
    }
  }, [profile]);

  const loadRequests = () => {
    if (getClientPasswordRequests && profile?.email) {
      const list = getClientPasswordRequests();
      setMyRequests(list.filter(r => r.client_email?.toLowerCase() === profile.email.toLowerCase()));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    showToast('Profile information successfully saved!');
  };

  const handlePasswordRequestSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await (updatePassword || requestPasswordChange)({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
        reason: passData.reason,
      });
      setPassSuccess(res.message || 'Password successfully updated.');
      showToast('Password updated! New login credentials are now active.');
      setPassData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        reason: 'Updating to my private confidential password',
      });
      loadRequests();
      setTimeout(() => {
        setShowPasswordModal(false);
        setPassSuccess('');
      }, 2500);
    } catch (err) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const clientId = profile?.client_code || profile?.client_id || profile?.id || 'BAVI-CLIENT';

  return (
    <div className={s.container}>
      {/* Toast Notification */}
      <Toast 
        message={toastMsg} 
        variant={toastVariant} 
        visible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />

      {/* Header Profile Card */}
      <Card elevated style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Avatar 
              name={formData.full_name || 'Client'} 
              size="xl" 
              style={{
                background: 'linear-gradient(135deg, var(--astryx-gold), var(--astryx-gold-dark))',
                color: '#080808',
                fontWeight: 700,
                fontSize: '1.75rem',
                border: '2px solid var(--astryx-border-gold)',
                boxShadow: '0 0 20px rgba(201,168,76,0.2)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Badge variant="gold">Verified Client Commission</Badge>
                <Badge variant="success">Designer Approved</Badge>
              </div>
              <h1 style={{ 
                fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", 
                fontSize: '1.75rem', 
                color: 'var(--astryx-text-primary)', 
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                {formData.full_name || 'Valued Client'}
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--astryx-text-secondary)', margin: '4px 0 0' }}>
                {formData.email} • Client Reference: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--astryx-gold-light)', fontWeight: 600 }}>{clientId}</span>
              </p>
            </div>
          </div>

          <Button 
            variant="gold" 
            icon={KeyRound}
            onClick={() => { setShowPasswordModal(true); setPassError(''); setPassSuccess(''); }}
          >
            Change Account Password
          </Button>
        </div>
      </Card>

      {/* Main Grid: Personal Info Form + Security / Architect Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        
        {/* Form Column */}
        <Card elevated>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <User size={20} color="var(--astryx-gold)" />
            <h2 style={{ fontSize: '1.15rem', color: 'var(--astryx-text-primary)', margin: 0, fontWeight: 700 }}>
              Personal Information
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--astryx-text-muted)', marginBottom: 20 }}>
            Update your contact and billing details for architectural site communications and invoices.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <TextInput
              label="Full Legal Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              icon={User}
              placeholder="e.g. Ananya Sharma"
              required
            />

            <div>
              <TextInput
                label="Registered Email (Account ID)"
                value={formData.email}
                icon={Mail}
                disabled
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--astryx-text-muted)', marginTop: 4, display: 'block' }}>
                Your email is bound to your project contracts and cannot be edited self-service.
              </span>
            </div>

            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              icon={Phone}
              placeholder="e.g. +91 98765 43210"
            />

            <TextInput
              label="Site / Correspondence Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              icon={MapPin}
              placeholder="e.g. Villa 14, Prestige Golfshire, Nandi Hills Road"
            />

            <div style={{ marginTop: 8 }}>
              <Button type="submit" variant="primary" icon={Save}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Side Column: Assigned Architect & Security Credentials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Assigned Architect Card */}
          <Card elevated>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ShieldCheck size={20} color="var(--astryx-gold)" />
              <h2 style={{ fontSize: '1.15rem', color: 'var(--astryx-text-primary)', margin: 0, fontWeight: 700 }}>
                Assigned Architect
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--astryx-text-muted)', marginBottom: 16 }}>
              Directly responsible for architectural blueprints, structural sanction, and contractor execution.
            </p>

            <div style={{
              background: 'var(--astryx-surface-1)',
              border: '1px solid var(--astryx-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--astryx-text-primary)' }}>
                {profile?.designer?.name || 'Ar. Rajesh Bahubali'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--astryx-text-secondary)' }}>
                {profile?.designer?.title || 'Principal Architect & Studio Director'}
              </span>
              <span style={{ 
                fontSize: '0.74rem', 
                fontFamily: 'var(--font-mono)', 
                color: 'var(--astryx-gold-light)', 
                marginTop: 6,
                display: 'inline-block' 
              }}>
                Studio Code: {profile?.designer?.code || 'BAVI-ARCH-001'}
              </span>
            </div>
          </Card>

          {/* Credentials & Security Card */}
          <Card elevated>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Lock size={20} color="var(--astryx-gold)" />
              <h2 style={{ fontSize: '1.15rem', color: 'var(--astryx-text-primary)', margin: 0, fontWeight: 700 }}>
                Client Credentials &amp; Access
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--astryx-text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Your credentials were generated upon formal project booking after a verified callback. You may update your password at any time. Updates take effect immediately.
            </p>

            {myRequests.length > 0 && (
              <div style={{
                background: 'var(--astryx-surface-1)',
                border: '1px solid var(--astryx-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: 16
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--astryx-gold-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                  Recent Credential Updates:
                </div>
                {myRequests.slice(0, 3).map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: '6px 0', borderBottom: '1px solid var(--astryx-border-subtle)' }}>
                    <span style={{ color: 'var(--astryx-text-secondary)' }}>Password Updated</span>
                    <Badge variant={r.status === 'APPLIED' || r.status === 'APPROVED' ? 'success' : 'warning'}>
                      {r.status === 'APPLIED' ? 'Applied ✓' : r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <Button 
              variant="outline" 
              icon={KeyRound}
              onClick={() => { setShowPasswordModal(true); setPassError(''); setPassSuccess(''); }}
              fullWidth
            >
              Update Password
            </Button>
          </Card>
        </div>
      </div>

      {/* Password Change Modal via Astryx Modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Client Account Password"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="gold" 
              icon={Send} 
              loading={passLoading} 
              onClick={handlePasswordRequestSubmit}
            >
              Update Password Now
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--astryx-text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
          Enter your current temporary password provided by your designer, and choose your new private password.
        </p>

        {passSuccess && (
          <div style={{
            background: 'var(--astryx-success-bg)',
            border: '1px solid var(--astryx-success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: 'var(--astryx-success)',
            fontSize: '0.84rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <CheckCircle2 size={16} />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div style={{
            background: 'var(--astryx-danger-bg)',
            border: '1px solid var(--astryx-danger-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: 'var(--astryx-danger)',
            fontSize: '0.84rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={16} />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TextInput
            label="Current / Issued Password"
            type="password"
            value={passData.currentPassword}
            onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
            placeholder="Enter designer-issued or existing password"
            icon={Lock}
            required
          />

          <TextInput
            label="Desired New Password (minimum 6 characters)"
            type="password"
            value={passData.newPassword}
            onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
            placeholder="Enter your confidential new password"
            icon={KeyRound}
            required
          />

          <TextInput
            label="Confirm New Password"
            type="password"
            value={passData.confirmPassword}
            onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
            placeholder="Re-enter your new password"
            icon={KeyRound}
            required
          />

          <TextInput
            label="Note for Security Audit Log (Optional)"
            type="text"
            value={passData.reason}
            onChange={(e) => setPassData({ ...passData, reason: e.target.value })}
            placeholder="e.g. Routine client security update"
          />
        </form>
      </Modal>
    </div>
  );
}
