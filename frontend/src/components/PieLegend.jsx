import React from 'react'

const DEFAULT_COLORS = ['#ea580c', '#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#84cc16']

function defaultFormat(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

/**
 * Wraps and truncates pie-slice names instead of letting recharts' built-in
 * outer labels overflow the card on narrow/mobile screens (the "ration 100%",
 * "sh 100%" clipping seen on the Reports page). Full name + value + percent
 * shows on hover via the title attribute.
 */
export default function PieLegend({ data, colors = DEFAULT_COLORS, formatValue = defaultFormat }) {
  const total = data.reduce((sum, d) => sum + Number(d.value || 0), 0)
  if (!data || data.length === 0) return null

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3 px-1">
      {data.map((d, idx) => {
        const pct = total > 0 ? Math.round((Number(d.value || 0) / total) * 100) : 0
        return (
          <div
            key={d.name}
            className="flex items-center gap-1.5 min-w-0 max-w-full"
            title={`${d.name}: ${formatValue(d.value)} (${pct}%)`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
            <span className="text-xs text-gray-600 truncate max-w-[120px] sm:max-w-[180px]">{d.name}</span>
            <span className="text-xs font-semibold text-gray-400 shrink-0">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}
