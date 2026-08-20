import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useYear } from '../../context/YearContext'

const tiles = [
  { to: '/admin/setup', label: 'Festival Year & Days', icon: '📅', desc: 'Set up this year and its days first' },
  { to: '/admin/collections', label: 'Collections', icon: '💰', desc: 'Record donations' },
  { to: '/admin/expenses', label: 'Expenses', icon: '🧾', desc: 'Record spending' },
  { to: '/admin/programs', label: 'Programs', icon: '🎭', desc: 'Cultural programs & events' },
  { to: '/admin/annadanam', label: 'Annadanam Sponsors', icon: '🍛', desc: 'Who sponsors meals, which day' },
  { to: '/admin/sponsors', label: 'Sponsors', icon: '🤝', desc: 'General sponsors' },
  { to: '/admin/velam-items', label: 'Velam Paata Items', icon: '🏺', desc: 'Auction items, prices, buyers' },
  { to: '/admin/loans', label: 'Village Lending (Vaddi)', icon: '💵', desc: 'Loans to villagers, interest tracking' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const { selectedYear } = useYear()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name}</h1>
        <p className="text-sm text-gray-500">Managing festival year: {selectedYear || '—'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="card active:bg-gray-50">
            <p className="text-2xl">{t.icon}</p>
            <p className="font-semibold text-gray-800 mt-1">{t.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
