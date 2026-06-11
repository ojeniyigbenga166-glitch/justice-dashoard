'use client';

/**
 * StatusBadge — displays a color-coded status pill.
 * @param {object} props
 * @param {string} props.status - Status value to display
 */
const STATUS_COLORS = {
  // Orders
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
  // Leads
  new: '#3b82f6',
  contacted: '#f59e0b',
  qualified: '#10b981',
  lost: '#ef4444',
  // Projects
  active: '#10b981',
  completed: '#6b7280',
  paused: '#f59e0b',
  // Products
  published: '#10b981',
  draft: '#6b7280',
  archived: '#ef4444',
};

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status?.toLowerCase()] || '#6b7280';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        background: color + '22',
        color,
        border: `1px solid ${color}44`,
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {status || 'Unknown'}
    </span>
  );
}
