import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Sponsor Categories</h1>
        <Link to="/admin/sponsors" className="btn-secondary text-sm shrink-0">← Back to Sponsors</Link>
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        These are the options that show up in the "Category" dropdown when adding a sponsor — e.g. vigraha_data, laddu_data.
      </p>

      <form onSubmit={submit} className="card space-y-2">
        <h2 className="font-semibold text-gray-700">{editingId ? 'Edit Category' : 'Add Category'}</h2>
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
        {msg && <p className={`text-sm ${msgIsError ? 'text-red-600' : 'text-saffron-700'}`}>{msg}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1">{editingId ? 'Update Category' : 'Add Category'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{c.categoryLabel}{c.active === false ? ' · Hidden' : ''}</p>
              <p className="text-xs text-gray-400">{c.categoryKey}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => startEdit(c)} className="text-saffron-600 text-sm">Edit</button>
              <button onClick={() => remove(c)} className="text-red-500 text-sm">✕</button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-gray-400">No categories yet — add one above.</p>}
      </div>
    </div>
  )
}
