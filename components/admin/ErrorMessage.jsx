'use client';

/**
 * ErrorMessage — functional error display component.
 * @param {object} props
 * @param {string} props.message - Error message text
 * @param {Function} [props.onRetry] - Optional retry callback
 */
export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div role="alert" style={{ padding: '1rem', color: '#c00' }}>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ marginTop: '0.5rem', cursor: 'pointer' }}>
          Retry
        </button>
      )}
    </div>
  );
}
