import React, { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'
import { useYear } from '../../context/YearContext'
import { getFullImageUrl } from '../../utils/imageUrl'
import AdminPageHeader from '../../components/AdminPageHeader'
import AdminEmptyState from '../../components/AdminEmptyState'

const CATEGORIES = [
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'DECORATION', label: 'Decoration' },
  { value: 'CELEBRATION', label: 'Celebration' },
]
const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label || v

const emptyForm = { category: 'FESTIVAL', caption: '' }

export default function ManageGallery() {
  const { selectedYear, years } = useYear()
  const [photos, setPhotos] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [filterCategory, setFilterCategory] = useState('ALL')

  // Two separate <input type="file"> refs - one plain (opens the gallery /
  // file picker) and one with capture="environment" (opens the camera
  // directly on phones that support it) - same pattern as Velam item photos.
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const currentYearObj = years.find((y) => y.year === selectedYear)

  const loadPhotos = () => {
    if (!selectedYear) return
    api.get(`/public/years/${selectedYear}/gallery-photos`).then((res) => setPhotos(res.data))
  }
  useEffect(loadPhotos, [selectedYear])

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

  const startEdit = (photo) => {
    setEditingId(photo.id)
    setForm({
      category: photo.category || 'FESTIVAL',
      caption: photo.caption || '',
    })
    setExistingImageUrl(photo.imageUrl || null)
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
        const res = await api.post('/admin/gallery-photos/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        imageUrl = res.data
        setUploading(false)
      }

      if (!imageUrl) {
        setMsg('Please choose or take a photo first')
        return
      }

      const payload = {
        festivalYearId: currentYearObj.id,
        category: form.category,
        caption: form.caption,
        imageUrl,
      }

      if (editingId) {
        await api.put(`/admin/gallery-photos/${editingId}`, payload)
      } else {
        await api.post('/admin/gallery-photos', payload)
      }
      cancelEdit()
      loadPhotos()
    } catch (err) {
      setUploading(false)
      setMsg(err.response?.data?.message || 'Failed to save')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this photo?')) return
    await api.delete(`/admin/gallery-photos/${id}`)
    if (editingId === id) cancelEdit()
    loadPhotos()
  }

  const visiblePhotos = filterCategory === 'ALL' ? photos : photos.filter((p) => p.category === filterCategory)

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon="📷"
        eyebrow={`Gallery · ${selectedYear || ''}`}
        title="Photo Gallery"
        subtitle="Festival photos, decoration, and celebration moments — shown on the public gallery page."
      />

      <form onSubmit={submit} className="form-shell">
        <h2 className="section-label">{editingId ? '✏️ Edit Photo' : '➕ Add Photo'}</h2>

        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input type="text" placeholder="Caption (optional)" className="input"
          value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />

        {/* Photo picker: two explicit buttons instead of one plain file input,
            since on a phone browser a bare <input type=file> often buries the
            camera option behind "Files" - same pattern as Velam item photos. */}
        <div>
          <label className="text-xs text-gray-500 font-medium block mb-1.5">Photo</label>
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
            <img src={previewUrl} alt="Preview" className="w-28 h-28 object-cover rounded-xl border border-gray-200" />
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
              <img src={getFullImageUrl(existingImageUrl)} alt="Current" className="w-28 h-28 object-cover rounded-xl border border-gray-200" />
              <p className="text-xs text-gray-400 mt-1">Current photo — pick a new one above to replace it</p>
            </div>
          )
        )}

        {msg && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{msg}</p>}
        <div className="flex gap-2 pt-1">
          <button className="btn-primary flex-1" disabled={uploading}>
            {uploading ? 'Uploading photo...' : editingId ? 'Update Photo' : 'Add Photo'}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ALL', ...CATEGORIES.map((c) => c.value)].map((v) => (
          <button
            key={v}
            onClick={() => setFilterCategory(v)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${filterCategory === v ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
          >
            {v === 'ALL' ? 'All' : categoryLabel(v)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visiblePhotos.map((photo) => {
          const photoUrl = getFullImageUrl(photo.imageUrl)
          return (
            <div key={photo.id} className="card space-y-2">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={photo.caption || categoryLabel(photo.category)}
                  className="w-full h-28 rounded-xl object-cover border border-gray-200"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-full h-28 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl">
                  📷
                </div>
              )}
              <div>
                <span className="inline-block text-[10px] uppercase tracking-wide font-bold text-orange-700 bg-orange-50 rounded-full px-2 py-0.5">
                  {categoryLabel(photo.category)}
                </span>
                {photo.caption && <p className="text-xs text-gray-600 mt-1 truncate">{photo.caption}</p>}
              </div>
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => startEdit(photo)} className="btn-edit-text">Edit</button>
                <button onClick={() => remove(photo.id)} className="btn-danger-text">Delete</button>
              </div>
            </div>
          )
        })}
        {visiblePhotos.length === 0 && (
          <div className="col-span-2">
            <AdminEmptyState icon="📷" title="No photos added yet" subtitle="Upload your first festival photo using the form above." />
          </div>
        )}
      </div>
    </div>
  )
}
