import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const publicLinks = [
  { to: '/', key: 'dashboard' },
  { to: '/ledger', key: 'dayWiseLedger' },
  { to: '/programs', key: 'programs' },
  { to: '/annadanam', key: 'annadanamSponsors' },
  { to: '/sponsors', key: 'sponsors' },
  { to: '/velam', key: 'velamPaata' },
  { to: '/gallery', key: 'gallery' },
  { to: '/leaderboard', key: 'leaderboard' },
  { to: '/past-years', key: 'pastYears' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()
  const { language, toggleLanguage, t } = useLanguage()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <nav className="bg-saffron-600 text-white sticky top-0 z-40 shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold text-lg">🕉️ {t('appTitle')}</Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition"
            title="Switch language / భాష మార్చండి"
          >
            {language === 'en' ? 'తెలుగు' : 'English'}
          </button>
          <button onClick={() => setOpen(!open)} className="text-2xl leading-none">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-saffron-700 px-4 pb-4">
          {!isAdminRoute && publicLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2.5 border-b border-saffron-500/40 text-white"
            >
              {t(l.key)}
            </Link>
          ))}

          <div className="mt-2 pt-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="block py-2.5 border-b border-saffron-500/40 font-medium"
                >
                  {t('adminPanel')} ({user?.name})
                </Link>
                <button
                  onClick={() => { logout(); setOpen(false) }}
                  className="block w-full text-left py-2.5 text-saffron-100"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="block py-2.5 font-medium"
              >
                {t('adminLogin')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
