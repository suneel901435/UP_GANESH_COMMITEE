import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function VelamPaata() {
  const { selectedYear } = useYear()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/velam-items`)
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false))
  }, [selectedYear])

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

  const totalRaised = items
    .filter((i) => i.status === 'SOLD')
    .reduce((sum, i) => sum + Number(i.finalPrice || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Velam Paata — {selectedYear}</h1>
      </div>
      <div className="card bg-saffron-50 border-saffron-100">
        <p className="text-sm text-saffron-700">Total raised from sold items</p>
        <p className="text-xl font-bold text-saffron-700">{money(totalRaised)}</p>
      </div>

      {items.length === 0 && <p className="text-gray-500">No items added yet.</p>}

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="card">
            {item.imageUrl && (
              <img
                src={item.imageUrl.startsWith('http') ? item.imageUrl : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '')}${item.imageUrl}`}
                alt={item.itemName}
                className="w-full h-28 object-cover rounded-lg mb-2"
              />
            )}
            <p className="font-semibold text-gray-800 text-sm">{item.itemName}</p>
            {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
            <div className="mt-2 flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'SOLD' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                {item.status === 'SOLD' ? 'Sold' : 'Available'}
              </span>
              <p className="text-sm font-bold text-saffron-700">
                {money(item.status === 'SOLD' ? item.finalPrice : item.basePrice)}
              </p>
            </div>
            {item.status === 'SOLD' && item.buyerName && (
              <p className="text-xs text-gray-400 mt-1">Bought by {item.buyerName}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
