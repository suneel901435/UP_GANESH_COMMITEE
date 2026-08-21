import React from 'react'

/**
 * Festive gradient banner used at the top of every admin page, mirroring the
 * style already used on the public-facing pages (Sponsors, Reports, etc).
 *
 * Props:
 *  - icon: emoji shown in the eyebrow pill
 *  - eyebrow: small uppercase label, e.g. "Admin · 2026" (optional, defaults to icon+title)
 *  - title: main heading
 *  - subtitle: short supporting line
 *  - action: optional node rendered on the right (button, link, etc.)
 *  - stat: optional { label, value } shown as a pill on the right, above/instead of action
 */
export default function AdminPageHeader({ icon, eyebrow, title, subtitle, action, stat }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-orange-500/10">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          {(icon || eyebrow) && (
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              {icon && <span className="text-sm leading-none">{icon}</span>}
              {eyebrow || 'Admin'}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-xl font-medium">{subtitle}</p>
          )}
        </div>

        {(action || stat) && (
          <div className="flex items-center gap-2 shrink-0">
            {stat && (
              <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2 text-left sm:text-right shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-orange-200 block font-semibold">
                  {stat.label}
                </span>
                <span className="text-lg font-extrabold text-white">{stat.value}</span>
              </div>
            )}
            {action}
          </div>
        )}
      </div>
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  )
}
