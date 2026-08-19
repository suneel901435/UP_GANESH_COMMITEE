import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'

const PAYMENT_MODES = ['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER']

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function ManageCollections() {
  const { selectedYear, years } = useYear()
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')

  // No day picker here on purpose - just pick the date, and the app figures
  // out on its own whether it falls on an actual festival day or not.
  const [form, setForm] = useState({
    transactionDate: today(),
    donorName: '',
    donorContact: '',
    amount: '',
    paymentMode: 'CASH',
    notes: '',
  })

  const currentYearObj = years.find((y) => y.year === selectedYear)

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/collections`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/admin/collections', {
        festivalYearId: currentYearObj.id,
        transactionDate: form.transactionDate,
        donorName: form.donorName,
        donorContact: form.donorContact,
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        notes: form.notes,
      })
      setForm({ ...form, donorName: '', donorContact: '', amount: '', notes: '' })
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

      <form onSubmit={submit} className="card space-y-2">
        <label className="text-xs text-gray-500">Date collected</label>
        <input type="date" className="input" required
          value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} />

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
              <p className="text-xs text-gray-400">
                {c.transactionDate}{c.festivalDayLabel ? ` · ${c.festivalDayLabel}` : ''} · {c.paymentMode}{c.notes ? ` · ${c.notes}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-green-700">₹{Number(c.amount).toLocaleString('en-IN')}</p>
              <button onClick={() => remove(c.id)} className="text-red-500 text-sm">✕</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No donations recorded yet.</p>}
      </div>
    </div>
  )
}
