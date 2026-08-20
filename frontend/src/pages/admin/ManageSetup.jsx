import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

const emptyDayForm = { date: '', dayNumber: '', label: '' }

export default function ManageSetup() {
  const [years, setYears] = useState([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [days, setDays] = useState([])

  const [yearForm, setYearForm] = useState({ year: new Date().getFullYear(), startDate: '', endDate: '', openingBalance: '' })
  const [editYearForm, setEditYearForm] = useState({ yearId: '', startDate: '', endDate: '', active: true })
  const [dayForm, setDayForm] = useState(emptyDayForm)
  const [editingDayId, setEditingDayId] = useState(null)
  const [balanceForm, setBalanceForm] = useState({ yearId: '', openingBalance: '' })
  const [msg, setMsg] = useState('')
  const [msgIsError, setMsgIsError] = useState(false)

  const loadYears = (selectId) => {
    api.get('/public/years').then((res) => {
      setYears(res.data)
      // Prefer explicitly selecting the id we were just told about (e.g. right
      // after creating a year); otherwise keep whatever's already selected;
      // otherwise fall back to the first year in the list.
      const applySelection = (y) => {
        setSelectedYearId(y.id)
        setBalanceForm({ yearId: y.id, openingBalance: y.openingBalance ?? '' })
        setEditYearForm({ yearId: y.id, startDate: y.startDate || '', endDate: y.endDate || '', active: y.active !== false })
      }
      if (selectId) {
        const y = res.data.find((yr) => yr.id === selectId)
        if (y) applySelection(y)
      } else if (!selectedYearId && res.data.length > 0) {
        applySelection(res.data[0])
      }
    })
  }

  const loadDays = (yearId) => {
    if (!yearId) {
      setDays([])
      return
    }
    api.get(`/admin/setup/years/${yearId}/days`).then((res) => setDays(res.data))
  }

  useEffect(() => loadYears(), [])
  useEffect(() => loadDays(selectedYearId), [selectedYearId])

  const showMsg = (text, isError) => {
    setMsg(text)
    setMsgIsError(!!isError)
  }

  const createYear = async (e) => {
    e.preventDefault()
    showMsg('', false)
    try {
      const res = await api.post('/admin/setup/years', {
        year: yearForm.year,
        startDate: yearForm.startDate,
        endDate: yearForm.endDate,
        openingBalance: yearForm.openingBalance ? Number(yearForm.openingBalance) : 0,
      })
      showMsg(`Year ${res.data.year} created and selected below.`, false)
      setYearForm({ year: new Date().getFullYear() + 1, startDate: '', endDate: '', openingBalance: '' })
      loadYears(res.data.id) // immediately select the year we just created
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to create year', true)
    }
  }

  const saveYearDetails = async (e) => {
    e.preventDefault()
    showMsg('', false)
    try {
      await api.put(`/admin/setup/years/${editYearForm.yearId}`, {
        startDate: editYearForm.startDate,
        endDate: editYearForm.endDate,
        active: editYearForm.active,
      })
      showMsg('Festival year details updated.', false)
      loadYears(Number(editYearForm.yearId))
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update year', true)
    }
  }

  const deleteYear = async () => {
    const y = years.find((yr) => yr.id === Number(editYearForm.yearId))
    if (!y) return
    if (!confirm(`Delete festival year ${y.year} entirely? This only works if it has no collections, expenses, sponsors, programs, annadanam sponsors, or velam items yet.`)) return
    try {
      await api.delete(`/admin/setup/years/${y.id}`)
      showMsg(`Year ${y.year} deleted.`, false)
      setSelectedYearId('')
      loadYears()
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to delete year', true)
    }
  }

  const saveOpeningBalance = async (e) => {
    e.preventDefault()
    showMsg('', false)
    try {
      await api.put(`/admin/setup/years/${balanceForm.yearId}`, {
        openingBalance: Number(balanceForm.openingBalance),
      })
      showMsg('Opening balance updated.', false)
      loadYears()
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update opening balance', true)
    }
  }

  const startEditDay = (d) => {
    setEditingDayId(d.id)
    setDayForm({ date: d.date, dayNumber: d.dayNumber, label: d.label || '' })
    showMsg('', false)
  }

  const cancelEditDay = () => {
    setEditingDayId(null)
    setDayForm(emptyDayForm)
  }

  const submitDay = async (e) => {
    e.preventDefault()
    showMsg('', false)
    if (!selectedYearId) {
      showMsg('Create a festival year first (above) before adding days.', true)
      return
    }
    try {
      const payload = {
        festivalYearId: selectedYearId,
        date: dayForm.date,
        dayNumber: Number(dayForm.dayNumber),
        label: dayForm.label,
      }
      if (editingDayId) {
        await api.put(`/admin/setup/days/${editingDayId}`, payload)
      } else {
        await api.post('/admin/setup/days', payload)
      }
      cancelEditDay()
      loadDays(selectedYearId)
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to save day', true)
    }
  }

  const deleteDay = async (id) => {
    if (!confirm('Delete this day and all its data?')) return
    await api.delete(`/admin/setup/days/${id}`)
    if (editingDayId === id) cancelEditDay()
    loadDays(selectedYearId)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Festival Year & Days Setup</h1>
      {msg && (
        <p className={`text-sm p-2 rounded ${msgIsError ? 'text-red-700 bg-red-50' : 'text-saffron-700 bg-saffron-50'}`}>
          {msg}
        </p>
      )}

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-2">1. Create a Festival Year</h2>
        <form onSubmit={createYear} className="space-y-2">
          <input type="number" placeholder="Year, e.g. 2026" className="input" required
            value={yearForm.year} onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })} />
          <input type="date" className="input" value={yearForm.startDate}
            onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })} />
          <input type="date" className="input" value={yearForm.endDate}
            onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })} />
          <div>
            <label className="text-xs text-gray-500">
              Amount already with the committee from before digitizing (leave 0 if none)
            </label>
            <input type="number" inputMode="numeric" placeholder="Opening balance" className="input mt-1"
              value={yearForm.openingBalance} onChange={(e) => setYearForm({ ...yearForm, openingBalance: e.target.value })} />
          </div>
          <button className="btn-primary w-full">Create Year</button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-2">2. Update a Festival Year</h2>
        <p className="text-xs text-gray-400 mb-2">
          Edit its dates or active status, or delete it entirely if it's empty and was created by mistake.
        </p>
        {years.length === 0 ? (
          <p className="text-sm text-gray-400">Create a festival year first.</p>
        ) : (
          <form onSubmit={saveYearDetails} className="space-y-2">
            <select className="input" value={editYearForm.yearId}
              onChange={(e) => {
                const y = years.find((yr) => yr.id === Number(e.target.value))
                setEditYearForm({ yearId: e.target.value, startDate: y?.startDate || '', endDate: y?.endDate || '', active: y?.active !== false })
              }}>
              {years.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
            </select>
            <input type="date" className="input" value={editYearForm.startDate}
              onChange={(e) => setEditYearForm({ ...editYearForm, startDate: e.target.value })} />
            <input type="date" className="input" value={editYearForm.endDate}
              onChange={(e) => setEditYearForm({ ...editYearForm, endDate: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={editYearForm.active}
                onChange={(e) => setEditYearForm({ ...editYearForm, active: e.target.checked })} />
              Active festival year
            </label>
            <div className="flex gap-2">
              <button className="btn-secondary flex-1">Save Changes</button>
              <button type="button" onClick={deleteYear} className="text-red-500 text-sm px-3">Delete Year</button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-2">3. Update Opening Balance</h2>
        <p className="text-xs text-gray-400 mb-2">
          Set this once when you start digitizing — the amount remaining from all previous years' manual books, carried into this year's totals.
        </p>
        {years.length === 0 ? (
          <p className="text-sm text-gray-400">Create a festival year first.</p>
        ) : (
          <form onSubmit={saveOpeningBalance} className="space-y-2">
            <select className="input" value={balanceForm.yearId}
              onChange={(e) => {
                const y = years.find((yr) => yr.id === Number(e.target.value))
                setBalanceForm({ yearId: e.target.value, openingBalance: y?.openingBalance ?? '' })
              }}>
              {years.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
            </select>
            <input type="number" inputMode="numeric" placeholder="Opening balance" className="input"
              value={balanceForm.openingBalance} onChange={(e) => setBalanceForm({ ...balanceForm, openingBalance: e.target.value })} />
            <button className="btn-secondary w-full">Save Opening Balance</button>
          </form>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-2">4. Add / Edit Days for a Year</h2>

        {years.length === 0 ? (
          <p className="text-sm text-gray-400">Create a festival year first (step 1 above) — there's nothing to add days to yet.</p>
        ) : (
          <>
            <select className="input mb-2" value={selectedYearId} onChange={(e) => { setSelectedYearId(e.target.value); cancelEditDay() }}>
              {years.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
            </select>

            <form onSubmit={submitDay} className="space-y-2">
              {editingDayId && <p className="text-xs text-saffron-700">Editing Day {days.find((d) => d.id === editingDayId)?.dayNumber}</p>}
              <input type="date" className="input" required
                value={dayForm.date} onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })} />
              <input type="number" placeholder="Day number, e.g. 1" className="input" required
                value={dayForm.dayNumber} onChange={(e) => setDayForm({ ...dayForm, dayNumber: e.target.value })} />
              <input type="text" placeholder="Label (optional), e.g. Ganesh Visarjan" className="input"
                value={dayForm.label} onChange={(e) => setDayForm({ ...dayForm, label: e.target.value })} />
              <div className="flex gap-2">
                <button className="btn-primary flex-1" disabled={!selectedYearId}>{editingDayId ? 'Update Day' : 'Add Day'}</button>
                {editingDayId && <button type="button" onClick={cancelEditDay} className="btn-secondary">Cancel</button>}
              </div>
            </form>

            <div className="mt-4 space-y-2">
              {days.map((d) => (
                <div key={d.id} className="flex justify-between items-center border-b border-gray-100 py-2">
                  <div>
                    <p className="text-sm font-medium">Day {d.dayNumber} {d.label ? `· ${d.label}` : ''}</p>
                    <p className="text-xs text-gray-400">{d.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => startEditDay(d)} className="text-saffron-600 text-sm">Edit</button>
                    <button onClick={() => deleteDay(d.id)} className="text-red-500 text-sm">Delete</button>
                  </div>
                </div>
              ))}
              {days.length === 0 && <p className="text-sm text-gray-400">No days added yet.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
