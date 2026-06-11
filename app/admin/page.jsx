'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  FolderKanban,
  Receipt,
  Inbox,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Package,
  Eye,
  Trash2,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';

import { getProducts } from '@/services/products.service';
import { getProjects } from '@/services/projects.service';
import { getOrders, updateOrder, deleteOrder } from '@/services/orders.service';
import { getLeads, updateLead, deleteLead } from '@/services/leads.service';

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: '#FFF3CD', color: '#856404' },
  confirmed: { label: 'Confirmed', bg: '#D1ECF1', color: '#0C5460' },
  shipped: { label: 'Shipped', bg: '#CCE5FF', color: '#004085' },
  delivered: { label: 'Delivered', bg: '#D4EDDA', color: '#155724' },
  cancelled: { label: 'Cancelled', bg: '#F8D7DA', color: '#721C24' },
  new: { label: 'New', bg: '#E9D5FF', color: '#6B21A8' },
  contacted: { label: 'Contacted', bg: '#DBEAFE', color: '#1E40AF' },
  qualified: { label: 'Qualified', bg: '#D1FAE5', color: '#065F46' },
  lost: { label: 'Lost', bg: '#FEE2E2', color: '#991B1B' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#F1F5F9', color: '#475569' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 700,
      backgroundColor: cfg.bg,
      color: cfg.color,
      textTransform: 'capitalize',
      letterSpacing: '0.2px'
    }}>
      {cfg.label}
    </span>
  );
}

function formatNGN(val) {
  return '₦' + Number(val).toLocaleString('en-NG');
}

function formatCompactNGN(val) {
  if (val >= 1000000) return '₦' + (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return '₦' + (val / 1000).toFixed(1) + 'K';
  return '₦' + val.toLocaleString('en-NG');
}

function formatOrderId(id) {
  if (!id) return '';
  if (id.includes('-') && id.length > 8) {
    return 'ORD-' + id.split('-')[0].toUpperCase();
  }
  return id;
}

function formatAddress(address) {
  if (!address) return '';
  if (typeof address === 'object') {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.delivery_method ? `Method: ${address.delivery_method}` : null
    ].filter(Boolean);
    return parts.join(', ');
  }
  return address;
}

