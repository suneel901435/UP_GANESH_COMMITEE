import React, { useEffect, useState } from 'react'
import api from '../api/axios'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function PastYears() {
  const [years, setYears] = useState([])
  const [summaries, setSummaries] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/years').then(async (res) => {
      setYears(res.data)
      const entries = await Promise.all(
        res.data.map(async (y) => {
          try {
            const d = await api.get(`/public/years/${y.year}/dashboard`)
            return [y.year, d.data]
          } catch {
            return [y.year, null]
          }
        })
      )
      setSummaries(Object.fromEntries(entries))
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-gray-800">Past Years</h1>
      {years.length === 0 && <p className="text-gray-500">No historical years added yet.</p>}
      {years.map((y) => {
        const s = summaries[y.year]
        return (
          <div key={y.id} className="card">
            <p className="font-semibold text-gray-800">{y.year}{y.active ? ' (current)' : ''}</p>
            {s && (
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div><p className="text-gray-400">Collected</p><p className="font-medium text-green-700">{money(s.totalCollection)}</p></div>
                <div><p className="text-gray-400">Spent</p><p className="font-medium text-red-700">{money(s.totalExpense)}</p></div>
                <div><p className="text-gray-400">Balance</p><p className="font-medium text-saffron-700">{money(s.balance)}</p></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
