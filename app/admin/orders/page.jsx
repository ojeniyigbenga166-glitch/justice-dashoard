'use client';

import { useState, useEffect } from 'react';
import { Eye, Trash2, X, Search, Receipt, Loader2 } from 'lucide-react';
import { getOrders, updateOrder, deleteOrder } from '@/services/orders.service';

const STATUS_STYLE = {
  pending:   { bg: '#FFF3CD', color: '#856404', label: 'Pending' },
  confirmed: { bg: '#D1ECF1', color: '#0C5460', label: 'Confirmed' },
  shipped:   { bg: '#CCE5FF', color: '#004085', label: 'Shipped' },
  delivered: { bg: '#D4EDDA', color: '#155724', label: 'Delivered' },
  cancelled: { bg: '#F8D7DA', color: '#721C24', label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? { bg: '#F1F5F9', color: '#475569', label: status };
  return <span style={{ padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: s.bg, color: s.color, textTransform: 'capitalize' }}>{s.label}</span>;
}

function formatNGN(v) { return '₦' + Number(v).toLocaleString('en-NG'); }
function formatDate(d) { 
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); 
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

const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.875rem', color: '#071B3B', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

export default function OrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [stFilter, setSt]       = useState('All');
  const [viewItem, setViewItem] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const { data } = await getOrders();
    if (data) {
      setOrders(data);
    }
    setLoading(false);
  }

  const filtered = orders.filter(o => {
    const customerName = o.customer_name || o.customer || '';
    const orderId = o.id || '';
    const matchSearch = customerName.toLowerCase().includes(search.toLowerCase()) || orderId.toLowerCase().includes(search.toLowerCase());
    const matchSt = stFilter === 'All' || o.status === stFilter;
    return matchSearch && matchSt;
  });

  const handleDelete = async () => {
    if (!delTarget) return;
    const { error } = await deleteOrder(delTarget.id);
    if (!error) {
      setOrders(prev => prev.filter(o => o.id !== delTarget.id));
    } else {
      console.error('Failed to delete order:', error);
    }
    setDelTarget(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!viewItem) return;
    const { error } = await updateOrder(viewItem.id, { status: newStatus });
    if (!error) {
      setOrders(prev => prev.map(o => o.id === viewItem.id ? { ...o, status: newStatus } : o));
      setViewItem(v => ({ ...v, status: newStatus }));
    } else {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{ ...inputStyle, paddingLeft: '2.2rem', width: '220px' }} />
          </div>
          <select value={stFilter} onChange={e => setSt(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            {['All', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{filtered.length} orders found</div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Receipt size={16} color="#3B82F6" />
          <span style={{ fontWeight: 700, color: '#071B3B', fontSize: '0.95rem' }}>Customer Orders</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                {['Order ID','Customer','Date','Total Amount','Status','Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>No orders match your filters.</td></tr>
              ) : filtered.map((o, idx) => (
                <tr key={o.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F8FAFC' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: '#071B3B', fontFamily: 'monospace', fontSize: '0.8rem' }}>{formatOrderId(o.id)}</td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: '#071B3B' }}>{o.customer_name || o.customer}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{o.customer_email || o.email}</div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: '#64748B', whiteSpace: 'nowrap' }}>{formatDate(o.created_at || o.date)}</td>
                  <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#071B3B' }}>{formatNGN(o.total_amount || o.amount)}</td>
                  <td style={{ padding: '0.9rem 1.25rem' }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => setViewItem(o)} style={{ padding: '0.35rem 0.55rem', background: '#EFF6FF', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#3B82F6' }} title="View"><Eye size={14} /></button>
                      <button onClick={() => setDelTarget(o)} style={{ padding: '0.35rem 0.55rem', background: '#FEE2E2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View/Update Order Modal */}
      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '600px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#071B3B' }}>Order Details</h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'monospace' }}>{viewItem.id}</span>
              </div>
              <button onClick={() => setViewItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>CUSTOMER</p>
                <p style={{ fontWeight: 700, color: '#071B3B' }}>{viewItem.customer_name || viewItem.customer}</p>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>{viewItem.customer_email || viewItem.email}</p>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>{viewItem.customer_phone || viewItem.phone}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>ORDER INFO</p>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>Date: <strong>{formatDate(viewItem.created_at || viewItem.date)}</strong></p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>Status:</span>
                  <select value={viewItem.status} onChange={e => handleStatusChange(e.target.value)} style={{ padding: '0.2rem 0.5rem', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', color: '#071B3B', cursor: 'pointer' }}>
                    {['pending','confirmed','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.75rem' }}>ITEMS PURCHASED</p>
              {viewItem.items && viewItem.items.map((item, i) => {
                const qty = item.qty || item.quantity || 1;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: '1px dashed #F1F5F9' }}>
                    <span>{item.name} <span style={{ color: '#94A3B8' }}>×{qty}</span></span>
                    <strong>{formatNGN(item.price * qty)}</strong>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: '#071B3B', marginTop: '0.75rem' }}>
                <span>Total</span><span>{formatNGN(viewItem.total_amount || viewItem.amount)}</span>
              </div>
            </div>
            {(viewItem.shipping_address || viewItem.address) && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.3rem' }}>SHIPPING ADDRESS</p>
                <p style={{ fontSize: '0.875rem', color: '#475569' }}>{formatAddress(viewItem.shipping_address || viewItem.address)}</p>
              </div>
            )}
            {viewItem.notes && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 600, marginBottom: '0.2rem' }}>CUSTOMER NOTES</p>
                <p style={{ fontSize: '0.875rem', color: '#78350F' }}>{viewItem.notes}</p>
              </div>
            )}
            <button onClick={() => setViewItem(null)} style={{ width: '100%', padding: '0.65rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Close</button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontWeight: 700, color: '#071B3B', marginBottom: '0.5rem' }}>Delete Order?</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Remove order <strong>{formatOrderId(delTarget.id)}</strong> from <strong>{delTarget.customer_name || delTarget.customer}</strong>? This cannot be undone.</p>
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
