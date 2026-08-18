import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const publicLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/ledger', label: 'Day-wise Ledger' },
  { to: '/programs', label: 'Programs' },
  { to: '/annadanam', label: 'Annadanam Sponsors' },
  { to: '/sponsors', label: 'Sponsors' },
  { to: '/velam', label: 'Velam Paata' },
  { to: '/past-years', label: 'Past Years' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <nav className="bg-saffron-600 text-white sticky top-0 z-40 shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold text-lg">🕉️ Ganesh Utsav</Link>
        <button onClick={() => setOpen(!open)} className="text-2xl leading-none">
          {open ? '✕' : '☰'}
        </button>
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
              {l.label}
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
                  Admin Panel ({user?.name})
                </Link>
                <button
                  onClick={() => { logout(); setOpen(false) }}
                  className="block w-full text-left py-2.5 text-saffron-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="block py-2.5 font-medium"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
