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

  const hasLending = Number(data.totalPrincipalLent) > 0

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Ganesh Chaturthi {selectedYear}</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-green-50 border-green-100">
          <p className="text-sm text-green-700">This Year's Collection</p>
          <p className="text-xl font-bold text-green-700">{money(data.totalCollection)}</p>
        </div>
        <div className="card bg-red-50 border-red-100">
          <p className="text-sm text-red-700">This Year's Expenses</p>
          <p className="text-xl font-bold text-red-700">{money(data.totalExpense)}</p>
        </div>
      </div>

      {Number(data.openingBalance) > 0 && (
        <div className="card bg-gray-50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Brought forward from before</span>
            <span className="font-medium text-gray-700">{money(data.openingBalance)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">This year's surplus</span>
            <span className="font-medium text-gray-700">{money(data.yearSurplus)}</span>
          </div>
        </div>
      )}

      {hasLending && (
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-sm text-blue-700 mb-1">Village Lending Fund</p>
          <div className="flex justify-between text-sm">
            <span className="text-blue-600">Currently lent out</span>
            <span className="font-medium text-blue-700">{money(data.outstandingPrincipal)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-blue-600">Interest earned (all time)</span>
            <span className="font-medium text-blue-700">{money(data.totalInterestEarned)}</span>
          </div>
        </div>
      )}

      <div className="card bg-saffron-50 border-saffron-100">
        <p className="text-sm text-saffron-700">Cash in Hand Right Now</p>
        <p className="text-2xl font-bold text-saffron-700">{money(data.cashInHand)}</p>
        {hasLending && (
          <p className="text-xs text-saffron-600 mt-1">
            (Total fund of {money(data.fundAvailable)}, with {money(data.outstandingPrincipal)} out on loan to the village)
          </p>
        )}
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
