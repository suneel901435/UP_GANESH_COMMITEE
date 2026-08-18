import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function Dashboard() {
  const { selectedYear, loading: yearLoading } = useYear()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    api.get(`/public/years/${selectedYear}/dashboard`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [selectedYear])

  if (yearLoading || loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

  if (!selectedYear) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">No festival year has been set up yet.</p>
        <p className="text-sm text-gray-400 mt-1">An admin needs to create this year's festival first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Ganesh Chaturthi {selectedYear}</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-green-50 border-green-100">
          <p className="text-sm text-green-700">Total Collection</p>
          <p className="text-xl font-bold text-green-700">{money(data.totalCollection)}</p>
        </div>
        <div className="card bg-red-50 border-red-100">
          <p className="text-sm text-red-700">Total Expenses</p>
          <p className="text-xl font-bold text-red-700">{money(data.totalExpense)}</p>
        </div>
        <div className="card bg-saffron-50 border-saffron-100 col-span-2">
          <p className="text-sm text-saffron-700">Balance in Hand</p>
          <p className="text-2xl font-bold text-saffron-700">{money(data.balance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="card">
          <p className="text-2xl font-bold text-gray-800">{data.totalDonors}</p>
          <p className="text-sm text-gray-500">Donors</p>
        </div>
        <div className="card">
          <p className="text-2xl font-bold text-gray-800">{data.daysCount}</p>
          <p className="text-sm text-gray-500">Festival Days</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/ledger" className="btn-secondary text-center">Day-wise Ledger</Link>
        <Link to="/velam" className="btn-secondary text-center">Velam Paata</Link>
        <Link to="/programs" className="btn-secondary text-center">Programs</Link>
        <Link to="/sponsors" className="btn-secondary text-center">Sponsors</Link>
      </div>
    </div>
  )
}
