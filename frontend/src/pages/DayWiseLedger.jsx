import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function DayWiseLedger() {
  const { selectedYear } = useYear()
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/days`)
      .then((res) => setDays(res.data))
      .finally(() => setLoading(false))
  }, [selectedYear])

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-gray-800">Day-wise Ledger — {selectedYear}</h1>

      {days.length === 0 && <p className="text-gray-500">No days set up for this year yet.</p>}

      {days.map((d) => (
        <Link key={d.dayId} to={`/ledger/${d.dayId}`} className="card block active:bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">Day {d.dayNumber}{d.label ? ` · ${d.label}` : ''}</p>
              <p className="text-sm text-gray-500">{d.date}</p>
            </div>
            <span className="text-gray-400">›</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-400">Collected</p>
              <p className="font-medium text-green-700">{money(d.totalCollection)}</p>
            </div>
            <div>
              <p className="text-gray-400">Spent</p>
              <p className="font-medium text-red-700">{money(d.totalExpense)}</p>
            </div>
            <div>
              <p className="text-gray-400">Balance</p>
              <p className="font-medium text-saffron-700">{money(d.balance)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
