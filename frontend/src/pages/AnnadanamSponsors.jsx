import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function AnnadanamSponsors() {
  const { selectedYear } = useYear()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/annadanam-sponsors`)
      .then((res) => setList(res.data))
      .finally(() => setLoading(false))
  }, [selectedYear])

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

  // Group by day for a clear "who sponsored annadanam on which day" view
  const grouped = list.reduce((acc, item) => {
    const key = item.festivalDay ? `Day ${item.festivalDay.dayNumber} · ${item.festivalDay.date}` : 'Unassigned'
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Annadanam Sponsors — {selectedYear}</h1>
      {list.length === 0 && <p className="text-gray-500">No annadanam sponsors added yet.</p>}

      {Object.entries(grouped).map(([day, items]) => (
        <div key={day}>
          <h2 className="font-semibold text-gray-700 mb-2">{day}</h2>
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a.id} className="card flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{a.sponsorName}</p>
                  <p className="text-xs text-gray-400">
                    {a.mealCount ? `${a.mealCount} meals` : ''}{a.notes ? ` · ${a.notes}` : ''}
                  </p>
                </div>
                {a.amount != null && <p className="font-semibold text-saffron-700">{money(a.amount)}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
