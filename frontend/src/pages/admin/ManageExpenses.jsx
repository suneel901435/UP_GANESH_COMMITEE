import React, { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'
import { downloadCsv } from '../../utils/exportCsv'
import AdminPageHeader from '../../components/AdminPageHeader'
import AdminEmptyState from '../../components/AdminEmptyState'

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (Newest first)' },
  { value: 'date_asc', label: 'Date (Oldest first)' },
  { value: 'amount_desc', label: 'Amount (High to Low)' },
  { value: 'amount_asc', label: 'Amount (Low to High)' },
  { value: 'category_asc', label: 'Category (A–Z)' },
]

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
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')

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

  // Smart search: if what's typed is purely numeric, search by amount;
  // otherwise search by category. Then apply the chosen sort. Search/sort
  // only affect what's shown on this page - CSV export above still exports
  // every entry for the year.
  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    const isNumericQuery = q !== '' && /^\d+(\.\d+)?$/.test(q)

    let filtered = items
    if (isNumericQuery) {
      filtered = items.filter((e) => String(e.amount ?? '').includes(q))
    } else if (q) {
      filtered = items.filter((e) => (e.category || '').toLowerCase().includes(q))
    }

    const sorted = [...filtered]
    switch (sortBy) {
      case 'date_asc':
        sorted.sort((a, b) => (a.transactionDate || '').localeCompare(b.transactionDate || ''))
        break
      case 'amount_desc':
        sorted.sort((a, b) => Number(b.amount) - Number(a.amount))
        break
      case 'amount_asc':
        sorted.sort((a, b) => Number(a.amount) - Number(b.amount))
        break
      case 'category_asc':
        sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
        break
      case 'date_desc':
      default:
        sorted.sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || ''))
    }
    return sorted
  }, [items, search, sortBy])

  const total = useMemo(() => items.reduce((s, e) => s + (Number(e.amount) || 0), 0), [items])

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon="🧾"
        eyebrow={`Expenses · ${selectedYear || ''}`}
        title="Expenses"
        subtitle="Record and track every expense incurred for the festival."
        stat={{ label: 'Total Spent', value: `₹${total.toLocaleString('en-IN')}` }}
        action={<button onClick={exportCsv} className="btn-secondary text-sm shrink-0 bg-white/20 text-white border-white/30 hover:bg-white/30">⬇ CSV</button>}
      />

      <form onSubmit={submit} className="form-shell">
        <h2 className="section-label">{editingId ? '✏️ Edit Expense' : '➕ Add Expense'}</h2>
        <label className="text-xs text-gray-500 font-medium">Date paid</label>
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
        {msg && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{msg}</p>}
        <div className="flex gap-2 pt-1">
          <button className="btn-primary flex-1">{editingId ? 'Update Expense' : 'Add Expense'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="form-shell !p-3 sm:!p-4 space-y-2">
        <input
          type="text"
          placeholder="🔎 Search by category, or amount..."
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-2.5">
        {visibleItems.map((e) => (
          <div key={e.id} className="card flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-base shrink-0">
                📤
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{e.category}</p>
                <p className="text-xs text-gray-400 truncate">
                  {e.transactionDate}{e.festivalDayLabel ? ` · ${e.festivalDayLabel}` : ''}{e.paidTo ? ` · Paid to ${e.paidTo}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <p className="font-extrabold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg text-sm mr-1">₹{Number(e.amount).toLocaleString('en-IN')}</p>
              <button onClick={() => startEdit(e)} className="btn-edit-text">Edit</button>
              <button onClick={() => remove(e.id)} className="btn-danger-text">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <AdminEmptyState icon="🧾" title="No expenses recorded yet" subtitle="Add your first expense using the form above." />}
        {items.length > 0 && visibleItems.length === 0 && (
          <AdminEmptyState icon="🔎" title={`No expenses match "${search}"`} subtitle="Try a different search term." />
        )}
      </div>
    </div>
  )
}
