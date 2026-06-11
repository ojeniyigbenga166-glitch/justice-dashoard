'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, X, Search, FolderKanban, Plus, Edit3 } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject } from '@/services/projects.service';
import ImageUpload from '@/components/admin/ImageUpload';

const STATUS_STYLE = {
  completed: { bg: '#D1FAE5', color: '#065F46', label: 'Completed' },
  ongoing:   { bg: '#DBEAFE', color: '#1E40AF', label: 'Ongoing' },
  draft:     { bg: '#FEF3C7', color: '#92400E', label: 'Draft' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? { bg: '#F1F5F9', color: '#475569', label: status };
  return <span style={{ padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: s.bg, color: s.color }}>{s.label}</span>;
}

const EMPTY_FORM = { title: '', client: '', location: '', capacity: '', category: 'Residential Solar', status: 'draft', start: '', end: '', description: '', image_url: null, image_path: null };

const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.875rem', color: '#071B3B', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    const { data } = await getProjects();
    if (data) {
      const mapped = data.map(p => {
        let st = p.status === 'active' ? 'ongoing' : (p.status === 'paused' ? 'draft' : 'completed');
        
        let desc = p.description || '';
        let capacityMatch = desc.match(/Capacity:\s*([^\n]+)/);
        let durationMatch = desc.match(/Duration:\s*([^\n]+)/);
        
        let displayCap = capacityMatch ? capacityMatch[1] : 'N/A';
        let displayDur = durationMatch ? durationMatch[1] : 'N/A';
        let cleanDesc = desc.replace(/Capacity:[^\n]+\nDuration:[^\n]+\n\n/, '');

        let parts = displayDur.split(' - ');

        return {
          id: p.id,
          title: p.name,
          client: p.client_name || 'N/A',
          location: p.location || 'N/A',
          capacity: displayCap,
          start: parts[0] || '',
          end: parts[1] || '',
          status: st,
          description: cleanDesc,
          category: p.category || 'Residential Solar',
          image_url: p.image_url,
          image_path: p.image_path
        };
      });
      setProjects(mapped);
    }
    setLoading(false);
  }

  const [search, setSearch]     = useState('');
  const [stFilter, setSt]       = useState('All');
  const [modal, setModal]       = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [viewItem, setViewItem] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    const matchSt = stFilter === 'All' || p.status === stFilter;
    return matchSearch && matchSt;
  });

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit   = (p) => { setEditItem(p); setForm({ title: p.title, client: p.client, location: p.location, capacity: p.capacity, category: p.category || 'Residential Solar', status: p.status, start: p.start, end: p.end, description: p.description, image_url: p.image_url || null, image_path: p.image_path || null }); setModal(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    
    let dbStatus = form.status === 'ongoing' ? 'active' : (form.status === 'draft' ? 'paused' : 'completed');
    const projectData = {
      name: form.title,
      client_name: form.client,
      location: form.location,
      status: dbStatus,
      category: form.category,
      description: `Capacity: ${form.capacity}\nDuration: ${form.start} - ${form.end}\n\n${form.description}`,
      image_url: form.image_url,
      image_path: form.image_path
    };

    if (editItem) {
      const { data, error } = await updateProject(editItem.id, projectData);
      if (!error && data) {
        setProjects(prev => prev.map(p => p.id === editItem.id ? { ...p, ...form } : p));
      }
    } else {
      const { data, error } = await createProject(projectData);
      if (!error && data) {
        setProjects(prev => [{ ...form, id: data.id, status: form.status }, ...prev]);
      }
    }
    setModal(false);
  };

  const handleDelete = async () => {
    const { error } = await deleteProject(delTarget.id);
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== delTarget.id));
    }
    setDelTarget(null);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." style={{ ...inputStyle, paddingLeft: '2.2rem', width: '220px' }} />
          </div>
          <select value={stFilter} onChange={e => setSt(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            {['All', 'completed', 'ongoing', 'draft'].map(s => <option key={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.2rem', background: '#FDB813', color: '#071B3B', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={17} /> Add Project
        </button>
      </div>

      {/* Grid of project cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filtered.length === 0 ? (
          <p style={{ color: '#94A3B8', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>No projects match your filters.</p>
        ) : filtered.map(p => (
          <div key={p.id} style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
            {p.image_url ? (
              <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: p.status === 'completed' ? '#22C55E' : p.status === 'ongoing' ? '#3B82F6' : '#FDB813' }} />
              </div>
            ) : (
              <div style={{ height: '6px', background: p.status === 'completed' ? '#22C55E' : p.status === 'ongoing' ? '#3B82F6' : '#FDB813' }} />
            )}
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#071B3B', lineHeight: 1.3, flex: 1 }}>{p.title}</h3>
                <StatusBadge status={p.status} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span>📁 Category: <strong>{p.category}</strong></span>
                <span>👤 {p.client}</span>
                <span>📍 {p.location}</span>
                <span>⚡ Capacity: <strong>{p.capacity}</strong></span>
                <span>📅 {p.start} – {p.end}</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#94A3B8', lineHeight: 1.5, marginTop: 'auto' }}>{p.description}</p>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => openEdit(p)} style={{ flex: 1, padding: '0.45rem', background: '#F1F5F9', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                <Edit3 size={13} /> Edit
              </button>
              <button onClick={() => setViewItem(p)} style={{ flex: 1, padding: '0.45rem', background: '#EFF6FF', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                <Eye size={13} /> View
              </button>
              <button onClick={() => setDelTarget(p)} style={{ padding: '0.45rem 0.7rem', background: '#FEE2E2', border: 'none', borderRadius: '7px', cursor: 'pointer', color: '#EF4444' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }} onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ width: '100%', maxWidth: '520px', background: '#fff', height: '100%', overflowY: 'auto', padding: '2rem', boxShadow: '-8px 0 32px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#071B3B' }}>{editItem ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={22} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[['Project Title *', 'title', 'text', 'e.g. Ikeja Industrial Solar'], ['Client Name', 'client', 'text', 'Client or company name'], ['Location', 'location', 'text', 'City, State'], ['Capacity', 'capacity', 'text', 'e.g. 50kW']].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>{label}</label>
                  <input style={inputStyle} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Category *</label>
                <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="Residential Solar">Residential Solar</option>
                  <option value="Commercial Solar">Commercial Solar</option>
                  <option value="Battery Storage">Battery Storage</option>
                  <option value="Maintenance & Repair">Maintenance & Repair</option>
                  <option value="Solar Consultation">Solar Consultation</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Start Date</label>
                  <input style={inputStyle} type="text" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} placeholder="Jan 2024" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>End Date</label>
                  <input style={inputStyle} type="text" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} placeholder="Mar 2024" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Description</label>
                <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief project description..." />
              </div>
              
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Project Image</label>
                <ImageUpload 
                  type="project" 
                  currentUrl={form.image_url} 
                  onUpload={({ url, path }) => setForm(f => ({ ...f, image_url: url, image_path: path }))} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: '0.7rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 1, padding: '0.7rem', background: '#FDB813', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#071B3B' }}>{editItem ? 'Update Project' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '520px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#071B3B' }}>{viewItem.title}</h3>
              <button onClick={() => setViewItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
              <div><strong>Category:</strong> {viewItem.category}</div>
              <div><strong>Client:</strong> {viewItem.client}</div>
              <div><strong>Location:</strong> {viewItem.location}</div>
              <div><strong>Capacity:</strong> {viewItem.capacity}</div>
              <div><strong>Duration:</strong> {viewItem.start} – {viewItem.end}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><strong>Status:</strong> <StatusBadge status={viewItem.status} /></div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem', marginTop: '0.25rem' }}>{viewItem.description}</div>
            </div>
            <button onClick={() => setViewItem(null)} style={{ width: '100%', padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Close</button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontWeight: 700, color: '#071B3B', marginBottom: '0.5rem' }}>Delete Project?</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Delete <strong>"{delTarget.title}"</strong>? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDelTarget(null)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '0.65rem', background: '#EF4444', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#fff' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
