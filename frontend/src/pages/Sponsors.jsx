import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function Sponsors() {
  const { selectedYear } = useYear()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/sponsors`)
      .then((res) => setList(res.data))
      .finally(() => setLoading(false))
  }, [selectedYear])

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-gray-800">Sponsors — {selectedYear}</h1>
      {list.length === 0 && <p className="text-gray-500">No sponsors added yet.</p>}
      {list.map((s) => (
        <div key={s.id} className="card flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-800">{s.sponsorName}</p>
            <p className="text-xs text-gray-400">{s.category}{s.notes ? ` · ${s.notes}` : ''}</p>
          </div>
          {s.amount != null && <p className="font-semibold text-saffron-700">{money(s.amount)}</p>}
        </div>
      ))}
    </div>
  )
}
