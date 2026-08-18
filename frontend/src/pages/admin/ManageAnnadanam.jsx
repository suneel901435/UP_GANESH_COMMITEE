import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'

export default function ManageAnnadanam() {
  const { selectedYear, years } = useYear()
  const [days, setDays] = useState([])
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ sponsorName: '', contact: '', mealCount: '', amount: '', notes: '', festivalDayId: '' })

  const currentYearObj = years.find((y) => y.year === selectedYear)

  useEffect(() => {
    if (!currentYearObj) return
    api.get(`/admin/setup/years/${currentYearObj.id}/days`).then((res) => {
      setDays(res.data)
      if (res.data.length > 0) setForm((f) => ({ ...f, festivalDayId: res.data[0].id }))
    })
  }, [currentYearObj])

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/annadanam-sponsors`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/admin/annadanam-sponsors', {
        festivalYearId: currentYearObj.id,
        festivalDayId: form.festivalDayId,
        sponsorName: form.sponsorName,
        contact: form.contact,
        mealCount: form.mealCount ? Number(form.mealCount) : null,
        amount: form.amount ? Number(form.amount) : null,
        notes: form.notes,
      })
      setForm({ ...form, sponsorName: '', contact: '', mealCount: '', amount: '', notes: '' })
      loadItems()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this annadanam sponsor?')) return
    await api.delete(`/admin/annadanam-sponsors/${id}`)
    loadItems()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Annadanam Sponsors</h1>

      <form onSubmit={submit} className="card space-y-2">
        <select className="input" value={form.festivalDayId} onChange={(e) => setForm({ ...form, festivalDayId: e.target.value })}>
          {days.map((d) => <option key={d.id} value={d.id}>Day {d.dayNumber} — {d.date}</option>)}
        </select>
        <input type="text" placeholder="Sponsor name" className="input" required
          value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} />
        <input type="text" placeholder="Contact (optional)" className="input"
          value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        <input type="number" inputMode="numeric" placeholder="Meal count (optional)" className="input"
          value={form.mealCount} onChange={(e) => setForm({ ...form, mealCount: e.target.value })} />
        <input type="number" inputMode="numeric" placeholder="Amount (optional)" className="input"
          value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input type="text" placeholder="Notes (optional)" className="input"
          value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <button className="btn-primary w-full">Add Annadanam Sponsor</button>
      </form>

      <div className="space-y-2">
        {items.map((a) => (
          <div key={a.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{a.sponsorName}</p>
              <p className="text-xs text-gray-400">
                {a.festivalDay ? `Day ${a.festivalDay.dayNumber}` : ''}{a.mealCount ? ` · ${a.mealCount} meals` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {a.amount != null && <p className="font-semibold text-saffron-700">₹{Number(a.amount).toLocaleString('en-IN')}</p>}
              <button onClick={() => remove(a.id)} className="text-red-500 text-sm">✕</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No annadanam sponsors added yet.</p>}
      </div>
    </div>
  )
}
