'use client';

/**
 * DataTable — generic table component for admin lists.
 * @param {object} props
 * @param {Array<{key: string, label: string, render?: Function}>} props.columns - Column definitions
 * @param {Array<object>} props.rows - Data rows
 * @param {string} [props.emptyMessage] - Shown when no rows
 * @param {boolean} [props.loading] - Show loading state
 */
export default function DataTable({ columns = [], rows = [], emptyMessage = 'No records found.', loading = false }) {
  if (loading) {
    return <p style={{ padding: '1rem', color: '#666' }}>Loading…</p>;
  }

  if (!rows.length) {
    return <p style={{ padding: '1rem', color: '#666' }}>{emptyMessage}</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid #ddd', whiteSpace: 'nowrap' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={row.id || rowIdx} style={{ borderBottom: '1px solid #eee' }}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '0.5rem 0.75rem', verticalAlign: 'middle' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
