import React from 'react'

export default function AdminEmptyState({ icon = '🗂️', title = 'Nothing here yet', subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-orange-200 shadow-sm">
      <span className="text-3xl block mb-2">{icon}</span>
      <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}
