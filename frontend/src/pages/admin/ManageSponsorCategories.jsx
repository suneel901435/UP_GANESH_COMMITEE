import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminPageHeader from '../../components/AdminPageHeader'
import AdminEmptyState from '../../components/AdminEmptyState'

const emptyForm = { categoryKey: '', categoryLabel: '', active: true, sortOrder: 0 }

export default function ManageSponsorCategories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [msgIsError, setMsgIsError] = useState(false)

  const load = () => {
    api.get('/admin/sponsor-categories').then((res) => setCategories(res.data))
  }
  useEffect(load, [])

  const showMsg = (text, isError) => {
    setMsg(text)
    setMsgIsError(!!isError)
  }

  const startEdit = (c) => {
    setEditingId(c.id)
    setForm({ categoryKey: c.categoryKey, categoryLabel: c.categoryLabel, active: c.active, sortOrder: c.sortOrder ?? 0 })
    showMsg('', false)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const submit = async (e) => {
    e.preventDefault()
    showMsg('', false)
    try {
      const payload = {
        categoryKey: form.categoryKey,
        categoryLabel: form.categoryLabel,
        active: form.active,
        sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
      }
      if (editingId) {
        await api.put(`/admin/sponsor-categories/${editingId}`, payload)
        showMsg('Category updated.', false)
      } else {
        await api.post('/admin/sponsor-categories', payload)
        showMsg('Category added.', false)
      }
      cancelEdit()
      load()
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to save category', true)
    }
  }

  const remove = async (c) => {
    if (!confirm(`Delete category "${c.categoryLabel}"? Sponsors already using it keep their existing value - it just won't show in the dropdown anymore.`)) return
    try {
      await api.delete(`/admin/sponsor-categories/${c.id}`)
      load()
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to delete category', true)
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon="🏷️"
        eyebrow="Sponsors Setup"
        title="Sponsor Categories"
        subtitle={'The options that show up in the "Category" dropdown when adding a sponsor — e.g. vigraha_data, laddu_data.'}
        action={<Link to="/admin/sponsors" className="btn-secondary text-sm shrink-0 bg-white/20 text-white border-white/30 hover:bg-white/30">← Back to Sponsors</Link>}
      />

      <form onSubmit={submit} className="form-shell">
        <h2 className="section-label">{editingId ? '✏️ Edit Category' : '➕ Add Category'}</h2>
        <input type="text" placeholder="Display name, e.g. Vigraha (Idol)" className="input" required
          value={form.categoryLabel} onChange={(e) => setForm({ ...form, categoryLabel: e.target.value })} />
        <div>
          <input type="text" placeholder="Key, e.g. vigraha_data (auto-generated if left blank)" className="input"
            value={form.categoryKey} onChange={(e) => setForm({ ...form, categoryKey: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Lowercase, underscores only — this is the value stored on each sponsor.</p>
        </div>
        <input type="number" placeholder="Sort order (optional, lower shows first)" className="input"
          value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-gray-600 pt-1">
          <input type="checkbox" checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Active (shown in the dropdown)
        </label>
        {msg && <p className={`text-sm rounded-lg px-3 py-2 border ${msgIsError ? 'text-red-600 bg-red-50 border-red-100' : 'text-saffron-700 bg-saffron-50 border-orange-100'}`}>{msg}</p>}
        <div className="flex gap-2 pt-1">
          <button className="btn-primary flex-1">{editingId ? 'Update Category' : 'Add Category'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="space-y-2.5">
        {categories.map((c) => (
          <div key={c.id} className="card flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-base shrink-0">
                🏷️
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{c.categoryLabel}{c.active === false ? ' · Hidden' : ''}</p>
                <p className="text-xs text-gray-400 truncate">{c.categoryKey}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => startEdit(c)} className="btn-edit-text">Edit</button>
              <button onClick={() => remove(c)} className="btn-danger-text">Delete</button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <AdminEmptyState icon="🏷️" title="No categories yet" subtitle="Add one above to start populating the dropdown." />}
      </div>
    </div>
  )
}
