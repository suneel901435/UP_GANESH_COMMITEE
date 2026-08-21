import React, { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'
import AdminPageHeader from '../../components/AdminPageHeader'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function formatDateTime(dt) {
  if (!dt) return '—'
  try {
    return new Date(dt).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return dt
  }
}

const ACTIONS = ['All', 'Create', 'Update', 'Delete']

const ACTION_STYLES = {
  CREATE: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-blue-50 text-blue-700',
  DELETE: 'bg-red-50 text-red-700',
}

const ACTION_ICON = {
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent min-w-0 max-w-full truncate"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

export default function AuditLog() {
  const { selectedYear } = useYear()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [modules, setModules] = useState(['All'])
  const [admins, setAdmins] = useState(['All'])

  const [moduleFilter, setModuleFilter] = useState('All')
  const [adminFilter, setAdminFilter] = useState('All')
  const [actionFilter, setActionFilter] = useState('All')
  const [yearOnly, setYearOnly] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Populate the Module/Admin dropdown options once, from whatever's actually
  // been logged so far - not a hardcoded list, so it stays correct as new
  // modules get added.
  useEffect(() => {
    api.get('/admin/audit/modules').then((res) => setModules(['All', ...(res.data || [])])).catch(() => {})
    api.get('/admin/audit/admins').then((res) => setAdmins(['All', ...(res.data || [])])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = {}
    if (moduleFilter !== 'All') params.module = moduleFilter
    if (adminFilter !== 'All') params.admin = adminFilter
    if (actionFilter !== 'All') params.action = actionFilter.toUpperCase()
    if (yearOnly && selectedYear) params.year = selectedYear
    if (fromDate) params.from = fromDate
    if (toDate) params.to = toDate

    api.get('/admin/audit', { params })
      .then((res) => setEntries(res.data || []))
      .catch((err) => {
        console.error(err)
        setError('Could not load the audit trail. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [moduleFilter, adminFilter, actionFilter, yearOnly, selectedYear, fromDate, toDate])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (moduleFilter !== 'All') n++
    if (adminFilter !== 'All') n++
    if (actionFilter !== 'All') n++
    if (fromDate) n++
    if (toDate) n++
    return n
  }, [moduleFilter, adminFilter, actionFilter, fromDate, toDate])

  const clearFilters = () => {
    setModuleFilter('All')
    setAdminFilter('All')
    setActionFilter('All')
    setFromDate('')
    setToDate('')
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon="🕵️"
        eyebrow="Audit Trail"
        title="Audit Trail"
        subtitle="Every add, edit, and delete by every admin — across every module."
      />

      {/* Filter bar */}
      <div className="form-shell">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filters</span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] font-bold bg-saffron-100 text-saffron-700 px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <input
                type="checkbox"
                checked={yearOnly}
                onChange={(e) => setYearOnly(e.target.checked)}
                className="rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
              />
              {selectedYear} only
            </label>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs font-semibold text-saffron-600">
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <FilterSelect label="Module" value={moduleFilter} onChange={setModuleFilter} options={modules} />
          <FilterSelect label="Admin" value={adminFilter} onChange={setAdminFilter} options={admins} />
          <FilterSelect label="Action" value={actionFilter} onChange={setActionFilter} options={ACTIONS} />
          <label className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent min-w-0"
            />
          </label>
          <label className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent min-w-0"
            />
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading audit log...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-400">No entries match these filters.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="card">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${ACTION_STYLES[e.action] || 'bg-gray-50 text-gray-600'}`}>
                      {ACTION_ICON[e.action] || ''} {e.action}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                      {e.module}
                    </span>
                    {e.festivalYear && <span className="text-xs text-gray-400">{e.festivalYear}</span>}
                  </div>
                  <p className="font-medium text-gray-800 mt-1.5 truncate">{e.summary}</p>

                  {e.action === 'UPDATE' && e.changes && (
                    <ul className="mt-1.5 space-y-0.5">
                      {e.changes.split('; ').map((c, i) => (
                        <li key={i} className="text-xs text-gray-500 truncate">• {c}</li>
                      ))}
                    </ul>
                  )}

                  <p className="text-xs text-gray-400 mt-1.5">
                    By <span className="font-medium text-gray-600">{e.performedBy}</span> · {formatDateTime(e.performedAt)}
                  </p>
                </div>
                {e.amount != null && (
                  <p className={`font-semibold shrink-0 ${e.action === 'DELETE' ? 'text-red-700' : 'text-gray-800'}`}>
                    {money(e.amount)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
