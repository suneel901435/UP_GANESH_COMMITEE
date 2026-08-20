import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { selectedYear } = useYear()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    api.get(`/public/years/${selectedYear}/leaderboard`)
      .then((res) => setEntries(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [selectedYear])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            🏆 Public Recognition {selectedYear}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Donor & Sponsor Leaderboard</h1>
          <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-lg">
            With heartfelt gratitude to everyone who contributed. Donors and sponsors appear here only if they opted in.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
            <span className="text-4xl block mb-2">🙏</span>
            <h3 className="text-lg font-bold text-gray-800">No Public Entries Yet</h3>
            <p className="text-sm text-gray-500 mt-1">Donors and sponsors will appear here as their contributions are recorded.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-orange-100/80 shadow-sm overflow-hidden divide-y divide-gray-100">
            {entries.map((e, idx) => (
              <div key={`${e.type}-${e.name}-${idx}`} className="flex items-center justify-between gap-3 p-4 sm:p-5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-sm font-black text-orange-700 shrink-0">
                    {idx < 3 ? MEDALS[idx] : idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{e.name}</p>
                    <p className="text-xs text-gray-400">
                      {e.type}{e.category ? ` · ${e.category}` : ''}
                    </p>
                  </div>
                </div>
                <span className="font-black text-orange-700 text-base shrink-0">{money(e.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
