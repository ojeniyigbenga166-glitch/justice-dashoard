'use client';

/**
 * ConfirmDialog — functional confirmation modal.
 * @param {object} props
 * @param {boolean} props.open - Whether the dialog is visible
 * @param {string} props.title - Dialog title
 * @param {string} [props.message] - Dialog body text
 * @param {Function} props.onConfirm - Confirm callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {boolean} [props.loading] - Disable confirm while processing
 */
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading = false }) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'rgba(0,0,0,0.4)', zIndex: 1000,
      }}
    >
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
        <h2 id="confirm-dialog-title" style={{ marginBottom: '0.5rem' }}>{title}</h2>
        {message && <p style={{ marginBottom: '1.5rem', color: '#444' }}>{message}</p>}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={loading} style={{ cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ cursor: loading ? 'not-allowed' : 'pointer', color: '#c00' }}>
            {loading ? 'Processing…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
