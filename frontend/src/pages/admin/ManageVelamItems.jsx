import React, { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'
import { getFullImageUrl } from '../../utils/imageUrl'

const emptyForm = { itemName: '', description: '', basePrice: '' }

export default function ManageVelamItems() {
  const { selectedYear, years } = useYear()
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [sellForm, setSellForm] = useState({}) // { [itemId]: { buyerName, buyerContact, finalPrice } }

  // Two separate <input type="file"> refs - one plain (opens the gallery /
  // file picker) and one with capture="environment" (opens the camera
  // directly on phones that support it) - so users who want to snap a photo
  // on the spot don't have to go hunting through a picker for the camera app.
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const currentYearObj = years.find((y) => y.year === selectedYear)

  const loadItems = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/velam-items`).then((res) => setItems(res.data))
  }
  useEffect(loadItems, [selectedYear])

  // Build/clean up a local preview URL whenever a new file is picked, so the
  // admin can see the photo they're about to upload before hitting submit.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const pickFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (f) setFile(f)
    // reset the input value so picking the exact same file again still fires onChange
    e.target.value = ''
  }

  const clearFile = () => {
    setFile(null)
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({
      itemName: item.itemName || '',
      description: item.description || '',
      basePrice: item.basePrice ?? '',
    })
    setExistingImageUrl(item.imageUrl || null)
    setFile(null)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setExistingImageUrl(null)
    setFile(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      let imageUrl = editingId ? existingImageUrl : null
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

      const payload = {
        festivalYearId: currentYearObj.id,
        itemName: form.itemName,
        description: form.description,
        basePrice: Number(form.basePrice),
        imageUrl,
      }

      if (editingId) {
        await api.put(`/admin/velam-items/${editingId}`, payload)
      } else {
        await api.post('/admin/velam-items', payload)
      }
      cancelEdit()
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
    if (editingId === id) cancelEdit()
    loadItems()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Velam Paata Items</h1>

      <form onSubmit={submit} className="card space-y-2">
        <h2 className="font-semibold text-gray-700">{editingId ? 'Edit Item' : 'Add Item'}</h2>
        <input type="text" placeholder="Item name" className="input" required
          value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
        <input type="text" placeholder="Description (optional)" className="input"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input type="number" inputMode="numeric" placeholder="Base / starting price" className="input" required
          value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />

        {/* Photo picker: two explicit buttons instead of one plain file input,
            since on a phone browser a bare <input type=file> often buries the
            camera option behind "Files" - some users just want to point and
            shoot right there at the auction table. */}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Item photo (optional)</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1.5"
            >
              🖼️ Choose Photo
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1.5"
            >
              📷 Take Photo
            </button>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pickFile}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={pickFile}
          />
        </div>

        {previewUrl ? (
          <div className="relative w-28 h-28">
            <img src={previewUrl} alt="Preview" className="w-28 h-28 object-cover rounded-lg border border-gray-200" />
            <button
              type="button"
              onClick={clearFile}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow"
            >
              ✕
            </button>
          </div>
        ) : (
          editingId && existingImageUrl && (
            <div className="w-28 h-28">
              <img src={getFullImageUrl(existingImageUrl)} alt="Current" className="w-28 h-28 object-cover rounded-lg border border-gray-200" />
              <p className="text-xs text-gray-400 mt-1">Current photo — pick a new one above to replace it</p>
            </div>
          )
        )}

        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1" disabled={uploading}>
            {uploading ? 'Uploading photo...' : editingId ? 'Update Item' : 'Add Item'}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="space-y-3">
        {items.map((item) => {
          const itemImageUrl = getFullImageUrl(item.imageUrl)
          return (
            <div key={item.id} className="card">
              <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3 flex-1 min-w-0">
                  {itemImageUrl ? (
                    <img
                      src={itemImageUrl}
                      alt={item.itemName}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-saffron-50 border border-saffron-100 flex items-center justify-center text-2xl shrink-0">
                      🪔
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.itemName}</p>
                    <p className="text-xs text-gray-400">Base: ₹{Number(item.basePrice).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => startEdit(item)} className="text-saffron-600 text-sm">Edit</button>
                  <button onClick={() => remove(item.id)} className="text-red-500 text-sm">✕</button>
                </div>
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
          )
        })}
        {items.length === 0 && <p className="text-sm text-gray-400">No items added yet.</p>}
      </div>
    </div>
  )
}
