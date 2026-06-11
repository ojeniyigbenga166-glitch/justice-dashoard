'use client';

/**
 * Pagination — functional pagination controls.
 * @param {object} props
 * @param {number} props.page - Current page (1-indexed)
 * @param {number} props.total - Total number of records
 * @param {number} props.pageSize - Records per page
 * @param {Function} props.onPageChange - Called with new page number
 */
export default function Pagination({ page, total, pageSize, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        style={{ cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
      >
        &larr; Prev
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        style={{ cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
      >
        Next &rarr;
      </button>
    </div>
  );
}
