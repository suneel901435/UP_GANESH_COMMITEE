import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'

export default function ManageSponsors() {
  const { selectedYear, years } = useYear()
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ sponsorName: '', category: '', amount: '', contact: '', notes: '' })

  const currentYearObj = years.find((y) => y.year === selectedYear)

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/sponsors`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/admin/sponsors', {
        festivalYearId: currentYearObj.id,
        sponsorName: form.sponsorName,
        category: form.category,
        amount: form.amount ? Number(form.amount) : null,
        contact: form.contact,
        notes: form.notes,
      })
      setForm({ sponsorName: '', category: '', amount: '', contact: '', notes: '' })
      loadItems()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this sponsor?')) return
    await api.delete(`/admin/sponsors/${id}`)
    loadItems()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Sponsors</h1>

      <form onSubmit={submit} className="card space-y-2">
        <input type="text" placeholder="Sponsor name" className="input" required
          value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} />
        <input type="text" placeholder="Category, e.g. Lighting, Mandap" className="input"
          value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input type="number" inputMode="numeric" placeholder="Amount (optional)" className="input"
          value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input type="text" placeholder="Contact (optional)" className="input"
          value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        <input type="text" placeholder="Notes (optional)" className="input"
          value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <button className="btn-primary w-full">Add Sponsor</button>
      </form>

      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{s.sponsorName}</p>
              <p className="text-xs text-gray-400">{s.category}</p>
            </div>
            <div className="flex items-center gap-2">
              {s.amount != null && <p className="font-semibold text-saffron-700">₹{Number(s.amount).toLocaleString('en-IN')}</p>}
              <button onClick={() => remove(s.id)} className="text-red-500 text-sm">✕</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No sponsors added yet.</p>}
      </div>
    </div>
  )
}
