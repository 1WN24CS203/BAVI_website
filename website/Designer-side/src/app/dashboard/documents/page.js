'use client';

import { useState, useEffect } from 'react';
import {
  Archive, FileText, Download, Eye, Search, Filter, GitBranch,
  FolderOpen, Sparkles, RefreshCw, X, Building2
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button, Badge, Card, Tag, SearchInput } from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';

export default function DocumentVaultPage() {
  const { designer } = useDesignerAuth();
  const [projects, setProjects] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewDoc, setViewDoc] = useState(null);

  useEffect(() => {
    loadVault();
  }, []);

  const loadVault = () => {
    try {
      // Load full projects (with base64 document data)
      const full = localStorage.getItem('bavi_projects_full');
      const light = localStorage.getItem('bavi_projects');
      const src = full || light;
      if (src) {
        const parsed = JSON.parse(src);
        if (Array.isArray(parsed)) {
          setProjects(parsed);
          const docs = [];
          parsed.forEach(proj => {
            (proj.stages || []).forEach(stage => {
              (stage.documents || []).forEach((doc, docIdx) => {
                docs.push({
                  ...doc,
                  projectId: proj.id,
                  projectTitle: proj.title || 'Untitled Project',
                  projectClient: proj.client_name || 'Unknown Client',
                  stageId: stage.id,
                  stageName: stage.name || `Stage ${stage.id}`,
                  docIndex: docIdx,
                });
              });
            });
          });
          setAllDocs(docs);
        }
      }
    } catch (err) {
      console.warn('Failed to load vault:', err);
    }
    setLoading(false);
  };

  const getDocIcon = (type) => {
    if (!type) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📋';
    if (type.includes('video')) return '🎬';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('dwg') || type.includes('autocad')) return '📐';
    return '📄';
  };

  const getTypeLabel = (type) => {
    if (!type) return 'File';
    if (type.includes('image')) return 'Image';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('video')) return 'Video';
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return 'Spreadsheet';
    if (type.includes('zip') || type.includes('rar')) return 'Archive';
    if (type.includes('word') || type.includes('doc')) return 'Document';
    return 'File';
  };

  const handleDownload = (doc) => {
    if (!doc.data) return;
    const a = document.createElement('a');
    a.href = doc.data;
    a.download = doc.name;
    a.click();
  };

  // Unique projects and stages for filter dropdowns
  const projectOptions = [{ id: 'all', title: 'All Projects' }, ...projects.map(p => ({ id: p.id, title: p.title }))];
  const stageOptions = ['all', ...new Set(allDocs.map(d => d.stageName))];

  const typeOptions = ['all', ...new Set(allDocs.map(d => getTypeLabel(d.type)))];

  const filtered = allDocs.filter(doc => {
    if (filterProject !== 'all' && doc.projectId !== filterProject) return false;
    if (filterStage !== 'all' && doc.stageName !== filterStage) return false;
    if (filterType !== 'all' && getTypeLabel(doc.type) !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return doc.name?.toLowerCase().includes(q) ||
        doc.projectTitle?.toLowerCase().includes(q) ||
        doc.stageName?.toLowerCase().includes(q) ||
        doc.uploaded_by?.toLowerCase().includes(q);
    }
    return true;
  });

  // Group by project for vault view
  const grouped = {};
  filtered.forEach(doc => {
    if (!grouped[doc.projectId]) {
      grouped[doc.projectId] = { projectTitle: doc.projectTitle, projectClient: doc.projectClient, docs: [] };
    }
    grouped[doc.projectId].docs.push(doc);
  });

  return (
    <>
      <DesignerHeader
        title="Document Vault"
        subtitle={`Centralized archive of all project stage documents — ${allDocs.length} files across ${projects.length} projects`}
      />

      <div style={{ padding: '0 4px' }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total Files', value: allDocs.length, color: '#c9a84c' },
            { label: 'Projects', value: projects.length, color: '#60a5fa' },
            { label: 'With Downloads', value: allDocs.filter(d => d.data).length, color: '#4ade80' },
            { label: 'Images', value: allDocs.filter(d => d.type?.includes('image')).length, color: '#f472b6' },
            { label: 'PDFs', value: allDocs.filter(d => d.type?.includes('pdf')).length, color: '#fb923c' },
          ].map((stat, i) => (
            <Card key={i} variant="elevated" padding="md">
              <div style={{ fontSize: '0.7rem', color: stat.color, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{stat.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color, fontFamily: "'Playfair Display', Georgia, serif" }}>{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Filters Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files, projects, stages..."
            onClear={() => setSearch('')}
          />

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            style={{ padding: '8px 12px', background: '#181818', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e0e0e0', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
          >
            {projectOptions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '8px 12px', background: '#181818', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e0e0e0', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
          >
            {typeOptions.map(t => <option key={t} value={t}>{t === 'all' ? 'All File Types' : t}</option>)}
          </select>

          <Button size="sm" variant="outline" icon={RefreshCw} onClick={loadVault}>Refresh</Button>

          {(search || filterProject !== 'all' || filterType !== 'all') && (
            <Button size="sm" variant="ghost" icon={X} onClick={() => { setSearch(''); setFilterProject('all'); setFilterStage('all'); setFilterType('all'); }}>
              Clear
            </Button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6e6e6e' }}>Loading vault...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6e6e6e' }}>
            <Archive size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '0.9rem' }}>
              {allDocs.length === 0
                ? 'No documents uploaded yet. Upload files from the Projects page stages.'
                : 'No documents match your filters.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(grouped).map(([projId, group]) => (
              <div key={projId}>
                {/* Project Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Building2 size={16} color="#c9a84c" />
                  <span style={{ fontWeight: 700, color: '#f8f8f8', fontSize: '0.95rem' }}>{group.projectTitle}</span>
                  <Tag variant="info">Client: {group.projectClient}</Tag>
                  <Tag variant="neutral">{group.docs.length} file{group.docs.length !== 1 ? 's' : ''}</Tag>
                </div>

                {/* Group by Stage */}
                {(() => {
                  const byStage = {};
                  group.docs.forEach(d => {
                    if (!byStage[d.stageName]) byStage[d.stageName] = [];
                    byStage[d.stageName].push(d);
                  });
                  return Object.entries(byStage).map(([stageName, docs]) => (
                    <div key={stageName} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginLeft: '8px' }}>
                        <GitBranch size={13} color="#6e6e6e" />
                        <span style={{ fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>{stageName}</span>
                        <span style={{ fontSize: '0.7rem', color: '#555' }}>({docs.length})</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px', marginLeft: '8px' }}>
                        {docs.map((doc, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px',
                              background: '#141414', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
                              transition: 'border-color 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                          >
                            <span style={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>{getDocIcon(doc.type)}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#6e6e6e', marginTop: '3px' }}>
                                {doc.sizeLabel || (doc.size ? `${(doc.size / 1024).toFixed(0)} KB` : 'Unknown size')}
                                {doc.uploaded_by && ` • ${doc.uploaded_by}`}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#555', marginTop: '2px' }}>
                                {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown date'}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                {doc.data && (
                                  <>
                                    <button
                                      onClick={() => setViewDoc(doc)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '5px', color: '#60a5fa', fontSize: '0.72rem', cursor: 'pointer' }}
                                    >
                                      <Eye size={12} /> View
                                    </button>
                                    <button
                                      onClick={() => handleDownload(doc)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '5px', color: '#4ade80', fontSize: '0.72rem', cursor: 'pointer' }}
                                    >
                                      <Download size={12} /> Download
                                    </button>
                                  </>
                                )}
                                {!doc.data && (
                                  <span style={{ fontSize: '0.7rem', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FileText size={11} /> Metadata only
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ))}
          </div>
        )}

        {/* Document Preview Modal */}
        {viewDoc && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setViewDoc(null)}
          >
            <div
              style={{ background: '#1a1a1a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: '#f8f8f8', margin: 0, fontSize: '1rem' }}>{viewDoc.name}</h3>
                  <p style={{ color: '#888', fontSize: '0.78rem', margin: '4px 0 0' }}>{viewDoc.stageName} • {viewDoc.projectTitle}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {viewDoc.data && (
                    <button
                      onClick={() => handleDownload(viewDoc)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', color: '#4ade80', fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      <Download size={14} /> Download
                    </button>
                  )}
                  <button
                    onClick={() => setViewDoc(null)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', cursor: 'pointer', borderRadius: '8px', padding: '8px' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {viewDoc.type?.includes('image') ? (
                <img src={viewDoc.data} alt={viewDoc.name} style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px' }} />
              ) : viewDoc.type?.includes('pdf') ? (
                <iframe src={viewDoc.data} title={viewDoc.name} style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', background: '#111', borderRadius: '12px' }}>
                  <span style={{ fontSize: '4rem' }}>{getDocIcon(viewDoc.type)}</span>
                  <p style={{ color: '#888', marginTop: '16px' }}>Preview not available for this file type.</p>
                  <button
                    onClick={() => handleDownload(viewDoc)}
                    style={{ marginTop: '12px', padding: '10px 20px', background: '#c9a84c', border: 'none', borderRadius: '8px', color: '#0a0a0a', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Download to Open
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
