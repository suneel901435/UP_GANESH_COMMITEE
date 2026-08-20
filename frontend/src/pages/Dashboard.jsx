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

  // Interactive Festival Days breakdown modal state
  const [daysModalOpen, setDaysModalOpen] = useState(false)
  const [daysDetails, setDaysDetails] = useState([])
  const [loadingDays, setLoadingDays] = useState(false)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    api.get(`/public/years/${selectedYear}/dashboard`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [selectedYear])

  const openDaysSchedule = async () => {
    setDaysModalOpen(true)
    setLoadingDays(true)
    try {
      const [daysRes, programsRes, annadanamRes] = await Promise.all([
        api.get(`/public/years/${selectedYear}/day-list`).catch(() => ({ data: [] })),
        api.get(`/public/years/${selectedYear}/programs`).catch(() => ({ data: [] })),
        api.get(`/public/years/${selectedYear}/annadanam-sponsors`).catch(() => ({ data: [] }))
      ])

      const days = daysRes.data || []
      const programs = programsRes.data || []
      const annadanams = annadanamRes.data || []

      const enrichedDays = days.map((d) => {
        const dayProgs = programs.filter(
          (p) =>
            p.festivalDay?.id === d.id ||
            p.festivalDayId === d.id ||
            p.dayNumber === d.dayNumber
        )
        const dayAnnadams = annadanams.filter(
          (a) =>
            a.festivalDay?.id === d.id ||
            a.festivalDayId === d.id ||
            a.dayNumber === d.dayNumber
        )
        return {
          ...d,
          programs: dayProgs,
          annadanamSponsors: dayAnnadams
        }
      })

      setDaysDetails(enrichedDays)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDays(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBA'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (yearLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <span className="absolute inset-0 flex items-center justify-center text-sm">🕉️</span>
        </div>
        <p className="text-gray-500 mt-4 text-sm font-semibold tracking-wide">Loading festival dashboard...</p>
      </div>
    )
  }

  if (!selectedYear || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-orange-200 max-w-md w-full shadow-lg">
          <span className="text-5xl block mb-3">🪔</span>
          <h3 className="text-xl font-bold text-gray-800">No Festival Year Configured</h3>
          <p className="text-sm text-gray-500 mt-2">Please create or activate a festival year from the admin console.</p>
        </div>
      </div>
    )
  }

  const totalCollected = Number(data.totalCollection || 0)
  const totalSpent = Number(data.totalExpense || 0)
  const expensePercentage = totalCollected > 0 ? Math.min(Math.round((totalSpent / totalCollected) * 100), 100) : 0
  const hasLending = Number(data.totalPrincipalLent || data.outstandingPrincipal) > 0

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Festive Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-9 text-white shadow-xl shadow-orange-500/15 border border-orange-400/30">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active Festival Year • {selectedYear}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-xs">
                Ganesh Chaturthi Utsav
              </h1>
              <p className="text-orange-100 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
                Live devotional transparent dashboard tracking collections, daily ledger, seva offerings, and committee treasury.
              </p>
            </div>

            {/* Cash in Hand Glass Card */}
            <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-5 text-left lg:text-right shrink-0 shadow-lg">
              <span className="text-[11px] uppercase font-bold tracking-widest text-orange-200 block">
                Cash in Hand
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white block mt-1 tracking-tight">
                {money(data.cashInHand)}
              </span>
              {data.fundAvailable != null && (
                <span className="text-xs text-orange-100/90 font-medium block mt-1">
                  Total Fund: <strong className="text-white font-bold">{money(data.fundAvailable)}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Primary Metrics: Collections vs Expenses with Mini Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Collections Card */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">
                  Total Collections
                </span>
                <p className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1 tracking-tight">
                  {money(data.totalCollection)}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Contributed by <strong className="text-gray-800 font-bold">{data.totalDonors || 0}</strong> devotees & donors
                </p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                📥
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-50 flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>Chanda & Mandapam Seva</span>
              <span className="bg-emerald-100/80 px-2 py-0.5 rounded-md">Verified</span>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-extrabold text-red-800 uppercase tracking-wider block">
                  Total Expenses
                </span>
                <p className="text-3xl sm:text-4xl font-black text-red-600 mt-1 tracking-tight">
                  {money(data.totalExpense)}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  {expensePercentage}% of total collections utilized
                </p>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
                📤
              </div>
            </div>

            {/* Expense utilization bar */}
            <div className="mt-4 pt-3 border-t border-red-50">
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${expensePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Flow Section: Opening Balance & Surplus */}
        {Number(data.openingBalance) > 0 && (
          <div className="bg-white rounded-3xl border border-orange-100/90 p-5 sm:p-6 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-xl shrink-0">
                💼
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">Opening Treasury Balance</span>
                <span className="text-lg font-black text-gray-800">{money(data.openingBalance)}</span>
                <p className="text-[11px] text-gray-400 mt-0.5">Carried forward from previous years</p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-3 sm:pt-0 sm:pl-6">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl shrink-0">
                📈
              </div>
              <div>
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">This Year Net Surplus</span>
                <span className="text-lg font-black text-emerald-700">+{money(data.yearSurplus)}</span>
                <p className="text-[11px] text-gray-400 mt-0.5">Collections minus current expenses</p>
              </div>
            </div>
          </div>
        )}

        {/* Village Lending Trust Fund */}
        {hasLending && (
          <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white rounded-3xl border border-blue-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
                  🤝
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-blue-950">
                    Village Community Lending Fund
                  </h3>
                  <p className="text-xs text-blue-700/80 font-medium">Rotational welfare fund for village emergencies & farming support</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-100/90 px-3 py-1 rounded-full border border-blue-200 hidden sm:inline-block">
                Trust Activity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-white/90 rounded-2xl p-4 border border-blue-100/90 shadow-2xs">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Currently Lent Out</span>
                <span className="text-2xl font-black text-blue-950 block mt-1">
                  {money(data.outstandingPrincipal)}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">Active community loan balances</span>
              </div>
              <div className="bg-white/90 rounded-2xl p-4 border border-blue-100/90 shadow-2xs">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">Interest Earned (All-Time)</span>
                <span className="text-2xl font-black text-emerald-700 block mt-1">
                  {money(data.totalInterestEarned)}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">Reinvested directly into temple treasury</span>
              </div>
            </div>
          </div>
        )}

        {/* Donors & Interactive Festival Days Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl border border-orange-100/80 p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block">Devotees & Donors</span>
              <p className="text-3xl sm:text-4xl font-black text-gray-900">{data.totalDonors || 0}</p>
              <p className="text-xs text-orange-600 font-semibold">Generous festival contributors</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center text-2xl shrink-0">
              👥
            </div>
          </div>

          {/* Interactive Festival Days Card */}
          <div
            onClick={openDaysSchedule}
            className="group bg-gradient-to-br from-white via-orange-50/20 to-orange-50/40 rounded-3xl border-2 border-orange-200 hover:border-orange-500 p-6 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 flex items-center justify-between relative overflow-hidden"
          >
            <div className="space-y-1 relative z-10">
              <span className="text-xs font-extrabold text-orange-800 uppercase tracking-wider block">Celebration Duration</span>
              <p className="text-3xl sm:text-4xl font-black text-orange-600 group-hover:text-orange-700">
                {data.daysCount || 0} <span className="text-xl font-bold text-gray-700">Days</span>
              </p>
              <p className="text-xs text-orange-700 font-bold group-hover:underline flex items-center gap-1.5 pt-0.5">
                <span>View day-wise sponsors & programs</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/30 group-hover:scale-110 transition-all flex items-center justify-center text-2xl shrink-0 relative z-10">
              📅
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <Link
            to="/ledger"
            className="bg-white hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 hover:text-white border border-orange-200/80 text-gray-800 rounded-3xl p-5 text-center font-black text-sm shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center text-2xl transition-all">
              📒
            </div>
            <span>Day-wise Ledger</span>
          </Link>

          <Link
            to="/velam"
            className="bg-white hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 hover:text-white border border-orange-200/80 text-gray-800 rounded-3xl p-5 text-center font-black text-sm shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center text-2xl transition-all">
              🔨
            </div>
            <span>Velam Paata</span>
          </Link>

          <Link
            to="/programs"
            className="bg-white hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 hover:text-white border border-orange-200/80 text-gray-800 rounded-3xl p-5 text-center font-black text-sm shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center text-2xl transition-all">
              🪔
            </div>
            <span>Programs</span>
          </Link>

          <Link
            to="/sponsors"
            className="bg-white hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 hover:text-white border border-orange-200/80 text-gray-800 rounded-3xl p-5 text-center font-black text-sm shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center text-2xl transition-all">
              🙏
            </div>
            <span>Sponsors</span>
          </Link>
        </div>

      </div>

      {/* Interactive Festival Days Schedule Modal */}
      {daysModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white flex justify-between items-center shrink-0">
              <div className="space-y-0.5">
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block">
                  Festival Itinerary {selectedYear}
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                  Daily Celebrations & Annadanam Schedule
                </h2>
              </div>
              <button
                onClick={() => setDaysModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-black text-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-50/60">
              {loadingDays ? (
                <div className="py-16 text-center text-gray-500">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="font-semibold text-sm">Loading celebration itinerary...</p>
                </div>
              ) : daysDetails.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  No festival days configured for {selectedYear}.
                </div>
              ) : (
                daysDetails.map((day, idx) => (
                  <div
                    key={day.id || idx}
                    className="border border-orange-200/80 rounded-3xl p-5 sm:p-6 bg-white shadow-xs space-y-4"
                  >
                    {/* Day Banner */}
                    <div className="flex flex-wrap items-center justify-between border-b border-orange-100 pb-3 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black px-3.5 py-1 rounded-xl uppercase shadow-xs">
                          Day {day.dayNumber || idx + 1}
                        </span>
                        <span className="font-bold text-gray-900 text-base">
                          {formatDate(day.festivalDate || day.date)}
                        </span>
                      </div>
                      {day.description && (
                        <span className="text-xs bg-orange-50 text-orange-800 font-bold px-3 py-1 rounded-lg border border-orange-200/60">
                          {day.description}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Annadanam Sponsors Box */}
                      <div className="bg-orange-50/40 rounded-2xl p-4 border border-orange-100">
                        <span className="text-xs font-extrabold text-orange-950 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                          <span>🍛</span> Annadanam Sponsors
                        </span>
                        {day.annadanamSponsors && day.annadanamSponsors.length > 0 ? (
                          <div className="space-y-2.5">
                            {day.annadanamSponsors.map((sp, sIdx) => (
                              <div key={sIdx} className="bg-white p-3.5 rounded-xl border border-orange-100 shadow-2xs">
                                <p className="font-bold text-gray-900 text-sm">{sp.sponsorName}</p>
                                {sp.mealCount && (
                                  <p className="text-xs text-orange-800 font-semibold mt-1">
                                    🍲 {sp.mealCount} Meals Sponsored
                                  </p>
                                )}
                                {sp.notes && (
                                  <p className="text-xs text-gray-500 mt-0.5">{sp.notes}</p>
                                )}
                                {sp.amount && (
                                  <p className="text-xs text-emerald-700 font-bold mt-1">
                                    Contribution: {money(sp.amount)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2">No sponsor recorded for this day</p>
                        )}
                      </div>

                      {/* Programs Box */}
                      <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-100">
                        <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                          <span>🪔</span> Programs & Pujas
                        </span>
                        {day.programs && day.programs.length > 0 ? (
                          <div className="space-y-2.5">
                            {day.programs.map((pr, pIdx) => (
                              <div key={pIdx} className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-bold text-gray-900 text-sm">{pr.name}</span>
                                  {pr.timeSlot && (
                                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                                      ⏰ {pr.timeSlot}
                                    </span>
                                  )}
                                </div>
                                {pr.description && (
                                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{pr.description}</p>
                                )}
                                {pr.performerOrChiefGuest && (
                                  <p className="text-xs text-indigo-700 font-medium mt-1">
                                    Special: {pr.performerOrChiefGuest}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2">Regular Nitya Puja</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// import React, { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import api from '../api/axios'
// import { useYear } from '../context/YearContext'

// function money(n) {
//   return `₹${Number(n || 0).toLocaleString('en-IN')}`
// }

// export default function Dashboard() {
//   const { selectedYear, loading: yearLoading } = useYear()
//   const [data, setData] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!selectedYear) return
//     setLoading(true)
//     api.get(`/public/years/${selectedYear}/dashboard`)
//       .then((res) => setData(res.data))
//       .finally(() => setLoading(false))
//   }, [selectedYear])

//   if (yearLoading || loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

//   if (!selectedYear) {
//     return (
//       <div className="card text-center">
//         <p className="text-gray-600">No festival year has been set up yet.</p>
//         <p className="text-sm text-gray-400 mt-1">An admin needs to create this year's festival first.</p>
//       </div>
//     )
//   }

//   const hasLending = Number(data.totalPrincipalLent) > 0

//   return (
//     <div className="space-y-4">
//       <h1 className="text-2xl font-bold text-gray-800">Ganesh Chaturthi {selectedYear}</h1>

//       <div className="grid grid-cols-2 gap-3">
//         <div className="card bg-green-50 border-green-100">
//           <p className="text-sm text-green-700">This Year's Collection</p>
//           <p className="text-xl font-bold text-green-700">{money(data.totalCollection)}</p>
//         </div>
//         <div className="card bg-red-50 border-red-100">
//           <p className="text-sm text-red-700">This Year's Expenses</p>
//           <p className="text-xl font-bold text-red-700">{money(data.totalExpense)}</p>
//         </div>
//       </div>

//       {Number(data.openingBalance) > 0 && (
//         <div className="card bg-gray-50">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-500">Brought forward from before</span>
//             <span className="font-medium text-gray-700">{money(data.openingBalance)}</span>
//           </div>
//           <div className="flex justify-between text-sm mt-1">
//             <span className="text-gray-500">This year's surplus</span>
//             <span className="font-medium text-gray-700">{money(data.yearSurplus)}</span>
//           </div>
//         </div>
//       )}

//       {hasLending && (
//         <div className="card bg-blue-50 border-blue-100">
//           <p className="text-sm text-blue-700 mb-1">Village Lending Fund</p>
//           <div className="flex justify-between text-sm">
//             <span className="text-blue-600">Currently lent out</span>
//             <span className="font-medium text-blue-700">{money(data.outstandingPrincipal)}</span>
//           </div>
//           <div className="flex justify-between text-sm mt-1">
//             <span className="text-blue-600">Interest earned (all time)</span>
//             <span className="font-medium text-blue-700">{money(data.totalInterestEarned)}</span>
//           </div>
//         </div>
//       )}

//       <div className="card bg-saffron-50 border-saffron-100">
//         <p className="text-sm text-saffron-700">Cash in Hand Right Now</p>
//         <p className="text-2xl font-bold text-saffron-700">{money(data.cashInHand)}</p>
//         {hasLending && (
//           <p className="text-xs text-saffron-600 mt-1">
//             (Total fund of {money(data.fundAvailable)}, with {money(data.outstandingPrincipal)} out on loan to the village)
//           </p>
//         )}
//       </div>

//       <div className="grid grid-cols-2 gap-3 text-center">
//         <div className="card">
//           <p className="text-2xl font-bold text-gray-800">{data.totalDonors}</p>
//           <p className="text-sm text-gray-500">Donors</p>
//         </div>
//         <div className="card">
//           <p className="text-2xl font-bold text-gray-800">{data.daysCount}</p>
//           <p className="text-sm text-gray-500">Festival Days</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-3">
//         <Link to="/ledger" className="btn-secondary text-center">Day-wise Ledger</Link>
//         <Link to="/velam" className="btn-secondary text-center">Velam Paata</Link>
//         <Link to="/programs" className="btn-secondary text-center">Programs</Link>
//         <Link to="/sponsors" className="btn-secondary text-center">Sponsors</Link>
//       </div>
//     </div>
//   )
// }
