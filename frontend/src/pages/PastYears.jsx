import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function PastYears() {
  const { setSelectedYear } = useYear()
  const [years, setYears] = useState([])
  const [summaries, setSummaries] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/years').then(async (res) => {
      const yearList = res.data || []
      setYears(yearList)
      const entries = await Promise.all(
        yearList.map(async (y) => {
          try {
            const d = await api.get(`/public/years/${y.year}/dashboard`)
            return [y.year, d.data]
          } catch {
            return [y.year, null]
          }
        })
      )
      setSummaries(Object.fromEntries(entries))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading festival archives...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Festive Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                📜 Festival Archives
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Historical Celebrations & Ledgers
              </h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-xl">
                Browse through past years of Vinayaka Chavithi Utsav celebrations, collections, and financial milestones.
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 text-left sm:text-right shrink-0">
              <span className="text-[11px] uppercase tracking-wider text-orange-200 block font-semibold">
                Recorded Years
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-white">
                {years.length} Editions
              </span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Years List */}
        {years.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
            <span className="text-4xl block mb-2">📅</span>
            <h3 className="text-lg font-bold text-gray-800">No Historical Years Found</h3>
            <p className="text-sm text-gray-500 mt-1">Festival year records will appear here once archived.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {years.map((y) => {
              const s = summaries[y.year]
              const collected = s?.totalCollection ?? s?.totalCollections ?? 0
              const spent = s?.totalExpense ?? s?.totalExpenses ?? 0
              const balance = s?.balance ?? (collected - spent)

              return (
                <div
                  key={y.id}
                  className="bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 overflow-hidden flex flex-col sm:flex-row items-stretch"
                >
                  {/* Left Year Badge */}
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white sm:w-32 p-4 flex sm:flex-col items-center justify-between sm:justify-center text-center shrink-0">
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                      Utsav
                    </span>
                    <span className="text-2xl sm:text-3xl font-black leading-none my-1">
                      {y.year}
                    </span>
                    {y.active ? (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-semibold bg-black/20 text-orange-100 px-2 py-0.5 rounded">
                        Archived
                      </span>
                    )}
                  </div>

                  {/* Card Content Area */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-lg">
                            Vinayaka Chavithi {y.year}
                          </h3>
                          {y.active && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                              Live Year
                            </span>
                          )}
                        </div>
                        {y.startDate && y.endDate ? (
                          <p className="text-xs text-gray-500 mt-0.5">
                            🗓️ {new Date(y.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(y.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-0.5">Annual Celebrations</p>
                        )}
                      </div>

                      {/* Switch to this Year Action */}
                      <button
                        onClick={() => setSelectedYear(y.year)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-600 hover:text-white border border-orange-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                      >
                        View Year Details →
                      </button>
                    </div>

                    {/* Financial Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                      <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Total Collection
                        </span>
                        <span className="text-sm sm:text-base font-black text-emerald-700">
                          {money(collected)}
                        </span>
                      </div>

                      <div className="bg-red-50/70 border border-red-100/80 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                          Total Expenses
                        </span>
                        <span className="text-sm sm:text-base font-black text-red-600">
                          {money(spent)}
                        </span>
                      </div>

                      <div className="bg-orange-50/70 border border-orange-100/80 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                          Net Balance
                        </span>
                        <span className={`text-sm sm:text-base font-black ${balance >= 0 ? 'text-orange-950' : 'text-red-700'}`}>
                          {money(balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


// import React, { useEffect, useState } from 'react'
// import api from '../api/axios'

// function money(n) {
//   return `₹${Number(n || 0).toLocaleString('en-IN')}`
// }

// export default function PastYears() {
//   const [years, setYears] = useState([])
//   const [summaries, setSummaries] = useState({})
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     api.get('/public/years').then(async (res) => {
//       setYears(res.data)
//       const entries = await Promise.all(
//         res.data.map(async (y) => {
//           try {
//             const d = await api.get(`/public/years/${y.year}/dashboard`)
//             return [y.year, d.data]
//           } catch {
//             return [y.year, null]
//           }
//         })
//       )
//       setSummaries(Object.fromEntries(entries))
//       setLoading(false)
//     })
//   }, [])

//   if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

//   return (
//     <div className="space-y-3">
//       <h1 className="text-xl font-bold text-gray-800">Past Years</h1>
//       {years.length === 0 && <p className="text-gray-500">No historical years added yet.</p>}
//       {years.map((y) => {
//         const s = summaries[y.year]
//         return (
//           <div key={y.id} className="card">
//             <p className="font-semibold text-gray-800">{y.year}{y.active ? ' (current)' : ''}</p>
//             {s && (
//               <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
//                 <div><p className="text-gray-400">Collected</p><p className="font-medium text-green-700">{money(s.totalCollection)}</p></div>
//                 <div><p className="text-gray-400">Spent</p><p className="font-medium text-red-700">{money(s.totalExpense)}</p></div>
//                 <div><p className="text-gray-400">Balance</p><p className="font-medium text-saffron-700">{money(s.balance)}</p></div>
//               </div>
//             )}
//           </div>
//         )
//       })}
//     </div>
//   )
// }