function getRelativeTime(dateString) {
  if (!dateString) return 'N/A';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

const inputStyle = { 
  width: '100%', 
  padding: '0.6rem 0.75rem', 
  border: '1px solid #CBD5E1', 
  borderRadius: '8px', 
  fontSize: '0.875rem', 
  color: '#071B3B', 
  outline: 'none', 
  boxSizing: 'border-box', 
  fontFamily: 'inherit' 
};

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive Modal State
  const [viewOrder, setViewOrder] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [deleteOrderTarget, setDeleteOrderTarget] = useState(null);
  const [deleteLeadTarget, setDeleteLeadTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Edit forms inside modals
  const [editOrderStatus, setEditOrderStatus] = useState('');
  const [editLeadStatus, setEditLeadStatus] = useState('');
  const [editLeadNotes, setEditLeadNotes] = useState('');

  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    fetchData();
    determineGreeting();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, projRes, ordRes, leadRes] = await Promise.all([
        getProducts({ limit: 1000 }),
        getProjects({ limit: 1000 }),
        getOrders({ limit: 1000 }),
        getLeads({ limit: 1000 }),
      ]);

      if (prodRes.error || projRes.error || ordRes.error || leadRes.error) {
        throw new Error('One or more services failed to load data.');
      }

      setProducts(prodRes.data || []);
      setProjects(projRes.data || []);
      setOrders(ordRes.data || []);
      setLeads(leadRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to sync dashboard data with Supabase. Check database connections.');
    } finally {
      setLoading(false);
    }
  }

  function determineGreeting() {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good morning ☀️');
    else if (hr < 17) setGreeting('Good afternoon 🌤️');
    else setGreeting('Good evening 🌙');
  }

  // --- Calculate Dynamic Metrics ---
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Products added this month
  const productsThisMonth = products.filter(p => {
    if (!p.created_at) return false;
    const d = new Date(p.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  // Projects added this month
  const projectsThisMonth = projects.filter(p => {
    if (!p.created_at) return false;
    const d = new Date(p.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  // Orders added in last 7 days
  const ordersThisWeek = orders.filter(o => {
    if (!o.created_at) return false;
    const diffMs = now - new Date(o.created_at);
    return diffMs <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Leads added today (last 24 hours)
  const leadsToday = leads.filter(l => {
    if (!l.created_at) return false;
    const diffMs = now - new Date(l.created_at);
    return diffMs <= 24 * 60 * 60 * 1000;
  }).length;

  // Revenue this month: sum of all non-cancelled orders created this month
  const monthlyRevenue = orders
    .filter(o => {
      if (o.status === 'cancelled' || !o.created_at) return false;
      const d = new Date(o.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, o) => sum + (o.total_amount || o.amount || 0), 0);

  // Order Completion Rate: shipped/delivered / active orders (all non-cancelled)
  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const completedOrders = activeOrders.filter(o => o.status === 'delivered' || o.status === 'shipped');
  const completionRate = activeOrders.length > 0 
    ? Math.round((completedOrders.length / activeOrders.length) * 100)
    : 100;

  // Action checklist counts
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const draftProjectsCount = projects.filter(p => p.status === 'draft').length;

  // Recent lists
  const recentOrders = [...orders].slice(0, 5);
  const recentLeads = [...leads].slice(0, 4);

  // --- Modal handlers ---
  const handleOpenOrderModal = (order) => {
    setViewOrder(order);
    setEditOrderStatus(order.status || 'pending');
  };

  const handleSaveOrderStatus = async () => {
    if (!viewOrder) return;
    setSaving(true);
    const { error: err } = await updateOrder(viewOrder.id, { status: editOrderStatus });
    if (!err) {
      setOrders(prev => prev.map(o => o.id === viewOrder.id ? { ...o, status: editOrderStatus } : o));
      setViewOrder(null);
    } else {
      console.error('Failed to update status:', err);
    }
    setSaving(false);
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderTarget) return;
    const { error: err } = await deleteOrder(deleteOrderTarget.id);
    if (!err) {
      setOrders(prev => prev.filter(o => o.id !== deleteOrderTarget.id));
    } else {
      console.error('Failed to delete order:', err);
    }
    setDeleteOrderTarget(null);
  };

  const handleOpenLeadModal = (lead) => {
    setViewLead(lead);
    setEditLeadStatus(lead.status || 'new');
    setEditLeadNotes(lead.notes || '');
  };

  const handleSaveLead = async () => {
    if (!viewLead) return;
    setSaving(true);
    const { error: err } = await updateLead(viewLead.id, {
      status: editLeadStatus,
      notes: editLeadNotes
    });
    if (!err) {
      setLeads(prev => prev.map(l => l.id === viewLead.id ? { ...l, status: editLeadStatus, notes: editLeadNotes } : l));
      setViewLead(null);
    } else {
      console.error('Failed to update lead:', err);
    }
    setSaving(false);
  };

  const handleDeleteLead = async () => {
    if (!deleteLeadTarget) return;
    const { error: err } = await deleteLead(deleteLeadTarget.id);
    if (!err) {
      setLeads(prev => prev.filter(l => l.id !== deleteLeadTarget.id));
    } else {
      console.error('Failed to delete lead:', err);
    }
    setDeleteLeadTarget(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#FDB813', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748B', fontWeight: 500, fontSize: '0.9rem' }}>Synchronizing real-time dashboard data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#EF4444" />
        <h3 style={{ color: '#071B3B', fontWeight: 700, fontSize: '1.25rem' }}>Connection Error</h3>
        <p style={{ color: '#64748B', maxWidth: '400px', fontSize: '0.9rem', lineHeight: 1.5 }}>{error}</p>
        <button 
          onClick={fetchData} 
          style={{ padding: '0.6rem 1.25rem', background: '#FDB813', border: 'none', borderRadius: '8px', color: '#071B3B', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} /> Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>

      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #071B3B 0%, #0f2d5e 60%, #102B5C 100%)',
        color: '#fff',
        padding: '2rem 2.5rem',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(7,27,59,0.2)'
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(253,184,19,0.07)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '30%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(34,197,94,0.05)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>
              {greeting}
            </p>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FDB813', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
              Welcome back, Justice
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.925rem', maxWidth: '520px', lineHeight: 1.6 }}>
              You have <strong style={{ color: '#FDB813' }}>{pendingOrdersCount} pending orders</strong> and <strong style={{ color: '#22C55E' }}>{newLeadsCount} new leads</strong> since your last login. Here's your solar business at a glance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'center', padding: '1rem 1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FDB813' }}>{formatCompactNGN(monthlyRevenue)}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Revenue this month</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22C55E' }}>{completionRate}%</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>Order Completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Products Catalog', count: products.length, change: productsThisMonth > 0 ? `+${productsThisMonth} this month` : '0 added this month', trend: 'up', color: '#FDB813', bg: '#FFF9E6', icon: ShoppingBag, path: '/admin/products' },
          { label: 'Portfolio Projects', count: projects.length, change: projectsThisMonth > 0 ? `+${projectsThisMonth} this month` : '0 added this month', trend: 'up', color: '#22C55E', bg: '#F0FDF4', icon: FolderKanban, path: '/admin/projects' },
          { label: 'Store Orders', count: orders.length, change: ordersThisWeek > 0 ? `+${ordersThisWeek} this week` : '0 added this week', trend: 'up', color: '#3B82F6', bg: '#EFF6FF', icon: Receipt, path: '/admin/orders' },
          { label: 'Contact Leads', count: leads.length, change: leadsToday > 0 ? `+${leadsToday} today` : '0 new today', trend: 'up', color: '#8B5CF6', bg: '#F5F3FF', icon: Inbox, path: '/admin/leads' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.path} href={card.path} style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={card.color} strokeWidth={2} />
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', color: '#22C55E', fontWeight: 600 }}>
                    <TrendingUp size={11} /> {card.change}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.2rem' }}>{card.label}</div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#071B3B', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{card.count}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: card.color, fontWeight: 600, borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem' }}>
                  Manage <ArrowRight size={13} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two-column: Recent Orders + Recent Leads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

        {/* Recent Orders */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={16} color="#3B82F6" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#071B3B' }}>Recent Orders</h3>
            </div>
            <Link href="/admin/orders" style={{ fontSize: '0.78rem', color: '#FDB813', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {recentOrders.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>No orders placed yet.</div>
            ) : recentOrders.map((order, idx) => (
              <div key={order.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.9rem 1.5rem',
                borderBottom: idx < recentOrders.length - 1 ? '1px solid #F8FAFC' : 'none',
                transition: 'background 0.15s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem', fontWeight: 700, color: '#3B82F6' }}>
                  {(order.customer_name || order.customer || 'C').charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#071B3B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.customer_name || order.customer}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{formatOrderId(order.id)} · {getRelativeTime(order.created_at || order.date)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#071B3B' }}>{formatNGN(order.total_amount || order.amount)}</div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button onClick={() => handleOpenOrderModal(order)} style={{ padding: '0.3rem 0.45rem', background: '#EFF6FF', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#3B82F6' }} title="View"><Eye size={13} /></button>
                    <button onClick={() => setDeleteOrderTarget(order)} style={{ padding: '0.3rem 0.45rem', background: '#FEE2E2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }} title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox size={16} color="#8B5CF6" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#071B3B' }}>Recent Leads</h3>
            </div>
            <Link href="/admin/leads" style={{ fontSize: '0.78rem', color: '#FDB813', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {recentLeads.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>No leads received yet.</div>
            ) : recentLeads.map((lead, idx) => (
              <div key={lead.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.9rem 1.5rem',
                borderBottom: idx < recentLeads.length - 1 ? '1px solid #F8FAFC' : 'none',
                transition: 'background 0.15s ease'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem', fontWeight: 700, color: '#8B5CF6' }}>
                  {(lead.name || 'L').charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#071B3B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{lead.source || 'Website'} · {getRelativeTime(lead.created_at || lead.time)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  <StatusBadge status={lead.status} />
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button onClick={() => handleOpenLeadModal(lead)} style={{ padding: '0.3rem 0.45rem', background: '#F5F3FF', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#8B5CF6' }} title="View & Edit"><Eye size={13} /></button>
                    <button onClick={() => setDeleteLeadTarget(lead)} style={{ padding: '0.3rem 0.45rem', background: '#FEE2E2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }} title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Checklist Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
            <Package size={16} color="#FDB813" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#071B3B' }}>Products Checklist</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              'Upload high-quality images under 2MB',
              'Toggle status to Published to go live on shop',
              'Keep stock counts updated to prevent overselling',
              'Add proper category tags for easy filtering',
            ].map((tip, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: '#475569' }}>
                <CheckCircle2 size={15} color="#FDB813" style={{ flexShrink: 0, marginTop: '1px' }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
            <FolderKanban size={16} color="#22C55E" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#071B3B' }}>Portfolio Checklist</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              'Showcase completed installations with location info',
              'Include client names & scope to build credibility',
              'Add before/after photos for stronger social proof',
              'Set project dates to order correctly in the timeline',
            ].map((tip, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: '#475569' }}>
                <CheckCircle2 size={15} color="#22C55E" style={{ flexShrink: 0, marginTop: '1px' }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
            <AlertCircle size={16} color="#EF4444" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#071B3B' }}>Action Required</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { text: `${pendingOrdersCount} orders awaiting confirmation`, color: '#EF4444' },
              { text: `${newLeadsCount} new unread lead inquiries`, color: '#8B5CF6' },
              { text: `${lowStockCount} products running low on stock`, color: '#F59E0B' },
              { text: `${draftProjectsCount} project drafts need publishing`, color: '#3B82F6' },
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: '#475569' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0, marginTop: '5px' }} />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* --- MODAL: View/Update Order --- */}
      {viewOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '600px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#071B3B' }}>Order Details</h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'monospace' }}>{viewOrder.id}</span>
              </div>
              <button onClick={() => setViewOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>CUSTOMER</p>
                <p style={{ fontWeight: 700, color: '#071B3B' }}>{viewOrder.customer_name || viewOrder.customer}</p>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>{viewOrder.customer_email || viewOrder.email}</p>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>{viewOrder.customer_phone || viewOrder.phone}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>ORDER INFO</p>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>Date: <strong>{new Date(viewOrder.created_at || viewOrder.date).toLocaleString('en-NG')}</strong></p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>Status:</span>
                  <select value={editOrderStatus} onChange={e => setEditOrderStatus(e.target.value)} style={{ padding: '0.2rem 0.5rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', color: '#071B3B', cursor: 'pointer' }}>
                    {['pending','confirmed','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.75rem' }}>ITEMS PURCHASED</p>
              {viewOrder.items && viewOrder.items.map((item, i) => {
                const qty = item.qty || item.quantity || 1;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: '1px dashed #F1F5F9' }}>
                    <span>{item.name} <span style={{ color: '#94A3B8' }}>×{qty}</span></span>
                    <strong>{formatNGN(item.price * qty)}</strong>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: '#071B3B', marginTop: '0.75rem' }}>
                <span>Total</span><span>{formatNGN(viewOrder.total_amount || viewOrder.amount)}</span>
              </div>
            </div>
            {(viewOrder.shipping_address || viewOrder.address) && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.3rem' }}>SHIPPING ADDRESS</p>
                <p style={{ fontSize: '0.875rem', color: '#475569' }}>{formatAddress(viewOrder.shipping_address || viewOrder.address)}</p>
              </div>
            )}
            {viewOrder.notes && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 600, marginBottom: '0.2rem' }}>CUSTOMER NOTES</p>
                <p style={{ fontSize: '0.875rem', color: '#78350F' }}>{viewOrder.notes}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
              <button onClick={() => setViewOrder(null)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button
                onClick={handleSaveOrderStatus}
                disabled={saving}
                style={{ flex: 1, padding: '0.65rem', background: '#FDB813', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#071B3B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Delete Order Confirm --- */}
      {deleteOrderTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontWeight: 700, color: '#071B3B', marginBottom: '0.5rem' }}>Delete Order?</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Remove order <strong>{formatOrderId(deleteOrderTarget.id)}</strong> from <strong>{deleteOrderTarget.customer_name || deleteOrderTarget.customer}</strong>? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeleteOrderTarget(null)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button onClick={handleDeleteOrder} style={{ flex: 1, padding: '0.65rem', background: '#EF4444', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#fff' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: View/Update Lead --- */}
      {viewLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '580px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#071B3B' }}>Lead Details</h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Received: {new Date(viewLead.created_at || viewLead.time).toLocaleString('en-NG')}</span>
              </div>
              <button onClick={() => setViewLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <tbody>
                {[
                  ['Name',   viewLead.name],
                  ['Email',  <a key="e" href={`mailto:${viewLead.email}`} style={{ color: '#FDB813', fontWeight: 600 }}>{viewLead.email}</a>],
                  ['Phone',  viewLead.phone || '—'],
                  ['Source', viewLead.source || '—'],
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
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>{viewLead.message || '(no message provided)'}</p>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Lead Status</label>
              <select value={editLeadStatus} onChange={e => setEditLeadStatus(e.target.value)} style={{ ...inputStyle, width: '200px' }}>
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
                value={editLeadNotes}
                onChange={e => setEditLeadNotes(e.target.value)}
                placeholder="Add notes about this lead..."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
              <button onClick={() => setViewLead(null)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>
                Cancel
              </button>
              <button
                onClick={handleSaveLead}
                disabled={saving}
                style={{ flex: 1, padding: '0.65rem', background: '#FDB813', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#071B3B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Delete Lead Confirm --- */}
      {deleteLeadTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontWeight: 700, color: '#071B3B', marginBottom: '0.5rem' }}>Delete Lead?</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Remove lead from <strong>"{deleteLeadTarget.name}"</strong>? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeleteLeadTarget(null)} style={{ flex: 1, padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button onClick={handleDeleteLead} style={{ flex: 1, padding: '0.65rem', background: '#EF4444', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#fff' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
