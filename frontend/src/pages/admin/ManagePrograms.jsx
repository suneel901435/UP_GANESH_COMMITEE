import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'

export default function ManagePrograms() {
  const { selectedYear, years } = useYear()
  const [days, setDays] = useState([])
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ name: '', description: '', timeSlot: '', festivalDayId: '' })

  const currentYearObj = years.find((y) => y.year === selectedYear)

  useEffect(() => {
    if (!currentYearObj) return
    api.get(`/admin/setup/years/${currentYearObj.id}/days`).then((res) => setDays(res.data))
  }, [currentYearObj])

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/programs`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/admin/programs', {
        festivalYearId: currentYearObj.id,
        festivalDayId: form.festivalDayId || null,
        name: form.name,
        description: form.description,
        timeSlot: form.timeSlot,
      })
      setForm({ name: '', description: '', timeSlot: '', festivalDayId: '' })
      loadItems()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this program?')) return
    await api.delete(`/admin/programs/${id}`)
    loadItems()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Programs</h1>

      <form onSubmit={submit} className="card space-y-2">
        <input type="text" placeholder="Program name" className="input" required
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="text" placeholder="Description (optional)" className="input"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="text" placeholder="Time slot, e.g. 7:00 PM - 9:00 PM" className="input"
          value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} />
        <select className="input" value={form.festivalDayId} onChange={(e) => setForm({ ...form, festivalDayId: e.target.value })}>
          <option value="">Whole festival (no specific day)</option>
          {days.map((d) => <option key={d.id} value={d.id}>Day {d.dayNumber} — {d.date}</option>)}
        </select>
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <button className="btn-primary w-full">Add Program</button>
      </form>

      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="card flex justify-between items-start">
            <div>
              <p className="font-medium text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-400">{p.timeSlot}{p.festivalDay ? ` · Day ${p.festivalDay.dayNumber}` : ''}</p>
            </div>
            <button onClick={() => remove(p.id)} className="text-red-500 text-sm">✕</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No programs added yet.</p>}
      </div>
    </div>
  )
}
