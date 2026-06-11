'use client';

import { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Info, Settings, Bell, Shield, Globe, Loader2, RefreshCw } from 'lucide-react';
import {
  getSettings,
  upsertSetting,
  deleteSetting,
} from '@/services/settings.service';

const PROFILE_FIELDS = [
  { label: 'Full Name',     key: 'name',  placeholder: 'Justice Georgenes' },
  { label: 'Email Address', key: 'email', placeholder: 'admin@justicesolar.com' },
  { label: 'Phone Number',  key: 'phone', placeholder: '+234 801 000 1234' },
  { label: 'Role',          key: 'role',  placeholder: 'Super Admin' },
];

const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem',
  border: '1px solid #CBD5E1', borderRadius: '8px',
  fontSize: '0.875rem', color: '#071B3B', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
  background: '#fff',
};

function SectionHeader({ icon: Icon, iconColor, title, description }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: iconColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={iconColor} />
      </div>
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#071B3B', marginBottom: '0.15rem' }}>{title}</h3>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{description}</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  // ── Supabase settings state ──────────────────────────────────────────────
  const [settings, setSettings]   = useState([]);
  const [loadingDB, setLoadingDB] = useState(true);
  const [dbError, setDbError]     = useState(null);
  const [saving, setSaving]       = useState({});     // { [key]: true } while saving
  const [saved, setSaved]         = useState({});     // { [key]: true } flash
  const [deleting, setDeleting]   = useState(null);   // key being deleted
  const [delTarget, setDelTarget] = useState(null);   // { key, value, ... } confirm dialog

  // Local edits buffer — keyed by setting key
  const [edits, setEdits] = useState({});

  // New setting form
  const [newKey,  setNewKey]  = useState('');
  const [newVal,  setNewVal]  = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  // ── Profile (local-only for now) ─────────────────────────────────────────
  const [profile, setProfile]         = useState({ name: 'Justice Georgenes', email: 'admin@justicesolar.com', phone: '+234 801 000 1234', role: 'Super Admin' });
  const [profileSaved, setProfileSaved] = useState(false);

  // ── Notifications (local-only for now) ───────────────────────────────────
  const [notifications, setNotifications] = useState({ newOrders: true, newLeads: true, lowStock: true, weeklyReport: false });

  // ── Load settings from Supabase ───────────────────────────────────────────
  async function loadSettings() {
    setLoadingDB(true);
    setDbError(null);
    const { data, error } = await getSettings();
    if (error) {
      setDbError('Failed to load settings from database.');
      console.error('Settings load error:', error);
    } else {
      setSettings(data || []);
      // Seed the edits buffer with current DB values
      const buf = {};
      (data || []).forEach(s => { buf[s.key] = s.value ?? ''; });
      setEdits(buf);
    }
    setLoadingDB(false);
  }

  useEffect(() => { loadSettings(); }, []);

  // ── Save a single setting to Supabase ────────────────────────────────────
  const handleSave = async (key, description) => {
    const value = edits[key] ?? '';
    setSaving(prev => ({ ...prev, [key]: true }));
    const { error } = await upsertSetting(key, value, description);
    if (!error) {
      // Update local settings list
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
      setSaved(prev => ({ ...prev, [key]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000);
    } else {
      console.error('Failed to save setting:', error);
    }
    setSaving(prev => ({ ...prev, [key]: false }));
  };

  // ── Delete a setting from Supabase ───────────────────────────────────────
  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(delTarget.key);
    const { error } = await deleteSetting(delTarget.key);
    if (!error) {
      setSettings(prev => prev.filter(s => s.key !== delTarget.key));
      setEdits(prev => { const next = { ...prev }; delete next[delTarget.key]; return next; });
    } else {
      console.error('Failed to delete setting:', error);
    }
    setDeleting(null);
    setDelTarget(null);
  };

  // ── Add a new setting ─────────────────────────────────────────────────────
  const handleAddSetting = async () => {
    const cleanKey = newKey.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanKey) return;
    setAddingNew(true);
    const { data, error } = await upsertSetting(cleanKey, newVal, newDesc);
    if (!error) {
      // Reload so we get the full row including created_at etc.
      await loadSettings();
      setNewKey(''); setNewVal(''); setNewDesc('');
    } else {
      console.error('Failed to add setting:', error);
    }
    setAddingNew(false);
  };

  const handleProfileSave = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

      {/* ── Left Column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Profile Settings */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <SectionHeader icon={Shield} iconColor="#FDB813" title="Admin Profile" description="Manage your account information." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PROFILE_FIELDS.map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>{f.label}</label>
                <input style={inputStyle} value={profile[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>New Password</label>
              <input style={inputStyle} type="password" placeholder="Leave blank to keep current password" />
            </div>
            <button onClick={handleProfileSave} style={{ padding: '0.65rem', background: profileSaved ? '#22C55E' : '#FDB813', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: profileSaved ? '#fff' : '#071B3B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s' }}>
              <Save size={16} /> {profileSaved ? 'Saved ✓' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <SectionHeader icon={Bell} iconColor="#3B82F6" title="Notifications" description="Control what alerts you receive." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { key: 'newOrders',    label: 'New order placed',      desc: 'Alert when a customer places an order' },
              { key: 'newLeads',     label: 'New lead received',      desc: 'Alert when a contact form is submitted' },
              { key: 'lowStock',     label: 'Low stock warning',      desc: 'Alert when product stock falls below 5' },
              { key: 'weeklyReport', label: 'Weekly summary report',  desc: 'Receive a weekly digest every Monday' },
            ].map(n => (
              <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#071B3B' }}>{n.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{n.desc}</div>
                </div>
                <div
                  onClick={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key] }))}
                  style={{ width: '42px', height: '24px', borderRadius: '12px', background: notifications[n.key] ? '#22C55E' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', top: '3px', left: notifications[n.key] ? '21px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Right Column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Global Settings — Supabase connected */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#8B5CF618', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Globe size={18} color="#8B5CF6" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#071B3B', marginBottom: '0.15rem' }}>Global Configurations</h3>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Key-value settings persisted in Supabase.</p>
              </div>
            </div>
            <button
              onClick={loadSettings}
              disabled={loadingDB}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', background: '#F1F5F9', border: 'none', borderRadius: '7px', cursor: loadingDB ? 'not-allowed' : 'pointer', color: '#475569', fontSize: '0.78rem', fontWeight: 600 }}
            >
              <RefreshCw size={13} style={{ animation: loadingDB ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Error banner */}
          {dbError && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#991B1B', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{dbError}</span>
              <button onClick={loadSettings} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Retry</button>
            </div>
          )}

          {/* Loading skeleton */}
          {loadingDB ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', gap: '0.5rem', color: '#94A3B8', fontSize: '0.875rem' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading settings from database…
            </div>
          ) : settings.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem', padding: '2rem' }}>
              No settings found. Add one below.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {settings.map(s => (
                <div key={s.key} style={{ paddingBottom: '1.25rem', borderBottom: '1px solid #F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#071B3B', fontSize: '0.875rem', background: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>{s.key}</code>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleSave(s.key, s.description)}
                        disabled={saving[s.key]}
                        style={{ padding: '0.3rem 0.7rem', background: saved[s.key] ? '#22C55E' : '#FDB813', border: 'none', borderRadius: '6px', cursor: saving[s.key] ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 700, color: saved[s.key] ? '#fff' : '#071B3B', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s' }}
                      >
                        {saving[s.key] ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={12} />}
                        {saved[s.key] ? 'Saved ✓' : saving[s.key] ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setDelTarget(s)}
                        disabled={!!deleting}
                        style={{ padding: '0.3rem 0.45rem', background: '#FEE2E2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <input
                    style={inputStyle}
                    value={edits[s.key] ?? s.value ?? ''}
                    onChange={e => setEdits(prev => ({ ...prev, [s.key]: e.target.value }))}
                  />
                  {s.description && <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>{s.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Config */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <SectionHeader icon={Settings} iconColor="#22C55E" title="Add Configuration Key" description="Create a new setting key-value pair in Supabase." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Setting Key *</label>
              <input style={inputStyle} value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="e.g. support_phone_number" />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Value</label>
              <input style={inputStyle} value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="e.g. +234 900 000 0000" />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Description</label>
              <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What does this setting control?" />
            </div>
            <button
              onClick={handleAddSetting}
              disabled={addingNew || !newKey.trim()}
              style={{ padding: '0.65rem', background: '#071B3B', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: addingNew || !newKey.trim() ? 'not-allowed' : 'pointer', color: '#FDB813', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', opacity: !newKey.trim() ? 0.6 : 1 }}
            >
              {addingNew ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
              {addingNew ? 'Saving…' : 'Add Setting Key'}
            </button>
          </div>
        </div>

        {/* Info notice */}
        <div style={{ display: 'flex', gap: '0.75rem', background: '#F0F4FF', border: '1px solid #C7D2FE', borderRadius: '12px', padding: '1rem', alignItems: 'flex-start' }}>
          <Info size={18} color="#4F46E5" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '0.8rem', color: '#4338CA', lineHeight: 1.5 }}>
            <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Settings Store Guide</strong>
            These configs are persisted in Supabase and read by the main website to adjust content (promo banners, VAT, contact info) without redeploying code.
          </div>
        </div>

      </div>

      {/* Delete Confirm Modal */}
      {delTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontWeight: 700, color: '#071B3B', marginBottom: '0.5rem' }}>Delete Setting?</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Remove key <code style={{ background: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{delTarget.key}</code> from Supabase? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDelTarget(null)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button
                onClick={handleDelete}
                disabled={!!deleting}
                style={{ flex: 1, padding: '0.65rem', background: '#EF4444', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                {deleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
