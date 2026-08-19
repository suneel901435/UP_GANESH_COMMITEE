import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function ManageExpenses() {
  const { selectedYear, years } = useYear()
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')

  // No day picker here either - see ManageCollections.jsx for why.
  const [form, setForm] = useState({
    transactionDate: today(),
    category: '',
    description: '',
    amount: '',
    paidTo: '',
  })

  const currentYearObj = years.find((y) => y.year === selectedYear)

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/expenses`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/admin/expenses', {
        festivalYearId: currentYearObj.id,
        transactionDate: form.transactionDate,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        paidTo: form.paidTo,
      })
      setForm({ ...form, category: '', description: '', amount: '', paidTo: '' })
      loadItems()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this expense entry?')) return
    await api.delete(`/admin/expenses/${id}`)
    loadItems()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Expenses</h1>

      <form onSubmit={submit} className="card space-y-2">
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
        <button className="btn-primary w-full">Add Expense</button>
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
            <div className="flex items-center gap-2">
              <p className="font-semibold text-red-700">₹{Number(e.amount).toLocaleString('en-IN')}</p>
              <button onClick={() => remove(e.id)} className="text-red-500 text-sm">✕</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No expenses recorded yet.</p>}
      </div>
    </div>
  )
}
