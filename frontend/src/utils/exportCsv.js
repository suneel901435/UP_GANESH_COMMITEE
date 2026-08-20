// Lightweight client-side CSV export - no extra dependency needed. CSV opens
// natively in Excel/Google Sheets/LibreOffice, which covers the "offline
// copy for auditing" use case without pulling in a full xlsx library.
function escapeCsvValue(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// rows: array of plain objects. columns: [{ key, label }] - controls column
// order and header text; if omitted, uses the keys of the first row as-is.
export function downloadCsv(filename, rows, columns) {
  if (!rows || rows.length === 0) {
    alert('Nothing to export yet.')
    return
  }
  const cols = columns || Object.keys(rows[0]).map((key) => ({ key, label: key }))
  const header = cols.map((c) => escapeCsvValue(c.label)).join(',')
  const body = rows
    .map((row) => cols.map((c) => escapeCsvValue(row[c.key])).join(','))
    .join('\n')

  // Leading BOM so Excel correctly detects UTF-8 (needed for ₹ and Telugu text)
  const csvContent = '\uFEFF' + header + '\n' + body
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
