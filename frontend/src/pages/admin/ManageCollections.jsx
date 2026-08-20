import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'
import { downloadCsv } from '../../utils/exportCsv'

const PAYMENT_MODES = ['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER']

function today() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm = {
  transactionDate: today(),
  donorName: '',
  donorContact: '',
  amount: '',
  paymentMode: 'CASH',
  notes: '',
  isPublic: true,
}

export default function ManageCollections() {
  const { selectedYear, years } = useYear()
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const currentYearObj = years.find((y) => y.year === selectedYear)

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/collections`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  const startEdit = (c) => {
    setEditingId(c.id)
    setForm({
      transactionDate: c.transactionDate || today(),
      donorName: c.donorName || '',
      donorContact: c.donorContact || '',
      amount: c.amount ?? '',
      paymentMode: c.paymentMode || 'CASH',
      notes: c.notes || '',
      isPublic: c.isPublic !== false,
    })
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const payload = {
        festivalYearId: currentYearObj.id,
        transactionDate: form.transactionDate,
        donorName: form.donorName,
        donorContact: form.donorContact,
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        notes: form.notes,
        isPublic: form.isPublic,
      }
      if (editingId) {
        await api.put(`/admin/collections/${editingId}`, payload)
      } else {
        await api.post('/admin/collections', payload)
      }
      cancelEdit()
      loadItems()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this donation entry?')) return
    await api.delete(`/admin/collections/${id}`)
    if (editingId === id) cancelEdit()
    loadItems()
  }

  const exportCsv = () => {
    downloadCsv(
      `collections-${selectedYear}.csv`,
      items,
      [
        { key: 'transactionDate', label: 'Date' },
        { key: 'festivalDayLabel', label: 'Festival Day' },
        { key: 'donorName', label: 'Donor Name' },
        { key: 'donorContact', label: 'Contact' },
        { key: 'amount', label: 'Amount (₹)' },
        { key: 'paymentMode', label: 'Payment Mode' },
        { key: 'notes', label: 'Notes' },
      ]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Collections</h1>
        <button onClick={exportCsv} className="btn-secondary text-sm shrink-0">⬇ Export CSV</button>
      </div>

      <form onSubmit={submit} className="card space-y-2">
        <h2 className="font-semibold text-gray-700">{editingId ? 'Edit Donation' : 'Add Donation'}</h2>
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
        <label className="flex items-center gap-2 text-sm text-gray-600 pt-1">
          <input type="checkbox" checked={form.isPublic}
            onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
          Show on public donor leaderboard
        </label>
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1">{editingId ? 'Update Donation' : 'Add Donation'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
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
            <div className="flex items-center gap-3">
              <p className="font-semibold text-green-700">₹{Number(c.amount).toLocaleString('en-IN')}</p>
              <button onClick={() => startEdit(c)} className="text-saffron-600 text-sm">Edit</button>
              <button onClick={() => remove(c.id)} className="text-red-500 text-sm">✕</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No donations recorded yet.</p>}
      </div>
    </div>
  )
}
