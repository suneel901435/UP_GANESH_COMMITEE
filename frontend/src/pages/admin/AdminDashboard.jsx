import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useYear } from '../../context/YearContext'
import VigrahaDhataCard from '../../components/VigrahaDhataCard'
import AdminPageHeader from '../../components/AdminPageHeader'

const tiles = [
  { to: '/admin/setup', label: 'Festival Year & Days', icon: '📅', desc: 'Set up this year and its days first', tone: 'orange' },
  { to: '/admin/collections', label: 'Collections', icon: '💰', desc: 'Record donations', tone: 'emerald' },
  { to: '/admin/expenses', label: 'Expenses', icon: '🧾', desc: 'Record spending', tone: 'red' },
  { to: '/admin/programs', label: 'Programs', icon: '🎭', desc: 'Cultural programs & events', tone: 'blue' },
  { to: '/admin/annadanam', label: 'Annadanam Sponsors', icon: '🍛', desc: 'Who sponsors meals, which day', tone: 'amber' },
  { to: '/admin/sponsors', label: 'Sponsors', icon: '🤝', desc: 'General sponsors', tone: 'orange' },
  { to: '/admin/sponsor-categories', label: 'Sponsor Categories', icon: '🏷️', desc: 'Manage category dropdown options', tone: 'purple' },
  { to: '/admin/velam-items', label: 'Velam Paata Items', icon: '🏺', desc: 'Auction items, prices, buyers', tone: 'amber' },
  { to: '/admin/gallery', label: 'Photo Gallery', icon: '📷', desc: 'Festival photos, decoration, celebrations', tone: 'pink' },
  { to: '/admin/loans', label: 'Village Lending (Vaddi)', icon: '💵', desc: 'Loans to villagers, interest tracking', tone: 'emerald' },
  { to: '/admin/reports', label: 'Reports', icon: '📊', desc: 'All features at a glance, in charts', tone: 'blue' },
  { to: '/admin/audit', label: 'Audit Trail', icon: '🕵️', desc: 'Who added what, and when', tone: 'gray' },
]

const toneMap = {
  orange: 'bg-orange-50 border-orange-200 text-orange-600 group-hover:bg-orange-100',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600 group-hover:bg-emerald-100',
  red: 'bg-red-50 border-red-200 text-red-600 group-hover:bg-red-100',
  blue: 'bg-blue-50 border-blue-200 text-blue-600 group-hover:bg-blue-100',
  amber: 'bg-amber-50 border-amber-200 text-amber-600 group-hover:bg-amber-100',
  purple: 'bg-purple-50 border-purple-200 text-purple-600 group-hover:bg-purple-100',
  pink: 'bg-pink-50 border-pink-200 text-pink-600 group-hover:bg-pink-100',
  gray: 'bg-gray-50 border-gray-200 text-gray-600 group-hover:bg-gray-100',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { selectedYear } = useYear()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon="🛠️"
        eyebrow="Admin Panel"
        title={`Welcome, ${user?.name || 'Admin'}`}
        subtitle={`Managing festival year: ${selectedYear || '—'}`}
      />

      {/* Vigraha Dhata flex card: tap or wait a few seconds to reveal the idol sponsor */}
      <VigrahaDhataCard year={selectedYear} />

      <div>
        <p className="section-label mb-3">✨ Manage Your Festival</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tiles.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group bg-white rounded-2xl border border-orange-100/80 shadow-sm hover:shadow-md hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-200 p-4 flex flex-col gap-2"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 transition-colors ${toneMap[t.tone] || toneMap.gray}`}>
                {t.icon}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm leading-snug">{t.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
