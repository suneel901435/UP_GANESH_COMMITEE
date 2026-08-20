import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'
import { downloadCsv } from '../../utils/exportCsv'

const emptyForm = { sponsorName: '', category: '', amount: '', contact: '', notes: '', isPublic: true }

export default function ManageSponsors() {
  const { selectedYear, years } = useYear()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const currentYearObj = years.find((y) => y.year === selectedYear)

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/sponsors`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  const loadCategories = () => {
    api.get('/admin/sponsor-categories').then((res) => setCategories(res.data.filter((c) => c.active !== false)))
  }
  useEffect(loadCategories, [])

  const startEdit = (s) => {
    setEditingId(s.id)
    setForm({
      sponsorName: s.sponsorName,
      category: s.category || '',
      amount: s.amount ?? '',
      contact: s.contact || '',
      notes: s.notes || '',
      isPublic: s.isPublic !== false,
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
        sponsorName: form.sponsorName,
        category: form.category,
        amount: form.amount ? Number(form.amount) : null,
        contact: form.contact,
        notes: form.notes,
        isPublic: form.isPublic,
      }
      if (editingId) {
        await api.put(`/admin/sponsors/${editingId}`, payload)
      } else {
        await api.post('/admin/sponsors', payload)
      }
      cancelEdit()
      loadItems()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this sponsor?')) return
    await api.delete(`/admin/sponsors/${id}`)
    if (editingId === id) cancelEdit()
    loadItems()
  }

  const exportCsv = () => {
    downloadCsv(
      `sponsors-${selectedYear}.csv`,
      items,
      [
        { key: 'sponsorName', label: 'Sponsor Name' },
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount (₹)' },
        { key: 'contact', label: 'Contact' },
        { key: 'notes', label: 'Notes' },
      ]
    )
  }

  const categoryLabel = (key) => categories.find((c) => c.categoryKey === key)?.categoryLabel || key

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Sponsors</h1>
        <button onClick={exportCsv} className="btn-secondary text-sm shrink-0">⬇ Export CSV</button>
      </div>

      <form onSubmit={submit} className="card space-y-2">
        <h2 className="font-semibold text-gray-700">{editingId ? 'Edit Sponsor' : 'Add Sponsor'}</h2>
        <input type="text" placeholder="Sponsor name" className="input" required
          value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} />

        <div>
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="">Select a category (optional)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.categoryKey}>{c.categoryLabel}</option>
            ))}
          </select>
          <Link to="/admin/sponsor-categories" className="text-xs text-saffron-600 mt-1 inline-block">
            + Manage categories
          </Link>
        </div>

        <input type="number" inputMode="numeric" placeholder="Amount (optional)" className="input"
          value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input type="text" placeholder="Contact (optional)" className="input"
          value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        <input type="text" placeholder="Notes (optional)" className="input"
          value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-gray-600 pt-1">
          <input type="checkbox" checked={form.isPublic}
            onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
          Show on public donor leaderboard
        </label>
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1">{editingId ? 'Update Sponsor' : 'Add Sponsor'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{s.sponsorName}</p>
              <p className="text-xs text-gray-400">{s.category ? categoryLabel(s.category) : ''}{s.isPublic === false ? ' · Hidden from leaderboard' : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              {s.amount != null && <p className="font-semibold text-saffron-700">₹{Number(s.amount).toLocaleString('en-IN')}</p>}
              <button onClick={() => startEdit(s)} className="text-saffron-600 text-sm">Edit</button>
              <button onClick={() => remove(s.id)} className="text-red-500 text-sm">✕</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No sponsors added yet.</p>}
      </div>
    </div>
  )
}
