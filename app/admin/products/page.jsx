'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit3, Trash2, X, Search, ShoppingBag, Tag } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/products.service';
import { upsertSetting, getSettingByKey } from '@/services/settings.service';
import ImageUpload from '@/components/admin/ImageUpload';

const DEFAULT_CATEGORIES = ['Solar Panels', 'Inverters', 'Batteries', 'Accessories'];
const STATUSES = ['All', 'published', 'draft', 'archived'];

const STATUS_STYLE = {
  published: { bg: '#D1FAE5', color: '#065F46', label: 'Published' },
  draft:     { bg: '#FEF3C7', color: '#92400E', label: 'Draft' },
  archived:  { bg: '#F1F5F9', color: '#475569', label: 'Archived' },
};

function formatNGN(v) { return '₦' + Number(v).toLocaleString('en-NG'); }

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? { bg: '#F1F5F9', color: '#475569', label: status };
  return <span style={{ padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: s.bg, color: s.color }}>{s.label}</span>;
}

const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem',
  border: '1px solid #CBD5E1', borderRadius: '8px',
  fontSize: '0.875rem', color: '#071B3B',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
};

export default function ProductsPage() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // Filter state
  const [search, setSearch]   = useState('');
  const [catFilter, setCat]   = useState('All');
  const [stFilter, setSt]     = useState('All');

  // Modal / form state
  const [modal, setModal]         = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(getEmptyForm(DEFAULT_CATEGORIES[0]));
  const [delTarget, setDelTarget] = useState(null);

  // Inline "add category" state (inside the product form)
  const [showAddCat, setShowAddCat]   = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [savingCat, setSavingCat]     = useState(false);
  const newCatRef = useRef(null);

  function getEmptyForm(defaultCat) {
    return { name: '', category: defaultCat, price: '', stock: '', status: 'draft', description: '', image_url: null, image_path: null };
  }

  // ── Load products + categories ───────────────────────────────────────────
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const { data } = await getProducts();
    if (data) setProducts(data);
    setLoading(false);
  }

  async function loadCategories() {
    const { data } = await getSettingByKey('product_categories');
    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          setForm(f => ({ ...f, category: parsed[0] }));
        }
      } catch { /* use defaults */ }
    }
  }

  async function saveCategories(updated) {
    setCategories(updated);
    await upsertSetting('product_categories', JSON.stringify(updated), 'Product category list');
  }

  // ── Add new category ─────────────────────────────────────────────────────
  const handleAddCategory = async () => {
    const trimmed = newCatInput.trim();
    if (!trimmed || categories.includes(trimmed)) { setShowAddCat(false); setNewCatInput(''); return; }
    setSavingCat(true);
    const updated = [...categories, trimmed];
    await saveCategories(updated);
    setForm(f => ({ ...f, category: trimmed }));
    setNewCatInput('');
    setShowAddCat(false);
    setSavingCat(false);
  };

  // ── Delete category ───────────────────────────────────────────────────────
  const handleRemoveCategory = async (cat) => {
    if (categories.length <= 1) return;
    const updated = categories.filter(c => c !== cat);
    await saveCategories(updated);
    if (form.category === cat) setForm(f => ({ ...f, category: updated[0] }));
  };

  // ── Product CRUD ─────────────────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); setForm(getEmptyForm(categories[0])); setShowAddCat(false); setModal(true); };
  const openEdit   = (p) => { setEditItem(p); setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, status: p.status, description: p.description || '', image_url: p.image_url || null, image_path: p.image_path || null }); setShowAddCat(false); setModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const productData = { name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), status: form.status, description: form.description, image_url: form.image_url, image_path: form.image_path };
    if (editItem) {
      const { data, error } = await updateProduct(editItem.id, productData);
      if (!error && data) setProducts(prev => prev.map(p => p.id === editItem.id ? data : p));
    } else {
      const { data, error } = await createProduct(productData);
      if (!error && data) setProducts(prev => [data, ...prev]);
    }
    setModal(false);
  };

  const handleDelete = async () => {
    const { error } = await deleteProduct(delTarget.id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== delTarget.id));
    setDelTarget(null);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'All' || p.category === catFilter;
    const matchSt     = stFilter  === 'All' || p.status   === stFilter;
    return matchSearch && matchCat && matchSt;
  });

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ ...inputStyle, paddingLeft: '2.2rem', width: '220px' }} />
          </div>
          <select value={catFilter} onChange={e => setCat(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={stFilter} onChange={e => setSt(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.2rem', background: '#FDB813', color: '#071B3B', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
          <Plus size={17} /> Add Product
        </button>
      </div>

      {/* ── Product Table ── */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={16} color="#FDB813" />
          <span style={{ fontWeight: 700, color: '#071B3B', fontSize: '0.95rem' }}>Product Catalog</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94A3B8' }}>{filtered.length} items</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                {['Item', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: '0.78rem', whiteSpace: 'nowrap', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>{loading ? 'Loading products…' : 'No products match your filters.'}</td></tr>
              ) : filtered.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F8FAFC' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, overflow: 'hidden' }}>
                        {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#071B3B' }}>{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>ID #{p.id?.slice?.(0, 8) ?? p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', color: '#64748B' }}>{p.category}</td>
                  <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: '#071B3B' }}>{formatNGN(p.price)}</td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span style={{ color: p.stock === 0 ? '#EF4444' : '#475569', fontWeight: p.stock === 0 ? 700 : 400 }}>
                      {p.stock === 0 ? '⚠ Out of stock' : `${p.stock} units`}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEdit(p)} style={{ padding: '0.35rem 0.55rem', background: '#F1F5F9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#475569' }} title="Edit"><Edit3 size={14} /></button>
                      <button onClick={() => setDelTarget(p)} style={{ padding: '0.35rem 0.55rem', background: '#FEE2E2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#EF4444' }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Slide-over ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div style={{ width: '100%', maxWidth: '500px', background: '#fff', height: '100%', overflowY: 'auto', padding: '2rem', boxShadow: '-8px 0 32px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#071B3B' }}>{editItem ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={22} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Product Name */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Product Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 450W Monocrystalline Panel" />
              </div>

              {/* Price + Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Price (₦) *</label>
                  <input style={inputStyle} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="85000" />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Stock Units *</label>
                  <input style={inputStyle} type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="20" />
                </div>
              </div>

              {/* Category + Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Category</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <select style={{ ...inputStyle, flex: 1 }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => { setShowAddCat(v => !v); setTimeout(() => newCatRef.current?.focus(), 50); }}
                      title="Add a new category"
                      style={{ padding: '0.5rem 0.65rem', background: showAddCat ? '#071B3B' : '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: showAddCat ? '#FDB813' : '#475569', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Inline add-category input */}
                  {showAddCat && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem' }}>
                      <input
                        ref={newCatRef}
                        style={{ ...inputStyle, flex: 1, fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
                        value={newCatInput}
                        onChange={e => setNewCatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') { setShowAddCat(false); setNewCatInput(''); } }}
                        placeholder="New category name…"
                      />
                      <button
                        onClick={handleAddCategory}
                        disabled={savingCat || !newCatInput.trim()}
                        style={{ padding: '0.45rem 0.75rem', background: '#22C55E', border: 'none', borderRadius: '7px', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}
                      >
                        {savingCat ? '…' : 'Add'}
                      </button>
                    </div>
                  )}

                  {/* Category chips with delete */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {categories.map(c => (
                      <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: form.category === c ? '#071B3B' : '#F1F5F9', color: form.category === c ? '#FDB813' : '#475569', cursor: 'pointer', border: '1px solid transparent' }}
                        onClick={() => setForm(f => ({ ...f, category: c }))}>
                        <Tag size={9} />
                        {c}
                        {categories.length > 1 && (
                          <button
                            onClick={e => { e.stopPropagation(); handleRemoveCategory(c); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'inherit', opacity: 0.6, marginLeft: '1px' }}
                            title={`Remove "${c}"`}
                          >×</button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Status</label>
                  <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Description</label>
                <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product details, specs, warranty..." />
              </div>

              {/* Image Upload */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Product Image</label>
                <ImageUpload type="product" currentUrl={form.image_url} onUpload={({ url, path }) => setForm(f => ({ ...f, image_url: url, image_path: path }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, padding: '0.7rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 1, padding: '0.7rem', background: '#FDB813', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', color: '#071B3B' }}>{editItem ? 'Update Product' : 'Create Product'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {delTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,27,59,0.45)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontWeight: 700, color: '#071B3B', marginBottom: '0.5rem' }}>Delete Product?</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Are you sure you want to delete <strong>"{delTarget.name}"</strong>? This cannot be undone.</p>
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
