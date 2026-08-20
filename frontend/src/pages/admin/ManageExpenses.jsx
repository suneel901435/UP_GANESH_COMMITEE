import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'
import { downloadCsv } from '../../utils/exportCsv'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm = {
  transactionDate: today(),
  category: '',
  description: '',
  amount: '',
  paidTo: '',
}

export default function ManageExpenses() {
  const { selectedYear, years } = useYear()
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const currentYearObj = years.find((y) => y.year === selectedYear)

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/expenses`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({
      transactionDate: item.transactionDate || today(),
      category: item.category || '',
      description: item.description || '',
      amount: item.amount ?? '',
      paidTo: item.paidTo || '',
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
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        paidTo: form.paidTo,
      }
      if (editingId) {
        await api.put(`/admin/expenses/${editingId}`, payload)
      } else {
        await api.post('/admin/expenses', payload)
      }
      cancelEdit()
      loadItems()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this expense entry?')) return
    await api.delete(`/admin/expenses/${id}`)
    if (editingId === id) cancelEdit()
    loadItems()
  }

  const exportCsv = () => {
    downloadCsv(
      `expenses-${selectedYear}.csv`,
      items,
      [
        { key: 'transactionDate', label: 'Date' },
        { key: 'festivalDayLabel', label: 'Festival Day' },
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Description' },
        { key: 'amount', label: 'Amount (₹)' },
        { key: 'paidTo', label: 'Paid To' },
      ]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Expenses</h1>
        <button onClick={exportCsv} className="btn-secondary text-sm shrink-0">⬇ Export CSV</button>
      </div>

      <form onSubmit={submit} className="card space-y-2">
        <h2 className="font-semibold text-gray-700">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
        <label className="text-xs text-gray-500">Date paid</label>
        <input type="date" className="input" required
          value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} />

        <input type="text" placeholder="Category, e.g. Decoration" className="input" required
          value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input type="text" placeholder="Description (optional)" className="input"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="number" inputMode="numeric" placeholder="Amount" className="input" required
          value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input type="text" placeholder="Paid to (optional)" className="input"
          value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} />
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1">{editingId ? 'Update Expense' : 'Add Expense'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="space-y-2">
        {items.map((e) => (
          <div key={e.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{e.category}</p>
              <p className="text-xs text-gray-400">
                {e.transactionDate}{e.festivalDayLabel ? ` · ${e.festivalDayLabel}` : ''}{e.paidTo ? ` · Paid to ${e.paidTo}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-red-700">₹{Number(e.amount).toLocaleString('en-IN')}</p>
              <button onClick={() => startEdit(e)} className="text-saffron-600 text-sm">Edit</button>
              <button onClick={() => remove(e.id)} className="text-red-500 text-sm">✕</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No expenses recorded yet.</p>}
      </div>
    </div>
  )
}
