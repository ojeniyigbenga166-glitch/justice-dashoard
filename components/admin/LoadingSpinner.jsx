'use client';

/**
 * LoadingSpinner — functional loading indicator.
 * @param {object} props
 * @param {string} [props.label] - Accessible label
 */
export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div role="status" aria-label={label} style={{ padding: '1rem', textAlign: 'center' }}>
      <span>{label}</span>
    </div>
  );
}
