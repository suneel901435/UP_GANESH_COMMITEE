import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function ManageSetup() {
  const [years, setYears] = useState([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [days, setDays] = useState([])

  const [yearForm, setYearForm] = useState({ year: new Date().getFullYear(), startDate: '', endDate: '' })
  const [dayForm, setDayForm] = useState({ date: '', dayNumber: '', label: '' })
  const [msg, setMsg] = useState('')

  const loadYears = () => {
    api.get('/public/years').then((res) => {
      setYears(res.data)
      if (res.data.length > 0 && !selectedYearId) {
        setSelectedYearId(res.data[0].id)
      }
    })
  }

  const loadDays = (yearId) => {
    if (!yearId) return
    api.get(`/admin/setup/years/${yearId}/days`).then((res) => setDays(res.data))
  }

  useEffect(loadYears, [])
  useEffect(() => loadDays(selectedYearId), [selectedYearId])

  const createYear = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const res = await api.post('/admin/setup/years', yearForm)
      setMsg(`Year ${res.data.year} created.`)
      setYearForm({ year: new Date().getFullYear() + 1, startDate: '', endDate: '' })
      loadYears()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create year')
    }
  }

  const createDay = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/admin/setup/days', {
        festivalYear: { id: selectedYearId },
        date: dayForm.date,
        dayNumber: Number(dayForm.dayNumber),
        label: dayForm.label,
      })
      setDayForm({ date: '', dayNumber: '', label: '' })
      loadDays(selectedYearId)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create day')
    }
  }

  const deleteDay = async (id) => {
    if (!confirm('Delete this day and all its data?')) return
    await api.delete(`/admin/setup/days/${id}`)
    loadDays(selectedYearId)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Festival Year & Days Setup</h1>
      {msg && <p className="text-sm text-saffron-700 bg-saffron-50 p-2 rounded">{msg}</p>}

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-2">1. Create a Festival Year</h2>
        <form onSubmit={createYear} className="space-y-2">
          <input type="number" placeholder="Year, e.g. 2026" className="input" required
            value={yearForm.year} onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })} />
          <input type="date" className="input" value={yearForm.startDate}
            onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })} />
          <input type="date" className="input" value={yearForm.endDate}
            onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })} />
          <button className="btn-primary w-full">Create Year</button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-2">2. Add Days to a Year</h2>
        <select className="input mb-2" value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)}>
          {years.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
        </select>

        <form onSubmit={createDay} className="space-y-2">
          <input type="date" className="input" required
            value={dayForm.date} onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })} />
          <input type="number" placeholder="Day number, e.g. 1" className="input" required
            value={dayForm.dayNumber} onChange={(e) => setDayForm({ ...dayForm, dayNumber: e.target.value })} />
          <input type="text" placeholder="Label (optional), e.g. Ganesh Visarjan" className="input"
            value={dayForm.label} onChange={(e) => setDayForm({ ...dayForm, label: e.target.value })} />
          <button className="btn-primary w-full">Add Day</button>
        </form>

        <div className="mt-4 space-y-2">
          {days.map((d) => (
            <div key={d.id} className="flex justify-between items-center border-b border-gray-100 py-2">
              <div>
                <p className="text-sm font-medium">Day {d.dayNumber} {d.label ? `· ${d.label}` : ''}</p>
                <p className="text-xs text-gray-400">{d.date}</p>
              </div>
              <button onClick={() => deleteDay(d.id)} className="text-red-500 text-sm">Delete</button>
            </div>
          ))}
          {days.length === 0 && <p className="text-sm text-gray-400">No days added yet.</p>}
        </div>
      </div>
    </div>
  )
}
