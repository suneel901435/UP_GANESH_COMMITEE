import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function VillageFund() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/fund/summary')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>
  if (!data) return <p className="text-center text-gray-500 mt-10">Could not load fund summary.</p>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Village Fund</h1>
      <p className="text-xs text-gray-400">
        The running total of committee cash across every year — festival collections and
        expenses, plus what's been lent out to villagers and what's come back with interest.
      </p>

      <div className="card bg-saffron-50 border-saffron-100">
        <p className="text-sm text-saffron-700">Available Fund In Hand</p>
        <p className="text-3xl font-bold text-saffron-700">{money(data.availableFundInHand)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-gray-400">Opening Balance (entered)</p>
          <p className="font-semibold text-gray-800">{money(data.totalOpeningBalanceEntered)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Net Festival Surplus (all years)</p>
          <p className="font-semibold text-gray-800">{money(data.netFestivalSurplusAllYears)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Total Collections (all years)</p>
          <p className="font-semibold text-green-700">{money(data.totalCollectionAllYears)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Total Expenses (all years)</p>
          <p className="font-semibold text-red-700">{money(data.totalExpenseAllYears)}</p>
        </div>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold text-gray-700">Lending (Vaddi)</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between col-span-2">
            <span className="text-gray-500">Total principal lent</span>
            <span className="font-medium">{money(data.totalPrincipalLent)}</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-gray-500">Total principal repaid</span>
            <span className="font-medium">{money(data.totalPrincipalRepaid)}</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-gray-500">Total interest received</span>
            <span className="font-medium text-green-700">{money(data.totalInterestReceived)}</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-gray-500">Outstanding principal with villagers</span>
            <span className="font-medium text-red-700">{money(data.outstandingPrincipalWithVillagers)}</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-gray-500">Outstanding interest (accrued, unpaid)</span>
            <span className="font-medium text-amber-700">{money(data.outstandingInterestWithVillagers)}</span>
          </div>
        </div>
        <Link to="/admin/loans" className="btn-secondary w-full text-center block mt-2">Manage Loans</Link>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-2">Year by Year</h2>
        <div className="space-y-2">
          {data.years.map((y) => (
            <div key={y.year} className="flex justify-between items-center text-sm border-b border-gray-50 py-1.5">
              <span className="font-medium text-gray-700">{y.year}</span>
              <span className="text-gray-400">Coll. {money(y.totalCollection)}</span>
              <span className="text-gray-400">Exp. {money(y.totalExpense)}</span>
              <span className="font-medium text-saffron-700">Net {money(y.netSurplus)}</span>
            </div>
          ))}
          {data.years.length === 0 && <p className="text-sm text-gray-400">No years set up yet.</p>}
        </div>
      </div>
    </div>
  )
}
