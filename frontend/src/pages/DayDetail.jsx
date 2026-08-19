import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function DayDetail() {
  const { date } = useParams()
  const { selectedYear } = useYear()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    api.get(`/public/years/${selectedYear}/day-detail/${date}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [date, selectedYear])

  const formatHeaderDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return {
      weekday: d.toLocaleDateString('en-IN', { weekday: 'long' }),
      formatted: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading transaction details...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-300 max-w-md w-full shadow-sm">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="text-lg font-bold text-gray-800">No Data Found</h3>
          <p className="text-sm text-gray-500 mt-1">No transaction records available for date: {date}</p>
          <Link
            to="/ledger"
            className="mt-5 inline-block text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-600 hover:text-white px-4 py-2 rounded-xl transition"
          >
            ← Return to Ledger
          </Link>
        </div>
      </div>
    )
  }

  const dateObj = formatHeaderDate(data.date)

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back navigation button */}
        <Link
          to="/ledger"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-white hover:bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all"
        >
          ← Back to Ledger
        </Link>

        {/* Festive Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {data.festivalDayLabel ? data.festivalDayLabel : 'Chanda / Pre-festival'}
                </span>
                <span className="text-xs text-orange-200 font-medium">
                  {dateObj.weekday}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {dateObj.formatted || data.date}
              </h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-lg">
                {data.festivalDayLabel
                  ? `Detailed collections, seva donations, and expenditures for ${data.festivalDayLabel}.`
                  : 'Chanda contributions and preparatory festival expenses recorded on this date.'}
              </p>
            </div>

            {/* Quick Balance Stat Badge */}
            <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 text-left md:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-orange-200 block">
                Net Day Balance
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {money(data.balance)}
              </span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 shadow-xs">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Total Collected
            </span>
            <p className="text-lg sm:text-2xl font-black text-emerald-700 mt-1">
              {money(data.totalCollection)}
            </p>
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              {data.collections?.length || 0} Devotee Donations
            </span>
          </div>

          <div className="bg-white border border-red-100 rounded-2xl p-4 sm:p-5 shadow-xs">
            <span className="text-[10px] sm:text-xs font-bold text-red-800 uppercase tracking-wider block">
              Total Spent
            </span>
            <p className="text-lg sm:text-2xl font-black text-red-600 mt-1">
              {money(data.totalExpense)}
            </p>
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              {data.expenses?.length || 0} Expense Entries
            </span>
          </div>

          <div className="bg-white border border-orange-100 rounded-2xl p-4 sm:p-5 shadow-xs">
            <span className="text-[10px] sm:text-xs font-bold text-orange-800 uppercase tracking-wider block">
              Closing Balance
            </span>
            <p className={`text-lg sm:text-2xl font-black mt-1 ${(Number(data.balance) || 0) >= 0 ? 'text-orange-950' : 'text-red-700'}`}>
              {money(data.balance)}
            </p>
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              For This Day
            </span>
          </div>
        </div>

        {/* Donations Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 px-3 bg-emerald-600 text-white rounded-lg flex items-center font-bold text-xs shadow-2xs uppercase tracking-wide">
              💰 Donations & Chanda ({data.collections?.length || 0})
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
          </div>

          {(!data.collections || data.collections.length === 0) ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">No donations recorded on this date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.collections.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-emerald-100/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-sm shrink-0">
                      🙏
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {c.donorName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {c.paymentMode && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded uppercase">
                            {c.paymentMode}
                          </span>
                        )}
                        {c.notes && (
                          <span className="text-xs text-gray-400 truncate max-w-[150px]">
                            · {c.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-base font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 shrink-0">
                    +{money(c.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="h-7 px-3 bg-red-600 text-white rounded-lg flex items-center font-bold text-xs shadow-2xs uppercase tracking-wide">
              🧾 Expenditures ({data.expenses?.length || 0})
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-red-200 to-transparent"></div>
          </div>

          {(!data.expenses || data.expenses.length === 0) ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">No expenses recorded on this date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.expenses.map((e) => (
                <div
                  key={e.id}
                  className="bg-white rounded-2xl border border-red-100/80 shadow-xs hover:shadow-md hover:border-red-300 transition-all p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-sm shrink-0">
                      🏷️
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {e.category}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {e.description}{e.paidTo ? ` · Paid to: ${e.paidTo}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="text-base font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-xl border border-red-100 shrink-0">
                    -{money(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}


// import React, { useEffect, useState } from 'react'
// import { useParams, Link } from 'react-router-dom'
// import api from '../api/axios'
// import { useYear } from '../context/YearContext'

// function money(n) {
//   return `₹${Number(n || 0).toLocaleString('en-IN')}`
// }

// export default function DayDetail() {
//   const { date } = useParams()
//   const { selectedYear } = useYear()
//   const [data, setData] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!selectedYear) return
//     api.get(`/public/years/${selectedYear}/day-detail/${date}`)
//       .then((res) => setData(res.data))
//       .finally(() => setLoading(false))
//   }, [date, selectedYear])

//   if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>
//   if (!data) return <p className="text-center text-gray-500 mt-10">No data found for this date.</p>

//   return (
//     <div className="space-y-4">
//       <Link to="/ledger" className="text-saffron-600 text-sm">‹ Back to ledger</Link>
//       <h1 className="text-xl font-bold text-gray-800">
//         {data.date}{data.festivalDayLabel ? ` · ${data.festivalDayLabel}` : ''}
//       </h1>
//       {!data.festivalDayLabel && <p className="text-xs text-gray-400 -mt-3">Chanda / pre-festival collection</p>}

//       <div className="grid grid-cols-3 gap-2 text-center">
//         <div className="card"><p className="text-sm text-gray-400">Collected</p><p className="font-bold text-green-700">{money(data.totalCollection)}</p></div>
//         <div className="card"><p className="text-sm text-gray-400">Spent</p><p className="font-bold text-red-700">{money(data.totalExpense)}</p></div>
//         <div className="card"><p className="text-sm text-gray-400">Balance</p><p className="font-bold text-saffron-700">{money(data.balance)}</p></div>
//       </div>

//       <div>
//         <h2 className="font-semibold text-gray-700 mb-2">Donations ({data.collections.length})</h2>
//         <div className="space-y-2">
//           {data.collections.length === 0 && <p className="text-sm text-gray-400">No donations recorded.</p>}
//           {data.collections.map((c) => (
//             <div key={c.id} className="card flex justify-between items-center">
//               <div>
//                 <p className="font-medium text-gray-800">{c.donorName}</p>
//                 <p className="text-xs text-gray-400">{c.paymentMode}{c.notes ? ` · ${c.notes}` : ''}</p>
//               </div>
//               <p className="font-semibold text-green-700">{money(c.amount)}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div>
//         <h2 className="font-semibold text-gray-700 mb-2">Expenses ({data.expenses.length})</h2>
//         <div className="space-y-2">
//           {data.expenses.length === 0 && <p className="text-sm text-gray-400">No expenses recorded.</p>}
//           {data.expenses.map((e) => (
//             <div key={e.id} className="card flex justify-between items-center">
//               <div>
//                 <p className="font-medium text-gray-800">{e.category}</p>
//                 <p className="text-xs text-gray-400">{e.description}{e.paidTo ? ` · Paid to ${e.paidTo}` : ''}</p>
//               </div>
//               <p className="font-semibold text-red-700">{money(e.amount)}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }
