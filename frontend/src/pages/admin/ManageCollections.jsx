import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'

const PAYMENT_MODES = ['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER']

export default function ManageCollections() {
  const { selectedYear, years } = useYear()
  const [days, setDays] = useState([])
  const [selectedDayId, setSelectedDayId] = useState('')
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({ donorName: '', donorContact: '', amount: '', paymentMode: 'CASH', notes: '' })

  useEffect(() => {
    const y = years.find((y) => y.year === selectedYear)
    if (!y) return
    api.get(`/admin/setup/years/${y.id}/days`).then((res) => {
      setDays(res.data)
      if (res.data.length > 0) setSelectedDayId(res.data[0].id)
    })
  }, [selectedYear, years])

  const loadItems = () => {
    if (!selectedDayId) return
    api.get(`/public/days/${selectedDayId}`).then((res) => setItems(res.data.collections))
  }
  useEffect(loadItems, [selectedDayId])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/admin/collections', {
        festivalDayId: selectedDayId,
        donorName: form.donorName,
        donorContact: form.donorContact,
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        notes: form.notes,
      })
      setForm({ donorName: '', donorContact: '', amount: '', paymentMode: 'CASH', notes: '' })
      loadItems()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this donation entry?')) return
    await api.delete(`/admin/collections/${id}`)
    loadItems()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Collections</h1>

      <select className="input" value={selectedDayId} onChange={(e) => setSelectedDayId(e.target.value)}>
        {days.map((d) => <option key={d.id} value={d.id}>Day {d.dayNumber} — {d.date}</option>)}
      </select>

      <form onSubmit={submit} className="card space-y-2">
        <input type="text" placeholder="Donor name" className="input" required
          value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} />
        <input type="text" placeholder="Contact (optional)" className="input"
          value={form.donorContact} onChange={(e) => setForm({ ...form, donorContact: e.target.value })} />
        <input type="number" inputMode="numeric" placeholder="Amount" className="input" required
          value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <select className="input" value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
          {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="text" placeholder="Notes (optional)" className="input"
          value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <button className="btn-primary w-full">Add Donation</button>
      </form>

      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{c.donorName}</p>
              <p className="text-xs text-gray-400">{c.paymentMode}{c.notes ? ` · ${c.notes}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-green-700">₹{Number(c.amount).toLocaleString('en-IN')}</p>
              <button onClick={() => remove(c.id)} className="text-red-500 text-sm">✕</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No donations recorded for this day yet.</p>}
      </div>
    </div>
  )
}
