import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function AnnadanamSponsors() {
  const { selectedYear } = useYear()
  const [list, setList] = useState([])
  const [dayMap, setDayMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)

    // Fetch both sponsors and day-list to reliably resolve dates and day numbers
    Promise.all([
      api.get(`/public/years/${selectedYear}/annadanam-sponsors`),
      api.get(`/public/years/${selectedYear}/day-list`).catch(() => ({ data: [] }))
    ])
      .then(([sponsorsRes, daysRes]) => {
        setList(sponsorsRes.data || [])
        const mapping = {}
        ;(daysRes.data || []).forEach((d) => {
          if (d.id) mapping[d.id] = d
          if (d.dayNumber) mapping[`day_${d.dayNumber}`] = d
        })
        setDayMap(mapping)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [selectedYear])

  const resolveDayInfo = (item) => {
    if (item.festivalDay?.dayNumber || item.festivalDay?.festivalDate || item.festivalDay?.date) {
      return {
        dayNumber: item.festivalDay.dayNumber,
        date: item.festivalDay.festivalDate || item.festivalDay.date
      }
    }
    if (item.festivalDayId && dayMap[item.festivalDayId]) {
      const d = dayMap[item.festivalDayId]
      return { dayNumber: d.dayNumber, date: d.festivalDate || d.date }
    }
    if (item.dayNumber && dayMap[`day_${item.dayNumber}`]) {
      const d = dayMap[`day_${item.dayNumber}`]
      return { dayNumber: d.dayNumber, date: d.festivalDate || d.date }
    }
    return {
      dayNumber: item.dayNumber || null,
      date: item.annadanamDate || item.date || null
    }
  }

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return {
      day: d.toLocaleDateString('en-IN', { day: '2-digit' }),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  }

  // Group by resolved day key
  const grouped = list.reduce((acc, item) => {
    const { dayNumber, date } = resolveDayInfo(item)
    const key = dayNumber ? `Day ${dayNumber}` : 'General Festival Sponsors'
    if (!acc[key]) {
      acc[key] = {
        dayNumber,
        date,
        items: []
      }
    }
    acc[key].items.push(item)
    return acc
  }, {})

  const totalMeals = list.reduce((sum, item) => sum + (Number(item.mealCount) || 0), 0)
  const totalContributed = list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading Annadanam donors...</p>
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
                🍛 Maha Prasadam Seva {selectedYear}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Maha Annadanam Sponsors
              </h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-lg">
                Devotees generously sponsoring sacred meals and maha prasadam during the festival celebrations.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex sm:flex-row md:flex-col gap-3 shrink-0">
              <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 text-left md:text-right">
                <span className="text-[11px] uppercase tracking-wider text-orange-200 block font-semibold">
                  Total Annadanam Donors
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {list.length} Devotees
                </span>
                {totalMeals > 0 && (
                  <span className="text-[11px] text-orange-200 block mt-0.5">
                    {totalMeals.toLocaleString('en-IN')} Meals Sponsored
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Annadanam Schedule by Days */}
        {list.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
            <span className="text-4xl block mb-2">🍲</span>
            <h3 className="text-lg font-bold text-gray-800">No Annadanam Sponsors Added Yet</h3>
            <p className="text-sm text-gray-500 mt-1">Please check back soon or switch festival year.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([groupTitle, groupData]) => {
              const dateObj = formatDisplayDate(groupData.date)

              return (
                <div key={groupTitle} className="space-y-3">
                  {/* Day Header Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-8 px-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl flex items-center gap-1.5 font-bold text-xs shadow-sm uppercase tracking-wide">
                      <span>🍛</span>
                      <span>{groupTitle}</span>
                    </div>
                    {dateObj && (
                      <span className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-2xs">
                        🗓️ {dateObj.full} ({dateObj.weekday})
                      </span>
                    )}
                    <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                  </div>

                  {/* Sponsors Cards Grid for this Day */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groupData.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 p-5 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-lg shrink-0">
                              🙏
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-gray-900 text-base leading-snug">
                                {item.sponsorName}
                              </h3>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {item.mealCount && (
                                  <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                                    🍲 {item.mealCount} Meals
                                  </span>
                                )}
                                {item.phoneNumber && (
                                  <span className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                    📞 {item.phoneNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {item.notes && (
                            <p className="text-xs text-gray-600 bg-orange-50/40 border-l-2 border-orange-400 pl-2.5 py-1 rounded-r leading-relaxed">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        {item.amount != null && (
                          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                              Contribution
                            </span>
                            <span className="text-sm font-black text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100">
                              {money(item.amount)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
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
// import { useYear } from '../context/YearContext'

// function money(n) {
//   return `₹${Number(n || 0).toLocaleString('en-IN')}`
// }

// export default function AnnadanamSponsors() {
//   const { selectedYear } = useYear()
//   const [list, setList] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!selectedYear) return
//     api.get(`/public/years/${selectedYear}/annadanam-sponsors`)
//       .then((res) => setList(res.data))
//       .finally(() => setLoading(false))
//   }, [selectedYear])

//   if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

//   // Group by day for a clear "who sponsored annadanam on which day" view
//   const grouped = list.reduce((acc, item) => {
//     const key = item.festivalDay ? `Day ${item.festivalDay.dayNumber} · ${item.festivalDay.date}` : 'Unassigned'
//     acc[key] = acc[key] || []
//     acc[key].push(item)
//     return acc
//   }, {})

//   return (
//     <div className="space-y-4">
//       <h1 className="text-xl font-bold text-gray-800">Annadanam Sponsors — {selectedYear}</h1>
//       {list.length === 0 && <p className="text-gray-500">No annadanam sponsors added yet.</p>}

//       {Object.entries(grouped).map(([day, items]) => (
//         <div key={day}>
//           <h2 className="font-semibold text-gray-700 mb-2">{day}</h2>
//           <div className="space-y-2">
//             {items.map((a) => (
//               <div key={a.id} className="card flex justify-between items-center">
//                 <div>
//                   <p className="font-medium text-gray-800">{a.sponsorName}</p>
//                   <p className="text-xs text-gray-400">
//                     {a.mealCount ? `${a.mealCount} meals` : ''}{a.notes ? ` · ${a.notes}` : ''}
//                   </p>
//                 </div>
//                 {a.amount != null && <p className="font-semibold text-saffron-700">{money(a.amount)}</p>}
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }
