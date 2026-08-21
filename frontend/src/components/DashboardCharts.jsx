import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import PieLegend from './PieLegend'
import api from '../api/axios'
import { useLanguage } from '../context/LanguageContext'

const PIE_COLORS = ['#ea580c', '#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#84cc16']

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function formatShortDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

export default function DashboardCharts({ year }) {
  const { t } = useLanguage()
  const [ledger, setLedger] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!year) return
    setLoading(true)
    Promise.all([
      api.get(`/public/years/${year}/daily-ledger`).catch(() => ({ data: [] })),
      api.get(`/public/years/${year}/expenses`).catch(() => ({ data: [] })),
    ])
      .then(([ledgerRes, expensesRes]) => {
        setLedger(ledgerRes.data || [])
        setExpenses(expensesRes.data || [])
      })
      .finally(() => setLoading(false))
  }, [year])

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-orange-100/80 p-8 text-center text-sm text-gray-400">
        Loading charts...
      </div>
    )
  }

  const trendData = ledger.map((d) => ({
    date: formatShortDate(d.date),
    Collections: Number(d.totalCollection || 0),
    Expenses: Number(d.totalExpense || 0),
  }))

  const categoryTotals = {}
  expenses.forEach((e) => {
    const cat = e.category || 'Other'
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0)
  })
  const pieData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const hasTrend = trendData.length > 0
  const hasExpenses = pieData.length > 0

  if (!hasTrend && !hasExpenses) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {hasTrend && (
        <div className="bg-white rounded-3xl border border-orange-100/80 p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-black text-gray-800 mb-1">{t('dayWiseTrend')}</h3>
          <p className="text-xs text-gray-400 mb-4">Collections vs expenses across the festival period</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
              <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #fed7aa' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Collections" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Expenses" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasExpenses && (
        <div className="bg-white rounded-3xl border border-orange-100/80 p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-black text-gray-800 mb-1">{t('expenseBreakdown')}</h3>
          <p className="text-xs text-gray-400 mb-4">Where the festival budget went</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                labelLine={false}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(value)} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #fed7aa' }} />
            </PieChart>
          </ResponsiveContainer>
          <PieLegend data={pieData} colors={PIE_COLORS} />
        </div>
      )}
    </div>
  )
}
