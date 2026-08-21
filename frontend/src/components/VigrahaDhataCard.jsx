import React, { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { useLanguage } from '../context/LanguageContext'

// Category key seeded in DataSeeder / used by ManageSponsorCategories.
// Sponsor.category stores this exact string for the idol ("Vigraha Dhata") sponsor(s).
const VIGRAHA_CATEGORY_KEY = 'vigraha_data'

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

/**
 * Flex (flip) card that reveals the Vigraha Dhata (idol sponsor) on the back
 * face. Behaviour:
 *  - Click anywhere on the card -> flips it immediately (front <-> back).
 *  - Left alone, it auto-flips every few seconds on its own, cycling through
 *    every vigraha_data sponsor on file (if more than one) before returning
 *    to the front "tap to reveal" face.
 * Used on both the public Dashboard and the Admin Dashboard.
 */
export default function VigrahaDhataCard({ year }) {
  const { t } = useLanguage()
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)
  const [flipped, setFlipped] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!year) return
    setLoading(true)
    api.get(`/public/years/${year}/sponsors`)
      .then((res) => {
        const list = (res.data || []).filter((s) => s.category === VIGRAHA_CATEGORY_KEY)
        setSponsors(list)
        setActiveIndex(0)
        setFlipped(false)
      })
      .catch(() => setSponsors([]))
      .finally(() => setLoading(false))
  }, [year])

  // Auto-rotate: every ~4.5s, flip the card. Whenever it lands back on the
  // front face, advance to the next sponsor so a fresh name shows next time.
  useEffect(() => {
    if (loading) return
    const startTimer = () => {
      clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setFlipped((prevFlipped) => {
          if (prevFlipped) {
            setActiveIndex((i) => (sponsors.length > 0 ? (i + 1) % sponsors.length : 0))
          }
          return !prevFlipped
        })
      }, 4500)
    }
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [loading, sponsors.length])

  const handleClick = () => {
    setFlipped((prev) => {
      const next = !prev
      if (prev) {
        setActiveIndex((i) => (sponsors.length > 0 ? (i + 1) % sponsors.length : 0))
      }
      return next
    })
    // Reset the auto-rotate timer so a manual tap doesn't fight the interval.
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setFlipped((prevFlipped) => {
        if (prevFlipped) {
          setActiveIndex((i) => (sponsors.length > 0 ? (i + 1) % sponsors.length : 0))
        }
        return !prevFlipped
      })
    }, 4500)
  }

  if (loading) return null

  const current = sponsors[activeIndex]
  const hasSponsors = sponsors.length > 0

  return (
    <div className="[perspective:1200px] w-full select-none">
      <div
        onClick={handleClick}
        role="button"
        aria-label={t('vigrahaDhata')}
        className="relative w-full h-36 sm:h-40 cursor-pointer transition-transform duration-700 ease-in-out [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front face */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 border border-orange-300/40 p-5 sm:p-6 flex items-center justify-between overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ✨ {t('flexCard')}
            </span>
            <h3 className="text-lg sm:text-xl font-black tracking-tight">{t('vigrahaDhata')}</h3>
            <p className="text-xs text-orange-50/90 font-medium">{t('tapToReveal')}</p>
          </div>
          <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl shrink-0">
            🕉️
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] rounded-3xl bg-white border-2 border-orange-300 shadow-lg p-5 sm:p-6 flex items-center justify-between overflow-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="relative z-10 space-y-1">
            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-200">
              🪔 {t('vigrahaDhata')}
            </span>
            {hasSponsors ? (
              <>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-gray-900">
                  {current?.sponsorName}
                </h3>
                {current?.amount != null && (
                  <p className="text-xs text-emerald-700 font-bold">{money(current.amount)}</p>
                )}
                {sponsors.length > 1 && (
                  <p className="text-[11px] text-gray-400 font-semibold">
                    {activeIndex + 1} / {sponsors.length}
                  </p>
                )}
              </>
            ) : (
              <>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-gray-700">
                  {t('toBeAnnounced')}
                </h3>
                <p className="text-xs text-gray-400 font-medium">{t('vigrahaDhataEmpty')}</p>
              </>
            )}
          </div>
          <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center text-3xl shrink-0">
            🙏
          </div>
        </div>
      </div>
    </div>
  )
}
