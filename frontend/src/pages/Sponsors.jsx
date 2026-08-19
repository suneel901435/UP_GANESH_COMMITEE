import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function Sponsors() {
  const { selectedYear } = useYear()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    api.get(`/public/years/${selectedYear}/sponsors`)
      .then((res) => setList(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [selectedYear])

  const totalSponsorAmount = list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading sponsors...</p>
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
                ✨ Devotee Contributions {selectedYear}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Festival Sponsors & Donors
              </h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-xl">
                Heartfelt gratitude to our noble sponsors for their generous support towards Vinayaka Chavithi Utsav.
              </p>
            </div>

            {totalSponsorAmount > 0 && (
              <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-left sm:text-right shrink-0">
                <span className="text-[11px] uppercase tracking-wider text-orange-200 block font-semibold">
                  Total Sponsored
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {money(totalSponsorAmount)}
                </span>
              </div>
            )}
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Sponsors Grid / List */}
        {list.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
            <span className="text-4xl block mb-2">🙏</span>
            <h3 className="text-lg font-bold text-gray-800">No Sponsors Listed Yet</h3>
            <p className="text-sm text-gray-500 mt-1">Please check back soon or switch festival year.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map((s, idx) => (
              <div
                key={s.id || idx}
                className="bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-base shrink-0">
                        🕉️
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-snug">
                          {s.sponsorName}
                        </h3>
                        {s.category && (
                          <span className="inline-block mt-0.5 text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded uppercase tracking-wide">
                            {s.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {s.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 bg-orange-50/30 border-l-2 border-orange-400 pl-2.5 py-1 rounded-r leading-relaxed">
                      {s.notes}
                    </p>
                  )}
                </div>

                {s.amount != null && (
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Sponsorship Amount</span>
                    <span className="text-base font-extrabold text-orange-700 bg-orange-50/80 px-2.5 py-1 rounded-lg">
                      {money(s.amount)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


// import React, { useEffect, useState } from 'react'
// import api from '../api/axios'
// import { useYear } from '../context/YearContext'

// function money(n) {
//   return `₹${Number(n || 0).toLocaleString('en-IN')}`
// }

// export default function Sponsors() {
//   const { selectedYear } = useYear()
//   const [list, setList] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!selectedYear) return
//     api.get(`/public/years/${selectedYear}/sponsors`)
//       .then((res) => setList(res.data))
//       .finally(() => setLoading(false))
//   }, [selectedYear])

//   if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

//   return (
//     <div className="space-y-3">
//       <h1 className="text-xl font-bold text-gray-800">Sponsors — {selectedYear}</h1>
//       {list.length === 0 && <p className="text-gray-500">No sponsors added yet.</p>}
//       {list.map((s) => (
//         <div key={s.id} className="card flex justify-between items-center">
//           <div>
//             <p className="font-medium text-gray-800">{s.sponsorName}</p>
//             <p className="text-xs text-gray-400">{s.category}{s.notes ? ` · ${s.notes}` : ''}</p>
//           </div>
//           {s.amount != null && <p className="font-semibold text-saffron-700">{money(s.amount)}</p>}
//         </div>
//       ))}
//     </div>
//   )
// }
