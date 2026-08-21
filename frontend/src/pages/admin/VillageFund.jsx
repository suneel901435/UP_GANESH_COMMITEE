import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminPageHeader from '../../components/AdminPageHeader'
import AdminEmptyState from '../../components/AdminEmptyState'

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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading...</p>
      </div>
    )
  }
  if (!data) return <AdminEmptyState icon="💼" title="Could not load fund summary" />

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon="💼"
        eyebrow="Village Fund"
        title="Village Fund"
        subtitle="The running total of committee cash across every year — collections, expenses, and lending."
        stat={{ label: 'Available Fund', value: money(data.availableFundInHand) }}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-gray-400 font-medium">Opening Balance (entered)</p>
          <p className="font-extrabold text-gray-800 text-lg">{money(data.totalOpeningBalanceEntered)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 font-medium">Net Festival Surplus (all years)</p>
          <p className="font-extrabold text-gray-800 text-lg">{money(data.netFestivalSurplusAllYears)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 font-medium">Total Collections (all years)</p>
          <p className="font-extrabold text-emerald-700 text-lg">{money(data.totalCollectionAllYears)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 font-medium">Total Expenses (all years)</p>
          <p className="font-extrabold text-red-700 text-lg">{money(data.totalExpenseAllYears)}</p>
        </div>
      </div>

      <div className="form-shell">
        <h2 className="section-label">💵 Lending (Vaddi)</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between col-span-2 border-b border-orange-50 pb-2">
            <span className="text-gray-500">Total principal lent</span>
            <span className="font-bold text-gray-800">{money(data.totalPrincipalLent)}</span>
          </div>
          <div className="flex justify-between col-span-2 border-b border-orange-50 pb-2">
            <span className="text-gray-500">Total principal repaid</span>
            <span className="font-bold text-gray-800">{money(data.totalPrincipalRepaid)}</span>
          </div>
          <div className="flex justify-between col-span-2 border-b border-orange-50 pb-2">
            <span className="text-gray-500">Total interest received</span>
            <span className="font-bold text-emerald-700">{money(data.totalInterestReceived)}</span>
          </div>
          <div className="flex justify-between col-span-2 border-b border-orange-50 pb-2">
            <span className="text-gray-500">Outstanding principal with villagers</span>
            <span className="font-bold text-red-700">{money(data.outstandingPrincipalWithVillagers)}</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-gray-500">Outstanding interest (accrued, unpaid)</span>
            <span className="font-bold text-amber-700">{money(data.outstandingInterestWithVillagers)}</span>
          </div>
        </div>
        <Link to="/admin/loans" className="btn-secondary w-full text-center block mt-2">Manage Loans</Link>
      </div>

      <div className="form-shell">
        <h2 className="section-label mb-1">📆 Year by Year</h2>
        <div className="space-y-1.5 mt-2">
          {data.years.map((y) => (
            <div key={y.year} className="flex justify-between items-center text-sm bg-orange-50/40 rounded-lg px-3 py-2 border border-orange-100/60">
              <span className="font-bold text-gray-700">{y.year}</span>
              <span className="text-gray-400 text-xs">Coll. {money(y.totalCollection)}</span>
              <span className="text-gray-400 text-xs">Exp. {money(y.totalExpense)}</span>
              <span className="font-bold text-orange-700">Net {money(y.netSurplus)}</span>
            </div>
          ))}
          {data.years.length === 0 && <p className="text-sm text-gray-400">No years set up yet.</p>}
        </div>
      </div>
    </div>
  )
}
