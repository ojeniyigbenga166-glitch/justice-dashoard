'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, X, Search, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { getLeads, updateLead, deleteLead } from '@/services/leads.service';

const STATUS_STYLE = {
  new:       { bg: '#E9D5FF', color: '#6B21A8', label: 'New' },
  contacted: { bg: '#DBEAFE', color: '#1E40AF', label: 'Contacted' },
  qualified: { bg: '#D1FAE5', color: '#065F46', label: 'Qualified' },
  lost:      { bg: '#FEE2E2', color: '#991B1B', label: 'Lost' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? { bg: '#F1F5F9', color: '#475569', label: status };
  return (
    <span style={{
      padding: '0.2rem 0.65rem', borderRadius: '20px',
      fontSize: '0.72rem', fontWeight: 700,
      backgroundColor: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem',
  border: '1px solid #CBD5E1', borderRadius: '8px',
  fontSize: '0.875rem', color: '#071B3B',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

export default function LeadsPage() {
  const [leads, setLeads]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [stFilter, setSt]         = useState('All');
  const [viewItem, setViewItem]   = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes]   = useState('');
  const [delTarget, setDelTarget]   = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getLeads();
    if (err) {
      setError('Failed to load leads. Please try again.');
      console.error('Leads fetch error:', err);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }

  const filtered = leads.filter(l => {
    const name  = (l.name || '').toLowerCase();
    const email = (l.email || '').toLowerCase();
    const q     = search.toLowerCase();
    const matchSearch = name.includes(q) || email.includes(q);
    const matchSt     = stFilter === 'All' || l.status === stFilter;
    return matchSearch && matchSt;
  });

  const openView = (lead) => {
    setViewItem(lead);
    setEditStatus(lead.status || 'new');
    setEditNotes(lead.notes || '');
  };

  const handleSave = async () => {
    if (!viewItem) return;
    setSaving(true);
    const { data, error: err } = await updateLead(viewItem.id, {
      status: editStatus,
      notes:  editNotes,
    });
    if (!err && data) {
      setLeads(prev => prev.map(l => l.id === viewItem.id
        ? { ...l, status: editStatus, notes: editNotes }
        : l
      ));
    } else {
      console.error('Failed to update lead:', err);
    }
    setSaving(false);
    setViewItem(null);
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    const { error: err } = await deleteLead(delTarget.id);
    if (!err) {
      setLeads(prev => prev.filter(l => l.id !== delTarget.id));
    } else {
      console.error('Failed to delete lead:', err);
    }
    setDelTarget(null);
  };

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..."
              style={{ ...inputStyle, paddingLeft: '2.2rem', width: '220px' }}
            />
          </div>
          <select value={stFilter} onChange={e => setSt(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            {['All', 'new', 'contacted', 'qualified', 'lost'].map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={loadLeads}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{filtered.length} leads found</div>
        </div>
      </div>

      {/* Status summary chips */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {Object.entries(STATUS_STYLE).map(([key, s]) => {
          const count = leads.filter(l => l.status === key).length;
          return (
            <div
              key={key}
              onClick={() => setSt(stFilter === key ? 'All' : key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.9rem', borderRadius: '20px',
                background: stFilter === key ? s.color : s.bg,
                color: stFilter === key ? '#fff' : s.color,
                fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
                border: `2px solid ${stFilter === key ? s.color : 'transparent'}`,
              }}
            >
              {s.label}
              <span style={{ background: 'rgba(0,0,0,0.12)', borderRadius: '10px', padding: '0 0.4rem', fontSize: '0.7rem' }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.25rem', color: '#991B1B', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={loadLeads} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Inbox size={16} color="#8B5CF6" />
          <span style={{ fontWeight: 700, color: '#071B3B', fontSize: '0.95rem' }}>Contact Inquiries</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                {['Received', 'Contact', 'Source', 'Message Preview', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Loader2 size={16} className="spin" />
                      <span>Loading leads...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    {leads.length === 0 ? 'No leads yet. Inquiries from your website will appear here.' : 'No leads match your filters.'}
                  </td>
                </tr>
              ) : filtered.map((l, idx) => (
                <tr
                  key={l.id}
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F8FAFC' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {formatDate(l.created_at || l.time)}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: '#071B3B' }}>{l.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {l.email}{l.phone ? ` · ${l.phone}` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: '#64748B' }}>
                    {l.source || '—'}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', maxWidth: '240px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#475569', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {l.message || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <StatusBadge status={l.status} />
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openView(l)}
                        style={{ padding: '0.35rem 0.55rem', background: '#F5F3FF', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#8B5CF6' }}
                        title="View & Update"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setDelTarget(l)}
                        style={{ padding: '0.35rem 0.55rem', background: '#FEE2E2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View / Update Lead Modal */}
      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '580px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#071B3B' }}>Lead Details</h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Received: {formatDate(viewItem.created_at || viewItem.time)}</span>
              </div>
              <button onClick={() => setViewItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <tbody>
                {[
                  ['Name',   viewItem.name],
                  ['Email',  <a key="e" href={`mailto:${viewItem.email}`} style={{ color: '#FDB813', fontWeight: 600 }}>{viewItem.email}</a>],
                  ['Phone',  viewItem.phone || '—'],
                  ['Source', viewItem.source || '—'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '0.4rem 0', color: '#64748B', fontWeight: 600, width: '120px' }}>{k}:</td>
                    <td style={{ padding: '0.4rem 0', color: '#071B3B', fontWeight: 600 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
              <p style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>INQUIRY MESSAGE</p>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>{viewItem.message || '(no message provided)'}</p>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Lead Status</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ ...inputStyle, width: '200px' }}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Internal Notes</label>
              <textarea
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Add notes about this lead..."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
              <button onClick={() => setViewItem(null)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, padding: '0.65rem', background: '#FDB813', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#071B3B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                {saving && <Loader2 size={14} className="spin" />}
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontWeight: 700, color: '#071B3B', marginBottom: '0.5rem' }}>Delete Lead?</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Remove lead from <strong>"{delTarget.name}"</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDelTarget(null)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>
                Cancel
              </button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '0.65rem', background: '#EF4444', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#fff' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
