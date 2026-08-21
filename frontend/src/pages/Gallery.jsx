import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useYear } from '../context/YearContext'
import { getFullImageUrl } from '../utils/imageUrl'

const CATEGORIES = [
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'DECORATION', label: 'Decoration' },
  { value: 'CELEBRATION', label: 'Celebration' },
]
const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label || v

export default function Gallery() {
  const { selectedYear } = useYear()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    api.get(`/public/years/${selectedYear}/gallery-photos`)
      .then((res) => setPhotos(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [selectedYear])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading gallery...</p>
      </div>
    )
  }

  const visiblePhotos = filterCategory === 'ALL' ? photos : photos.filter((p) => p.category === filterCategory)

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              📷 Photo Gallery {selectedYear}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Festival Moments
            </h1>
            <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-lg">
              Festival photos, decoration, and celebration highlights from this year's Utsav.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['ALL', ...CATEGORIES.map((c) => c.value)].map((v) => (
            <button
              key={v}
              onClick={() => setFilterCategory(v)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition ${
                filterCategory === v ? 'bg-orange-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {v === 'ALL' ? 'All Photos' : categoryLabel(v)}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {visiblePhotos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
            <span className="text-4xl block mb-2">📷</span>
            <h3 className="text-lg font-bold text-gray-800">No Photos Yet</h3>
            <p className="text-sm text-gray-500 mt-1">Please check back soon or switch festival year.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visiblePhotos.map((photo) => {
              const imageUrl = getFullImageUrl(photo.imageUrl)
              return (
                <button
                  key={photo.id}
                  onClick={() => imageUrl && setLightbox(photo)}
                  className="group relative bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 overflow-hidden text-left"
                >
                  <div className="aspect-square w-full bg-gradient-to-br from-orange-50 to-amber-50/60 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={photo.caption || categoryLabel(photo.category)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-orange-300">📷</div>
                    )}
                  </div>
                  <span className="absolute top-2 left-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-black/50 text-white backdrop-blur-sm">
                    {categoryLabel(photo.category)}
                  </span>
                  {photo.caption && (
                    <p className="px-2.5 py-2 text-xs text-gray-700 truncate">{photo.caption}</p>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Simple lightbox for a closer look */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-2xl w-full">
            <img
              src={getFullImageUrl(lightbox.imageUrl)}
              alt={lightbox.caption || categoryLabel(lightbox.category)}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            {lightbox.caption && (
              <p className="text-white text-center text-sm mt-3">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
