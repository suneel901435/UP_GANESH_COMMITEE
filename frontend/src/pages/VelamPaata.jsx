import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function VelamPaata() {
  const { selectedYear } = useYear()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    api.get(`/public/years/${selectedYear}/velam-items`)
      .then((res) => setItems(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [selectedYear])

  const totalRaised = items
    .filter((i) => i.status === 'SOLD')
    .reduce((sum, i) => sum + Number(i.finalPrice || 0), 0)

  const soldCount = items.filter((i) => i.status === 'SOLD').length

  const getFullImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url
    }
    const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '')
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading Velam Paata items...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Festive Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                🔨 Sacred Auction {selectedYear}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Velam Paata & Prasadam Bids
              </h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-lg">
                Sacred Kalasham, Laddu Prasadam, and devotional items auctioned for divine blessings and temple development.
              </p>
            </div>

            {/* Total Raised Stat Box */}
            <div className="flex sm:flex-row md:flex-col gap-3 shrink-0">
              <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 text-left md:text-right">
                <span className="text-[11px] uppercase tracking-wider text-orange-200 block font-semibold">
                  Total Auction Raised
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {money(totalRaised)}
                </span>
                <span className="text-[11px] text-orange-200 block mt-0.5">
                  {soldCount} of {items.length} items awarded
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Velam Items Grid */}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
            <span className="text-4xl block mb-2">🏷️</span>
            <h3 className="text-lg font-bold text-gray-800">No Auction Items Listed Yet</h3>
            <p className="text-sm text-gray-500 mt-1">Please check back soon or switch festival year.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const isSold = item.status === 'SOLD'
              const imageUrl = getFullImageUrl(item.imageUrl)

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Item Image with Devotional Fallback */}
                    <div className="h-44 w-full bg-gradient-to-br from-orange-50 to-amber-50/60 relative flex items-center justify-center overflow-hidden border-b border-orange-100/60">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.itemName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}

                      {/* Fallback Icon Box if no image or broken link */}
                      <div
                        className="flex-col items-center justify-center text-orange-400 p-4 text-center"
                        style={{ display: imageUrl ? 'none' : 'flex' }}
                      >
                        <span className="text-3xl mb-1">🪔</span>
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">
                          Devotional Item
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`absolute top-3 right-3 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                          isSold
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white animate-pulse'
                        }`}
                      >
                        {isSold ? '✓ Sold' : 'Open for Bid'}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 space-y-2">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug">
                        {item.itemName}
                      </h3>

                      {item.description && (
                        <p className="text-xs sm:text-sm text-gray-600 bg-orange-50/40 border-l-2 border-orange-400 pl-2.5 py-1 rounded-r leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Pricing & Buyer Section */}
                  <div className="p-4 sm:p-5 pt-0 space-y-3">
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">
                        {isSold ? 'Winning Bid' : 'Base Price'}
                      </span>
                      <span className="text-base sm:text-lg font-black text-orange-700">
                        {money(isSold ? item.finalPrice : item.basePrice)}
                      </span>
                    </div>

                    {/* Winner / Buyer Tag */}
                    {isSold ? (
                      <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center gap-2">
                        <span className="text-base">🏆</span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                            Won By
                          </span>
                          <span className="text-xs font-bold text-emerald-950 truncate block">
                            {item.buyerName || item.winnerName || 'Anonymous Devotee'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl py-2 px-3 text-center">
                        <span className="text-xs font-bold text-amber-800">
                          Bidding at Mandapam
                        </span>
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

// function money(n) {
//   return `₹${Number(n || 0).toLocaleString('en-IN')}`
// }

// export default function VelamPaata() {
//   const { selectedYear } = useYear()
//   const [items, setItems] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!selectedYear) return
//     api.get(`/public/years/${selectedYear}/velam-items`)
//       .then((res) => setItems(res.data))
//       .finally(() => setLoading(false))
//   }, [selectedYear])

//   if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>

//   const totalRaised = items
//     .filter((i) => i.status === 'SOLD')
//     .reduce((sum, i) => sum + Number(i.finalPrice || 0), 0)

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center">
//         <h1 className="text-xl font-bold text-gray-800">Velam Paata — {selectedYear}</h1>
//       </div>
//       <div className="card bg-saffron-50 border-saffron-100">
//         <p className="text-sm text-saffron-700">Total raised from sold items</p>
//         <p className="text-xl font-bold text-saffron-700">{money(totalRaised)}</p>
//       </div>

//       {items.length === 0 && <p className="text-gray-500">No items added yet.</p>}

//       <div className="grid grid-cols-2 gap-3">
//         {items.map((item) => (
//           <div key={item.id} className="card">
//             {item.imageUrl && (
//               <img
//                 src={item.imageUrl.startsWith('http') ? item.imageUrl : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '')}${item.imageUrl}`}
//                 alt={item.itemName}
//                 className="w-full h-28 object-cover rounded-lg mb-2"
//               />
//             )}
//             <p className="font-semibold text-gray-800 text-sm">{item.itemName}</p>
//             {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
//             <div className="mt-2 flex justify-between items-center">
//               <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'SOLD' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
//                 {item.status === 'SOLD' ? 'Sold' : 'Available'}
//               </span>
//               <p className="text-sm font-bold text-saffron-700">
//                 {money(item.status === 'SOLD' ? item.finalPrice : item.basePrice)}
//               </p>
//             </div>
//             {item.status === 'SOLD' && item.buyerName && (
//               <p className="text-xs text-gray-400 mt-1">Bought by {item.buyerName}</p>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }
