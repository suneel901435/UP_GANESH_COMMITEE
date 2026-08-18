import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function DayDetail() {
  const { dayId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/public/days/${dayId}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [dayId])

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>
  if (!data) return <p className="text-center text-gray-500 mt-10">Day not found.</p>

  return (
    <div className="space-y-4">
      <Link to="/ledger" className="text-saffron-600 text-sm">‹ Back to ledger</Link>
      <h1 className="text-xl font-bold text-gray-800">
        Day {data.dayNumber}{data.label ? ` · ${data.label}` : ''} — {data.date}
      </h1>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="card"><p className="text-sm text-gray-400">Collected</p><p className="font-bold text-green-700">{money(data.totalCollection)}</p></div>
        <div className="card"><p className="text-sm text-gray-400">Spent</p><p className="font-bold text-red-700">{money(data.totalExpense)}</p></div>
        <div className="card"><p className="text-sm text-gray-400">Balance</p><p className="font-bold text-saffron-700">{money(data.balance)}</p></div>
      </div>

      <div>
        <h2 className="font-semibold text-gray-700 mb-2">Donations ({data.collections.length})</h2>
        <div className="space-y-2">
          {data.collections.length === 0 && <p className="text-sm text-gray-400">No donations recorded.</p>}
          {data.collections.map((c) => (
            <div key={c.id} className="card flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{c.donorName}</p>
                <p className="text-xs text-gray-400">{c.paymentMode}{c.notes ? ` · ${c.notes}` : ''}</p>
              </div>
              <p className="font-semibold text-green-700">{money(c.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-gray-700 mb-2">Expenses ({data.expenses.length})</h2>
        <div className="space-y-2">
          {data.expenses.length === 0 && <p className="text-sm text-gray-400">No expenses recorded.</p>}
          {data.expenses.map((e) => (
            <div key={e.id} className="card flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{e.category}</p>
                <p className="text-xs text-gray-400">{e.description}{e.paidTo ? ` · Paid to ${e.paidTo}` : ''}</p>
              </div>
              <p className="font-semibold text-red-700">{money(e.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
