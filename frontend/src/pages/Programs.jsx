import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

export default function Programs() {
  const { selectedYear } = useYear()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/programs`)
      .then((res) => setPrograms(res.data))
      .finally(() => setLoading(false))
  }, [selectedYear])

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-gray-800">Programs — {selectedYear}</h1>
      {programs.length === 0 && <p className="text-gray-500">No programs added yet.</p>}
      {programs.map((p) => (
        <div key={p.id} className="card">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-gray-800">{p.name}</p>
            {p.timeSlot && <span className="text-xs bg-saffron-50 text-saffron-700 px-2 py-1 rounded">{p.timeSlot}</span>}
          </div>
          {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
          {p.festivalDay && <p className="text-xs text-gray-400 mt-1">Day {p.festivalDay.dayNumber} · {p.festivalDay.date}</p>}
        </div>
      ))}
    </div>
  )
}
