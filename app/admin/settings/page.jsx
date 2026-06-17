'use client';

import { useState, useEffect } from 'react';
import { Save, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

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

const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem',
  border: '1px solid #CBD5E1', borderRadius: '8px',
  fontSize: '0.875rem', color: '#071B3B', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
  background: '#fff',
};

const disabledInputStyle = {
  ...inputStyle,
  background: '#F1F5F9',
  color: '#64748B',
  cursor: 'not-allowed',
};

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync profile details into state
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
    } else if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState({ newOrders: true, newLeads: true, lowStock: true, weeklyReport: false });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      // 1. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password,
        });
        if (passwordError) throw passwordError;
        setPassword(''); // clear password field
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

      {/* Admin Profile */}
      <form onSubmit={handleProfileSave} style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <SectionHeader icon={Shield} iconColor="#FDB813" title="Admin Profile" description="Manage your account information." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Full Name</label>
            <input 
              style={inputStyle} 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              placeholder="e.g. Justice Georgenes" 
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Email Address</label>
            <input 
              style={disabledInputStyle} 
              value={email} 
              disabled 
              placeholder="admin@justicesolar.com" 
            />
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.2rem', display: 'block' }}>Email changes can only be performed via Supabase auth settings.</span>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>New Password</label>
            <input 
              style={inputStyle} 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password" 
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{ 
              padding: '0.65rem', 
              background: '#FDB813', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 700, 
              cursor: saving ? 'not-allowed' : 'pointer', 
              color: '#071B3B', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.4rem', 
              transition: 'all 0.2s',
              opacity: saving ? 0.7 : 1
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Notification Preferences */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <SectionHeader icon={Bell} iconColor="#3B82F6" title="Notifications" description="Control what alerts you receive." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { key: 'newOrders',    label: 'New order placed',     desc: 'Alert when a customer places an order' },
            { key: 'newLeads',     label: 'New lead received',     desc: 'Alert when a contact form is submitted' },
            { key: 'lowStock',     label: 'Low stock warning',     desc: 'Alert when product stock falls below 5' },
            { key: 'weeklyReport', label: 'Weekly summary report', desc: 'Receive a weekly digest every Monday' },
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
  );
}
