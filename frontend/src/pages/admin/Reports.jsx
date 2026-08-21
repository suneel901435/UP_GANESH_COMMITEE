import React, { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'
import { useLanguage } from '../../context/LanguageContext'
import DashboardCharts from '../../components/DashboardCharts'
import PieLegend from '../../components/PieLegend'

const PIE_COLORS = ['#ea580c', '#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#84cc16']
const MODE_LABELS = { CASH: 'Cash', UPI: 'UPI', BANK_TRANSFER: 'Bank Transfer', OTHER: 'Other' }

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function StatTile({ icon, label, value, tone }) {
  const toneMap = {
    emerald: 'border-emerald-100 text-emerald-700 bg-emerald-50',
    red: 'border-red-100 text-red-600 bg-red-50',
    orange: 'border-orange-100 text-orange-600 bg-orange-50',
    blue: 'border-blue-100 text-blue-700 bg-blue-50',
    gray: 'border-gray-100 text-gray-700 bg-gray-50',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${toneMap[tone] || toneMap.gray}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide truncate">{label}</p>
        <p className="text-lg font-black text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children, empty }) {
  return (
    <div className="bg-white rounded-3xl border border-orange-100/80 p-5 sm:p-6 shadow-xs">
      <h3 className="text-sm font-black text-gray-800 mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mb-4">{subtitle}</p>}
      {empty ? (
        <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">{empty}</div>
      ) : (
        children
      )}
    </div>
  )
}

export default function Reports() {
  const { selectedYear } = useYear()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState(null)
  const [collections, setCollections] = useState([])
  const [programs, setPrograms] = useState([])
  const [annadanam, setAnnadanam] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [sponsorCategories, setSponsorCategories] = useState([])
  const [velamItems, setVelamItems] = useState([])
  const [loans, setLoans] = useState([])

  useEffect(() => {
    if (!selectedYear) return
    setLoading(true)
    Promise.all([
      api.get(`/public/years/${selectedYear}/dashboard`).catch(() => ({ data: null })),
      api.get(`/public/years/${selectedYear}/collections`).catch(() => ({ data: [] })),
      api.get(`/public/years/${selectedYear}/programs`).catch(() => ({ data: [] })),
      api.get(`/public/years/${selectedYear}/annadanam-sponsors`).catch(() => ({ data: [] })),
      api.get(`/public/years/${selectedYear}/sponsors`).catch(() => ({ data: [] })),
      api.get('/admin/sponsor-categories').catch(() => ({ data: [] })),
      api.get(`/public/years/${selectedYear}/velam-items`).catch(() => ({ data: [] })),
      api.get('/admin/loans').catch(() => ({ data: [] })),
    ])
      .then(([dashRes, colRes, progRes, annRes, sponRes, catRes, velRes, loanRes]) => {
        setDashboard(dashRes.data)
        setCollections(colRes.data || [])
        setPrograms(progRes.data || [])
        setAnnadanam(annRes.data || [])
        setSponsors(sponRes.data || [])
        setSponsorCategories(catRes.data || [])
        setVelamItems(velRes.data || [])
        setLoans(loanRes.data || [])
      })
      .finally(() => setLoading(false))
  }, [selectedYear])

  const categoryLabelMap = useMemo(() => {
    const map = {}
    sponsorCategories.forEach((c) => { map[c.categoryKey] = c.categoryLabel })
    return map
  }, [sponsorCategories])

  const paymentModeData = useMemo(() => {
    const totals = {}
    collections.forEach((c) => {
      const mode = MODE_LABELS[c.paymentMode] || c.paymentMode || 'Other'
      totals[mode] = (totals[mode] || 0) + Number(c.amount || 0)
    })
    return Object.entries(totals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [collections])

  const sponsorCategoryData = useMemo(() => {
    const totals = {}
    sponsors.forEach((s) => {
      const key = s.category || 'uncategorized'
      const label = categoryLabelMap[key] || key
      totals[label] = (totals[label] || 0) + Number(s.amount || 0)
    })
    return Object.entries(totals)
      .map(([name, Amount]) => ({ name, Amount }))
      .sort((a, b) => b.Amount - a.Amount)
  }, [sponsors, categoryLabelMap])

  const velamStatusData = useMemo(() => {
    const sold = velamItems.filter((v) => v.status === 'SOLD')
    const available = velamItems.filter((v) => v.status !== 'SOLD')
    return [
      { name: t('sold'), value: sold.length },
      { name: t('available'), value: available.length },
    ].filter((d) => d.value > 0)
  }, [velamItems, t])

  const velamRevenue = useMemo(
    () => velamItems.reduce((sum, v) => sum + Number(v.finalPrice || 0), 0),
    [velamItems]
  )

  const loanStats = useMemo(() => {
    const active = loans.filter((l) => l.status === 'ACTIVE')
    const closed = loans.filter((l) => l.status === 'CLOSED')
    const totalPrincipal = loans.reduce((s, l) => s + Number(l.principalAmount || 0), 0)
    const outstanding = loans.reduce((s, l) => s + Number(l.outstandingPrincipal || 0), 0)
    const interestEarned = loans.reduce((s, l) => s + Number(l.totalInterestPaid || 0), 0)
    return {
      active: active.length,
      closed: closed.length,
      totalPrincipal,
      outstanding,
      interestEarned,
      chartData: [
        { name: 'Total Lent', Amount: totalPrincipal },
        { name: 'Outstanding', Amount: outstanding },
        { name: 'Interest Earned', Amount: interestEarned },
      ],
    }
  }, [loans])

  const annadanamMeals = useMemo(
    () => annadanam.reduce((s, a) => s + Number(a.mealCount || 0), 0),
    [annadanam]
  )

  if (loading || !selectedYear) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-1">
          <span className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase">
            📊 {selectedYear}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t('reportsTitle')}</h1>
          <p className="text-orange-100 text-xs sm:text-sm max-w-2xl font-medium">{t('reportsTagline')}</p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Top-level stat tiles across every feature */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatTile icon="📥" tone="emerald" label={t('totalCollections')} value={money(dashboard?.totalCollection)} />
        <StatTile icon="📤" tone="red" label={t('totalExpenses')} value={money(dashboard?.totalExpense)} />
        <StatTile icon="💼" tone="orange" label={t('cashInHand')} value={money(dashboard?.cashInHand)} />
        <StatTile icon="👥" tone="gray" label={t('devoteesAndDonors')} value={dashboard?.totalDonors || 0} />
        <StatTile icon="🎭" tone="blue" label="Programs" value={programs.length} />
        <StatTile icon="🏺" tone="orange" label="Velam Revenue" value={money(velamRevenue)} />
      </div>

      {/* Reuses the existing day-wise trend + expense breakdown charts */}
      <DashboardCharts year={selectedYear} />

      {/* Payment mode + sponsor category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title={t('collectionsByPaymentMode')}
          subtitle="How devotees are contributing"
          empty={paymentModeData.length === 0 ? t('noDataYet') : null}
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={paymentModeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                labelLine={false}
              >
                {paymentModeData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #fed7aa' }} />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend data={paymentModeData} colors={PIE_COLORS} />
        </ChartCard>

        <ChartCard
          title={t('sponsorsByCategory')}
          subtitle="Includes Vigraha Dhata, Laddu Dhata, and every other sponsor category"
          empty={sponsorCategoryData.length === 0 ? t('noDataYet') : null}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sponsorCategoryData} layout="vertical" margin={{ top: 5, right: 20, left: 8, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                width={100}
                tickFormatter={(name) => (name.length > 14 ? `${name.slice(0, 13)}…` : name)}
              />
              <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #fed7aa' }} />
              <Bar dataKey="Amount" fill="#ea580c" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Velam Paata + Village Lending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard
          title={t('velamPaataStatus')}
          subtitle={`${velamItems.length} items listed · ${money(velamRevenue)} raised`}
          empty={velamStatusData.length === 0 ? t('noDataYet') : null}
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={velamStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                labelLine={false}
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #fed7aa' }} />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend data={velamStatusData} colors={['#10b981', '#f59e0b']} formatValue={(v) => `${v}`} />
        </ChartCard>

        <ChartCard
          title={t('villageLendingOverview')}
          subtitle={`${loanStats.active} active · ${loanStats.closed} closed loans`}
          empty={loans.length === 0 ? t('noDataYet') : null}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={loanStats.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
              <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #fed7aa' }} />
              <Bar dataKey="Amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Programs & Annadanam summary tiles */}
      <div className="bg-white rounded-3xl border border-orange-100/80 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-black text-gray-800 mb-1">{t('programsAndAnnadanam')}</h3>
        <p className="text-xs text-gray-400 mb-4">Cultural events and meal seva at a glance</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile icon="🎭" tone="blue" label="Programs" value={programs.length} />
          <StatTile icon="🍛" tone="orange" label="Annadanam Sponsors" value={annadanam.length} />
          <StatTile icon="🍲" tone="emerald" label="Meals Sponsored" value={annadanamMeals} />
          <StatTile icon="🤝" tone="gray" label="Total Sponsors" value={sponsors.length} />
        </div>
      </div>
    </div>
  )
}
