'use client';

import { useState, useEffect } from 'react';
import { Activity, Eye, Users, FolderKanban, PhoneCall, Clock, Shield, ArrowUpRight } from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { Card, Badge, Tabs, SearchInput, EmptyState, ScrollArea, Avatar, StatusDot, Tag } from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

export default function OwnerMonitorPage() {
  const { designer, getAllActivityLog, getApprovedDesignersList, getRequests } = useDesignerAuth();
  const [activityLog, setActivityLog] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setActivityLog(getAllActivityLog());
  }, []);

  const employees = getApprovedDesignersList();
  const requests = getRequests();

  const departmentColors = {
    admin: 'gold', architecture: 'info', construction: 'warning', marketing: 'success',
  };

  const actionLabels = {
    owner_registered: 'Registered as Site Owner',
    owner_login: 'Owner Login',
    employee_login: 'Employee Login',
    logout: 'Session Logout',
    approved_access_request: 'Approved Access Request',
    rejected_access_request: 'Rejected Access Request',
    created_project: 'Created New Project',
    builder_approved_stage: 'Approved Construction Stage',
    uploaded_stage_document: 'Uploaded Stage Documents',
    added_callback: 'Added Callback Request',
    added_material: 'Added Material Entry',
    added_inspection: 'Added Quality Inspection',
    added_contractor: 'Added Contractor',
    added_safety_record: 'Added Safety Record',
    added_equipment: 'Added Equipment',
  };

  const tabs = [
    { value: 'all', label: 'All Activity', count: activityLog.length },
    { value: 'admin', label: 'Admin', count: activityLog.filter(l => l.department === 'admin').length },
    { value: 'architecture', label: 'Architecture', count: activityLog.filter(l => l.department === 'architecture').length },
    { value: 'construction', label: 'Construction', count: activityLog.filter(l => l.department === 'construction').length },
    { value: 'marketing', label: 'Marketing', count: activityLog.filter(l => l.department === 'marketing').length },
  ];

  const filtered = activityLog.filter(log => {
    const matchesTab = activeTab === 'all' || log.department === activeTab;
    const matchesSearch = !searchTerm ||
      log.actor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <DesignerHeader
        title="Owner Activity Monitor"
        subtitle="Real-time cross-department activity feed — monitor all projects, approvals, and employee actions"
      />

      <div style={{ padding: '0 4px' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.68rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600 }}>Total Employees</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8f8f8', fontFamily: "'Playfair Display', serif" }}>{employees.length}</div>
            <StatusDot status="active" label="Active" size="sm" />
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.68rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600 }}>Pending Requests</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24', fontFamily: "'Playfair Display', serif" }}>{requests.filter(r => r.status === 'PENDING').length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.68rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600 }}>Activity Events</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c9a84c', fontFamily: "'Playfair Display', serif" }}>{activityLog.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.68rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600 }}>Departments</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#60a5fa', fontFamily: "'Playfair Display', serif" }}>4</div>
          </Card>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="pills" />
          <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search activity..." onClear={() => setSearchTerm('')} />
        </div>

        {/* Activity Feed */}
        {filtered.length > 0 ? (
          <ScrollArea maxHeight="600px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filtered.map((log) => (
                <Card key={log.id} variant="default" padding="sm" hoverable>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 4px' }}>
                    <Avatar name={log.actor_name} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8f8f8' }}>{log.actor_name}</span>
                        <Tag variant={departmentColors[log.department] || 'neutral'} size="sm">{log.department || 'system'}</Tag>
                        <Badge variant={log.actor_type === 'owner' ? 'gold' : 'neutral'} size="sm">{log.actor_type}</Badge>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#a0a0a0', marginTop: '2px' }}>
                        {actionLabels[log.action] || log.action}
                        {log.resource_name && <span style={{ color: '#c9a84c' }}> — {log.resource_name}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#4a4a4a', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {new Date(log.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <EmptyState
            icon={Activity}
            title="No Activity Recorded Yet"
            description="Activity from all departments — project creation, stage approvals, document uploads, logins — will appear here in real-time."
          />
        )}
      </div>
    </>
  );
}
