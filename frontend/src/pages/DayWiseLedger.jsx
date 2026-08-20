import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function DayWiseLedger() {
  const { selectedYear } = useYear()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    api.get(`/public/years/${selectedYear}/daily-ledger`)
      .then((res) => setEntries(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [selectedYear])

  const totalCollected = entries.reduce((acc, d) => acc + (Number(d.totalCollection) || 0), 0)
  const totalSpent = entries.reduce((acc, d) => acc + (Number(d.totalExpense) || 0), 0)
  const netBalance = totalCollected - totalSpent

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return {
      day: d.toLocaleDateString('en-IN', { day: '2-digit' }),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      year: d.getFullYear()
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading ledger records...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Festive Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                📒 Daily Accounts {selectedYear}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Day-wise Financial Ledger
              </h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-lg">
                Complete daily breakdown of devotee collections, chanda, and celebration expenses.
              </p>
            </div>

            {/* Overview Summary Box */}
            <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 flex items-center justify-between md:flex-col md:items-end gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-200 block">
                  Net Ledger Balance
                </span>
                <span className="text-2xl font-black text-white">
                  {money(netBalance)}
                </span>
              </div>
              <div className="text-xs text-orange-200 font-medium">
                <span className="text-emerald-300 font-semibold">+{money(totalCollected)}</span> / <span className="text-red-300 font-semibold">-{money(totalSpent)}</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Ledger Entries List */}
        {entries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
            <span className="text-4xl block mb-2">📖</span>
            <h3 className="text-lg font-bold text-gray-800">No Records Recorded Yet</h3>
            <p className="text-sm text-gray-500 mt-1">No collections or expenses have been logged for {selectedYear}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((d, idx) => {
              const dateObj = formatDisplayDate(d.date)

              return (
                <Link
                  key={d.date || idx}
                  to={`/ledger/day/${d.date}`}
                  className="group bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 overflow-hidden flex flex-col sm:flex-row items-stretch"
                >
                  {/* Left Date Ribbon */}
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white sm:w-28 p-4 flex sm:flex-col items-center justify-between sm:justify-center text-center shrink-0">
                    {dateObj ? (
                      <>
                        <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                          {dateObj.weekday}
                        </span>
                        <span className="text-2xl sm:text-3xl font-black leading-none my-1">
                          {dateObj.day}
                        </span>
                        <span className="text-xs uppercase tracking-wider font-bold bg-black/20 px-2 py-0.5 rounded">
                          {dateObj.month}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-bold">{d.date}</span>
                    )}
                  </div>

                  {/* Right Content Area */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-base group-hover:text-orange-600 transition-colors">
                            {d.festivalDayLabel ? d.festivalDayLabel : 'Chanda / Pre-festival Collection'}
                          </h3>
                          {d.festivalDayLabel && (
                            <span className="bg-orange-50 text-orange-700 border border-orange-200/80 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                              Festival Day
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Date: {d.date}
                        </p>
                      </div>

                      <span className="text-orange-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all text-xl font-bold">
                        →
                      </span>
                    </div>

                    {/* Financial Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                      <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Collected
                        </span>
                        <span className="text-sm sm:text-base font-black text-emerald-700">
                          {money(d.totalCollection)}
                        </span>
                      </div>

                      <div className="bg-red-50/70 border border-red-100/80 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                          Spent
                        </span>
                        <span className="text-sm sm:text-base font-black text-red-600">
                          {money(d.totalExpense)}
                        </span>
                      </div>

                      <div className="bg-orange-50/70 border border-orange-100/80 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                          Day Balance
                        </span>
                        <span className={`text-sm sm:text-base font-black ${(Number(d.balance) || 0) >= 0 ? 'text-orange-950' : 'text-red-700'}`}>
                          {money(d.balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
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

// export default function DayWiseLedger() {
//   const { selectedYear } = useYear()
//   const [entries, setEntries] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!selectedYear) return
//     api.get(`/public/years/${selectedYear}/daily-ledger`)
//       .then((res) => setEntries(res.data))
//       .finally(() => setLoading(false))
//   }, [selectedYear])

//   if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

//   return (
//     <div className="space-y-3">
//       <h1 className="text-xl font-bold text-gray-800">Day-wise Ledger — {selectedYear}</h1>
//       <p className="text-xs text-gray-400 -mt-2">
//         Every day money was collected or spent — including chanda collection before the festival itself.
//       </p>

//       {entries.length === 0 && <p className="text-gray-500">No collections or expenses recorded yet.</p>}

//       {entries.map((d) => (
//         <Link key={d.date} to={`/ledger/day/${d.date}`} className="card block active:bg-gray-50">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="font-semibold text-gray-800">
//                 {d.date}{d.festivalDayLabel ? ` · ${d.festivalDayLabel}` : ''}
//               </p>
//               {!d.festivalDayLabel && <p className="text-xs text-gray-400">Chanda / pre-festival collection</p>}
//             </div>
//             <span className="text-gray-400">›</span>
//           </div>
//           <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
//             <div>
//               <p className="text-gray-400">Collected</p>
//               <p className="font-medium text-green-700">{money(d.totalCollection)}</p>
//             </div>
//             <div>
//               <p className="text-gray-400">Spent</p>
//               <p className="font-medium text-red-700">{money(d.totalExpense)}</p>
//             </div>
//             <div>
//               <p className="text-gray-400">Balance</p>
//               <p className="font-medium text-saffron-700">{money(d.balance)}</p>
//             </div>
//           </div>
//         </Link>
//       ))}
//     </div>
//   )
// }
