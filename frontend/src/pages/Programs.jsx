import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

export default function Programs() {
  const { selectedYear } = useYear()
  const [programs, setPrograms] = useState([])
  const [dayMap, setDayMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)

    // Fetch both programs and day-list so date is GUARANTEED to show even if lazy loaded
    Promise.all([
      api.get(`/public/years/${selectedYear}/programs`),
      api.get(`/public/years/${selectedYear}/day-list`).catch(() => ({ data: [] }))
    ])
      .then(([progRes, daysRes]) => {
        setPrograms(progRes.data || [])
        // Map dayId and dayNumber to actual dates
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

  // Smart Date Resolver
  const resolveDateInfo = (p) => {
    // 1. Direct from festivalDay entity
    if (p.festivalDay?.festivalDate || p.festivalDay?.date) {
      return {
        date: p.festivalDay.festivalDate || p.festivalDay.date,
        dayNumber: p.festivalDay.dayNumber
      }
    }
    // 2. Direct programDate
    if (p.programDate || p.date) {
      return { date: p.programDate || p.date, dayNumber: p.dayNumber }
    }
    // 3. Lookup from dayMap by festival_day_id
    if (p.festivalDayId && dayMap[p.festivalDayId]) {
      const d = dayMap[p.festivalDayId]
      return { date: d.festivalDate || d.date, dayNumber: d.dayNumber }
    }
    if (p.dayNumber && dayMap[`day_${p.dayNumber}`]) {
      const d = dayMap[`day_${p.dayNumber}`]
      return { date: d.festivalDate || d.date, dayNumber: d.dayNumber }
    }
    return { date: null, dayNumber: p.dayNumber || null }
  }

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
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading schedule...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Festive Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              ✨ Festival Schedule {selectedYear}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Cultural Programs & Divine Pujas
            </h1>
            <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-xl">
              Daily devotional bhajans, spiritual events, and celebrations scheduled for the Vinayaka Chavithi Utsav.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Programs Schedule List */}
        {programs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
            <span className="text-4xl block mb-2">🪔</span>
            <h3 className="text-lg font-bold text-gray-800">No Programs Scheduled Yet</h3>
            <p className="text-sm text-gray-500 mt-1">Please check back soon or switch festival years.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {programs.map((p, idx) => {
              const { date, dayNumber } = resolveDateInfo(p)
              const dateObj = formatDisplayDate(date)

              return (
                <div
                  key={p.id || idx}
                  className="bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 overflow-hidden flex flex-col sm:flex-row items-stretch"
                >
                  {/* Left Date Ribbon / Calendar Badge */}
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
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">Day {dayNumber || (idx + 1)}</span>
                        <span className="text-[10px] uppercase tracking-wider text-orange-200">Celebration</span>
                      </div>
                    )}
                  </div>

                  {/* Program Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3 bg-white">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            {dayNumber && (
                              <span className="bg-orange-50 text-orange-700 border border-orange-200/80 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                                Day {dayNumber}
                              </span>
                            )}
                            <h3 className="text-lg font-bold text-gray-900">
                              {p.name}
                            </h3>
                          </div>
                        </div>

                        {/* Time Slot Tag */}
                        {p.timeSlot && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl shrink-0 shadow-2xs">
                            ⏰ {p.timeSlot}
                          </span>
                        )}
                      </div>

                      {/* Description / Location */}
                      {p.description && (
                        <p className="text-sm text-gray-600 mt-2.5 leading-relaxed bg-orange-50/30 border-l-2 border-orange-400 pl-3 py-1 rounded-r">
                          {p.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Extra Info */}
                    {p.performerOrChiefGuest && (
                      <div className="pt-2 border-t border-gray-100 flex items-center text-xs text-indigo-700 font-medium">
                        <span>🎙️ Performed by: <strong className="text-gray-800 font-semibold">{p.performerOrChiefGuest}</strong></span>
                      </div>
                    )}
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

// export default function Programs() {
//   const { selectedYear } = useYear()
//   const [programs, setPrograms] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!selectedYear) return
//     api.get(`/public/years/${selectedYear}/programs`)
//       .then((res) => setPrograms(res.data))
//       .finally(() => setLoading(false))
//   }, [selectedYear])

//   if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

//   return (
//     <div className="space-y-3">
//       <h1 className="text-xl font-bold text-gray-800">Programs — {selectedYear}</h1>
//       {programs.length === 0 && <p className="text-gray-500">No programs added yet.</p>}
//       {programs.map((p) => (
//         <div key={p.id} className="card">
//           <div className="flex justify-between items-start">
//             <p className="font-semibold text-gray-800">{p.name}</p>
//             {p.timeSlot && <span className="text-xs bg-saffron-50 text-saffron-700 px-2 py-1 rounded">{p.timeSlot}</span>}
//           </div>
//           {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
//           {p.festivalDay && <p className="text-xs text-gray-400 mt-1">Day {p.festivalDay.dayNumber} · {p.festivalDay.date}</p>}
//         </div>
//       ))}
//     </div>
//   )
// }
