import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'

export default function ManageVelamItems() {
  const { selectedYear, years } = useYear()
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ itemName: '', description: '', basePrice: '' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [sellForm, setSellForm] = useState({}) // { [itemId]: { buyerName, buyerContact, finalPrice } }

  const currentYearObj = years.find((y) => y.year === selectedYear)

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/velam-items`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      let imageUrl = null
      if (file) {
        setUploading(true)
        const fd = new FormData()
        fd.append('file', file)
        const res = await api.post('/admin/velam-items/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        imageUrl = res.data
        setUploading(false)
      }

      await api.post('/admin/velam-items', {
        festivalYearId: currentYearObj.id,
        itemName: form.itemName,
        description: form.description,
        basePrice: Number(form.basePrice),
        imageUrl,
      })
      setForm({ itemName: '', description: '', basePrice: '' })
      setFile(null)
      loadItems()
    } catch (err) {
      setUploading(false)
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const markSold = async (id) => {
    const s = sellForm[id]
    if (!s || !s.buyerName || !s.finalPrice) {
      alert('Enter buyer name and final price first')
      return
    }
    await api.post(`/admin/velam-items/${id}/mark-sold`, {
      buyerName: s.buyerName,
      buyerContact: s.buyerContact || '',
      finalPrice: Number(s.finalPrice),
    })
    setSellForm((prev) => ({ ...prev, [id]: undefined }))
    loadItems()
  }

  const unsell = async (id) => {
    if (!confirm('Mark this item as available again?')) return
    await api.post(`/admin/velam-items/${id}/unsell`)
    loadItems()
  }

  const remove = async (id) => {
    if (!confirm('Delete this item?')) return
    await api.delete(`/admin/velam-items/${id}`)
    loadItems()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Velam Paata Items</h1>

      <form onSubmit={submit} className="card space-y-2">
        <input type="text" placeholder="Item name" className="input" required
          value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
        <input type="text" placeholder="Description (optional)" className="input"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="number" inputMode="numeric" placeholder="Base / starting price" className="input" required
          value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
        <input type="file" accept="image/*" className="input"
          onChange={(e) => setFile(e.target.files[0])} />
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <button className="btn-primary w-full" disabled={uploading}>
          {uploading ? 'Uploading photo...' : 'Add Item'}
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800">{item.itemName}</p>
                <p className="text-xs text-gray-400">Base: ₹{Number(item.basePrice).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => remove(item.id)} className="text-red-500 text-sm">✕</button>
            </div>

            {item.status === 'SOLD' ? (
              <div className="mt-2 bg-gray-50 rounded-lg p-2 flex justify-between items-center">
                <div>
                  <p className="text-sm">Sold to <span className="font-medium">{item.buyerName}</span></p>
                  <p className="text-xs text-gray-400">₹{Number(item.finalPrice).toLocaleString('en-IN')}</p>
                </div>
                <button onClick={() => unsell(item.id)} className="text-saffron-600 text-sm">Undo</button>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <input type="text" placeholder="Buyer name" className="input"
                  value={sellForm[item.id]?.buyerName || ''}
                  onChange={(e) => setSellForm({ ...sellForm, [item.id]: { ...sellForm[item.id], buyerName: e.target.value } })} />
                <div className="flex gap-2">
                  <input type="text" placeholder="Buyer contact (optional)" className="input"
                    value={sellForm[item.id]?.buyerContact || ''}
                    onChange={(e) => setSellForm({ ...sellForm, [item.id]: { ...sellForm[item.id], buyerContact: e.target.value } })} />
                  <input type="number" inputMode="numeric" placeholder="Final price" className="input"
                    value={sellForm[item.id]?.finalPrice || ''}
                    onChange={(e) => setSellForm({ ...sellForm, [item.id]: { ...sellForm[item.id], finalPrice: e.target.value } })} />
                </div>
                <button onClick={() => markSold(item.id)} className="btn-secondary w-full">Mark as Sold</button>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">No items added yet.</p>}
      </div>
    </div>
  )
}
