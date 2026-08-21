import React, { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'
import { downloadCsv } from '../../utils/exportCsv'
import AdminPageHeader from '../../components/AdminPageHeader'
import AdminEmptyState from '../../components/AdminEmptyState'

const PAYMENT_MODES = ['CASH', 'UPI', 'BANK_TRANSFER', 'OTHER']

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (Newest first)' },
  { value: 'date_asc', label: 'Date (Oldest first)' },
  { value: 'amount_desc', label: 'Amount (High to Low)' },
  { value: 'amount_asc', label: 'Amount (Low to High)' },
  { value: 'name_asc', label: 'Donor Name (A–Z)' },
]

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
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')

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

  // Smart search: if what's typed is purely numeric, search by amount;
  // otherwise search by donor name. Then apply the chosen sort. Search/sort
  // only affect what's shown on this page - CSV export above still exports
  // every entry for the year.
  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    const isNumericQuery = q !== '' && /^\d+(\.\d+)?$/.test(q)

    let filtered = items
    if (isNumericQuery) {
      filtered = items.filter((c) => String(c.amount ?? '').includes(q))
    } else if (q) {
      filtered = items.filter((c) => (c.donorName || '').toLowerCase().includes(q))
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
      case 'name_asc':
        sorted.sort((a, b) => (a.donorName || '').localeCompare(b.donorName || ''))
        break
      case 'date_desc':
      default:
        sorted.sort((a, b) => (b.transactionDate || '').localeCompare(a.transactionDate || ''))
    }
    return sorted
  }, [items, search, sortBy])

  const total = useMemo(() => items.reduce((s, c) => s + (Number(c.amount) || 0), 0), [items])

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon="💰"
        eyebrow={`Collections · ${selectedYear || ''}`}
        title="Collections"
        subtitle="Record and track every donation collected for the festival."
        stat={{ label: 'Total Collected', value: `₹${total.toLocaleString('en-IN')}` }}
        action={<button onClick={exportCsv} className="btn-secondary text-sm shrink-0 bg-white/20 text-white border-white/30 hover:bg-white/30">⬇ CSV</button>}
      />

      <form onSubmit={submit} className="form-shell">
        <h2 className="section-label">{editingId ? '✏️ Edit Donation' : '➕ Add Donation'}</h2>
        <label className="text-xs text-gray-500 font-medium">Date collected</label>
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
        {msg && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{msg}</p>}
        <div className="flex gap-2 pt-1">
          <button className="btn-primary flex-1">{editingId ? 'Update Donation' : 'Add Donation'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="form-shell !p-3 sm:!p-4 space-y-2">
        <input
          type="text"
          placeholder="🔎 Search by donor name, or amount..."
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-2.5">
        {visibleItems.map((c) => (
          <div key={c.id} className="card flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-base shrink-0">
                📥
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{c.donorName}</p>
                <p className="text-xs text-gray-400 truncate">
                  {c.transactionDate}{c.festivalDayLabel ? ` · ${c.festivalDayLabel}` : ''} · {c.paymentMode}{c.notes ? ` · ${c.notes}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <p className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-sm mr-1">₹{Number(c.amount).toLocaleString('en-IN')}</p>
              <button onClick={() => startEdit(c)} className="btn-edit-text">Edit</button>
              <button onClick={() => remove(c.id)} className="btn-danger-text">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <AdminEmptyState icon="💰" title="No donations recorded yet" subtitle="Add your first donation using the form above." />}
        {items.length > 0 && visibleItems.length === 0 && (
          <AdminEmptyState icon="🔎" title={`No donations match "${search}"`} subtitle="Try a different search term." />
        )}
      </div>
    </div>
  )
}
