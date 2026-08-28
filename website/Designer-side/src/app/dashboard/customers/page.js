'use client';

import { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import styles from './customers.module.css';

export default function DesignerCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const [clients, setClients] = useState([
    {
      id: 'c1',
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@example.com',
      phone: '+91 98765 11111',
      project: 'The Grand Serenity Villa',
      location: 'Indiranagar, Bengaluru',
      progress: 65,
      budget: '₹1.85 Cr',
      paid: '₹74 Lakh',
      status: 'Active (Milestone 3)'
    },
    {
      id: 'c2',
      name: 'Pooja Reddy',
      email: 'pooja.reddy@example.com',
      phone: '+91 98765 22222',
      project: 'Whitefield Penthouse Renovation',
      location: 'Whitefield, Bengaluru',
      progress: 50,
      budget: '₹62 Lakh',
      paid: '₹31 Lakh',
      status: 'Active (Milestone 3)'
    },
    {
      id: 'c3',
      name: 'Vikramaditya Rao',
      email: 'vikram.rao@example.com',
      phone: '+91 98765 33333',
      project: 'Mysuru Heritage Corporate Hub',
      location: 'Jayalakshmipuram, Mysuru',
      progress: 15,
      budget: '₹2.40 Cr',
      paid: '₹24 Lakh',
      status: 'Planning (Milestone 1)'
    }
  ]);

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DesignerHeader 
        title="Client Portfolio Management" 
        subtitle="Manage assigned luxury homeowners and enterprise clients" 
      />

      <div className={styles.container}>
        {/* Top Control Bar */}
        <div className={styles.controlBar}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by client name, project, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button className={styles.addClientBtn} onClick={() => alert('New client onboarding wizard')}>
            <Plus size={16} />
            <span>Onboard New Client</span>
          </button>
        </div>

        {/* Clients Grid */}
        <div className={styles.clientsGrid}>
          {filtered.map((client) => (
            <div key={client.id} className={styles.clientCard}>
              <div className={styles.cardHeader}>
                <div className={styles.clientAvatar}>
                  {client.name.charAt(0)}
                </div>
                <div className={styles.clientMain}>
                  <h3 className={styles.clientName}>{client.name}</h3>
                  <span className={styles.statusPill}>{client.status}</span>
                </div>
              </div>

              <div className={styles.projectBox}>
                <span className={styles.projectLabel}>Assigned Project:</span>
                <h4 className={styles.projectTitle}>{client.project}</h4>
                <div className={styles.locationRow}>
                  <MapPin size={14} color="var(--color-gold)" />
                  <span>{client.location}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>Execution Progress</span>
                  <strong>{client.progress}%</strong>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${client.progress}%` }} />
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className={styles.financialRow}>
                <div>
                  <span className={styles.finLabel}>Budget:</span>
                  <span className={styles.finValue}>{client.budget}</span>
                </div>
                <div className={styles.textRight}>
                  <span className={styles.finLabel}>Paid Escrow:</span>
                  <span className={styles.finValueGold}>{client.paid}</span>
                </div>
              </div>

              {/* Contact Actions */}
              <div className={styles.contactRow}>
                <a href={`tel:${client.phone}`} className={styles.contactIconBtn} title="Call Client">
                  <Phone size={15} />
                  <span>{client.phone}</span>
                </a>
                <a href={`mailto:${client.email}`} className={styles.contactIconBtn} title="Email Client">
                  <Mail size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
