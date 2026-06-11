'use client';

/**
 * SearchBar — reusable controlled search input.
 * @param {object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Called with new string value
 * @param {string} [props.placeholder]
 */
export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.875rem', minWidth: '240px' }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1rem' }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
