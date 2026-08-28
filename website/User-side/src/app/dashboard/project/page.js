'use client';

import { useState } from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowDownToLine, 
  Layers, 
  FileCheck2, 
  Sparkles,
  Building,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './project.module.css';

export default function MyProjectPage() {
  const { profile } = useAuth();
  const isPooja = profile?.email?.includes('pooja');

  const project = isPooja ? {
    title: 'Whitefield Penthouse Renovation',
    category: 'Interior Turnkey Project',
    location: 'Villa 18, Palm Meadows, Whitefield, Bengaluru',
    status: 'In Progress (50%)',
    budget: '₹62,00,000',
    paid: '₹31,00,000',
    startDate: '01 Mar 2026',
    estCompletion: '15 Aug 2026',
    description: 'Complete interior design transformation featuring custom teakwood modular storage, concealed ambient gold LED coving, automated Italian motorized blinds, and an acoustic home theatre lounge.',
    milestones: [
      { id: 1, title: 'Concept Design & 3D Visual Mockups', status: 'completed', date: '15 Mar 2026', amount: '₹12,40,000', desc: 'Space planning, moodboards, and realistic 3D VR renders approved.' },
      { id: 2, title: 'Civil Alterations & Electrical Layouts', status: 'completed', date: '20 Apr 2026', amount: '₹18,60,000', desc: 'Drywall partition removal, new concealed conduits, and false ceiling framing.' },
      { id: 3, title: 'Bespoke Carpentry & Veneer Paneling', status: 'in_progress', date: '10 Jun 2026', amount: '₹15,50,000', desc: 'Crafting master walk-in wardrobe, fluted veneer wall panels, and TV console.' },
      { id: 4, title: 'Modular Kitchen & Imported Quartz Countertops', status: 'pending', date: '15 Jul 2026', amount: '₹10,00,000', desc: 'Hafele soft-close hardware, quartz countertops, and built-in appliances.' },
      { id: 5, title: 'Lighting, Painting & Final Styling', status: 'pending', date: '15 Aug 2026', amount: '₹5,50,000', desc: 'Velvet lustre paint finish, brass pendant installation, and deep cleaning.' },
    ]
  } : {
    title: 'The Grand Serenity Villa',
    category: 'Luxury Residential Construction',
    location: 'Plot #42, Indiranagar, Bengaluru',
    status: 'In Progress (65%)',
    budget: '₹1,85,00,000',
    paid: '₹74,00,000',
    startDate: '15 Jan 2026',
    estCompletion: '30 Nov 2026',
    description: '4BHK Ultra-Luxury contemporary villa with 6,800 sq.ft built-up area. Features double-height living foyer, cantilevered master balconies, Italian Botticino marble, automated smart facades, and temperature-controlled terrace pool.',
    milestones: [
      { id: 1, title: 'Architectural Blueprint & BBMP Sanction', status: 'completed', date: '10 Feb 2026', amount: '₹20,00,000', desc: 'Structural engineering drawings, soil analysis, and municipal approval.' },
      { id: 2, title: 'Excavation & RCC Foundation Structure', status: 'completed', date: '25 Apr 2026', amount: '₹54,00,000', desc: 'Plinth beams, column casting, and ground floor slab structural work.' },
      { id: 3, title: 'Brick Masonry, Plumbing & Electrical Conduits', status: 'in_progress', date: '31 Jul 2026', amount: '₹45,00,000', desc: 'Double-coat clay brickwork, concealed Finolex wiring, and Astral plumbing lines.' },
      { id: 4, title: 'Flooring, False Ceiling & Premium Painting', status: 'pending', date: '30 Sep 2026', amount: '₹40,00,000', desc: 'Italian marble laying, Gyproc designer ceiling, and Asian Paints Royale lustre.' },
      { id: 5, title: 'Smart Home Automation & Handover', status: 'pending', date: '30 Nov 2026', amount: '₹26,00,000', desc: 'Smart automation commissioning, landscape lighting, and official key handover.' },
    ]
  };

  const [activeTab, setActiveTab] = useState('milestones'); // 'milestones' | 'documents'

  return (
    <div className={styles.container}>
      {/* Project Header Banner */}
      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div>
            <span className={styles.badgeGold}>{project.category}</span>
            <h2 className={styles.projectTitle}>{project.title}</h2>
            <p className={styles.projectLocation}>{project.location}</p>
          </div>
          <div className={styles.statusBadgeBox}>
            <span className={styles.statusLabel}>Project Status</span>
            <span className={styles.statusValue}>{project.status}</span>
          </div>
        </div>

        <p className={styles.projectDesc}>{project.description}</p>

        {/* Project Meta Cards */}
        <div className={styles.metaRow}>
          <div className={styles.metaBox}>
            <span className={styles.metaBoxLabel}>Total Contract</span>
            <span className={styles.metaBoxValue}>{project.budget}</span>
          </div>
          <div className={styles.metaBox}>
            <span className={styles.metaBoxLabel}>Amount Paid</span>
            <span className={styles.metaBoxValueGold}>{project.paid}</span>
          </div>
          <div className={styles.metaBox}>
            <span className={styles.metaBoxLabel}>Commencement</span>
            <span className={styles.metaBoxValue}>{project.startDate}</span>
          </div>
          <div className={styles.metaBox}>
            <span className={styles.metaBoxLabel}>Est. Handover</span>
            <span className={styles.metaBoxValue}>{project.estCompletion}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsRow}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'milestones' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('milestones')}
        >
          <Layers size={17} />
          <span>Execution Roadmap ({project.milestones.length} Stages)</span>
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileCheck2 size={17} />
          <span>Approved Blueprints & Documents</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'milestones' ? (
        <div className={styles.milestonesList}>
          {project.milestones.map((milestone, idx) => (
            <div 
              key={milestone.id} 
              className={`${styles.milestoneCard} ${
                milestone.status === 'completed' ? styles.milestoneCompleted :
                milestone.status === 'in_progress' ? styles.milestoneActive : styles.milestonePending
              }`}
            >
              <div className={styles.milestoneIndicator}>
                {milestone.status === 'completed' ? (
                  <div className={styles.iconCompleted}><Check size={16} /></div>
                ) : milestone.status === 'in_progress' ? (
                  <div className={styles.iconActive}><Clock size={16} /></div>
                ) : (
                  <div className={styles.iconPending}>{idx + 1}</div>
                )}
                {idx < project.milestones.length - 1 && <div className={styles.connectorLine} />}
              </div>

              <div className={styles.milestoneContent}>
                <div className={styles.milestoneTopBar}>
                  <div>
                    <span className={styles.stageTag}>Stage 0{idx + 1}</span>
                    <h3 className={styles.milestoneCardTitle}>{milestone.title}</h3>
                  </div>
                  <div className={styles.milestoneAmountBox}>
                    <span className={styles.amountLabel}>Milestone Value</span>
                    <span className={styles.milestoneAmount}>{milestone.amount}</span>
                  </div>
                </div>

                <p className={styles.milestoneCardDesc}>{milestone.desc}</p>

                <div className={styles.milestoneFooter}>
                  <div className={styles.dateMeta}>
                    <Calendar size={14} />
                    <span>Target Due Date: <strong>{milestone.date}</strong></span>
                  </div>
                  <span className={`
                    ${styles.statusPill} 
                    ${milestone.status === 'completed' ? styles.pillCompleted : 
                      milestone.status === 'in_progress' ? styles.pillActive : styles.pillPending}
                  `}>
                    {milestone.status === 'completed' ? 'Verified & Completed' :
                     milestone.status === 'in_progress' ? 'Under Active Execution' : 'Scheduled Milestone'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.documentsGrid}>
          <div className={styles.documentCard}>
            <div className={styles.docIconBox}><Building size={24} /></div>
            <div className={styles.docMain}>
              <h4 className={styles.docTitle}>Architectural_Sanction_Plan_Rev4.pdf</h4>
              <p className={styles.docDesc}>BBMP Approved drawings, structural column loads and elevation sections.</p>
              <span className={styles.docSize}>PDF • 18.5 MB • Approved by Arun Bahubali</span>
            </div>
            <button className={styles.downloadBtn}>
              <ArrowDownToLine size={16} />
              <span>Download</span>
            </button>
          </div>

          <div className={styles.documentCard}>
            <div className={styles.docIconBox}><Sparkles size={24} /></div>
            <div className={styles.docMain}>
              <h4 className={styles.docTitle}>Interior_Material_Specification_Schedule.pdf</h4>
              <p className={styles.docDesc}>Botticino Marble grade A, Hafele hardware, Saint-Gobain toughened glass specs.</p>
              <span className={styles.docSize}>PDF • 6.2 MB • Verified</span>
            </div>
            <button className={styles.downloadBtn}>
              <ArrowDownToLine size={16} />
              <span>Download</span>
            </button>
          </div>

          <div className={styles.documentCard}>
            <div className={styles.docIconBox}><FileCheck2 size={24} /></div>
            <div className={styles.docMain}>
              <h4 className={styles.docTitle}>Soil_Bearing_Test_Report_Indiranagar.pdf</h4>
              <p className={styles.docDesc}>Certified geotechnical analysis for 4-storey residential load compliance.</p>
              <span className={styles.docSize}>PDF • 3.1 MB • Civil Certified</span>
            </div>
            <button className={styles.downloadBtn}>
              <ArrowDownToLine size={16} />
              <span>Download</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
