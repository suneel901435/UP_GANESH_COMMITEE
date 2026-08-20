import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'

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

const FILTERS = ['All', 'Collection', 'Expense']

export default function AuditLog() {
  const { selectedYear } = useYear()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    api.get(`/admin/audit/years/${selectedYear}`)
      .then((res) => setEntries(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [selectedYear])

  const filtered = filter === 'All' ? entries : entries.filter((e) => e.entityType === filter)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Audit Trail</h1>
        <p className="text-sm text-gray-500">Who added what, and when — for {selectedYear}.</p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              filter === f ? 'bg-saffron-600 text-white border-saffron-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading audit log...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No entries recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((e, idx) => (
            <div key={`${e.entityType}-${e.entityId}-${idx}`} className="card">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      e.entityType === 'Collection' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {e.entityType}
                    </span>
                    <span className="text-xs text-gray-400">{e.action}</span>
                  </div>
                  <p className="font-medium text-gray-800 mt-1 truncate">{e.summary}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    By <span className="font-medium text-gray-600">{e.createdBy}</span> · {formatDateTime(e.createdAt)}
                  </p>
                </div>
                <p className={`font-semibold shrink-0 ${e.entityType === 'Collection' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {money(e.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
