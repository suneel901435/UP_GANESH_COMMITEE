import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function ManageSetup() {
  const [years, setYears] = useState([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [days, setDays] = useState([])

  const [yearForm, setYearForm] = useState({ year: new Date().getFullYear(), startDate: '', endDate: '', openingBalance: '' })
  const [dayForm, setDayForm] = useState({ date: '', dayNumber: '', label: '' })
  const [balanceForm, setBalanceForm] = useState({ yearId: '', openingBalance: '' })
  const [msg, setMsg] = useState('')
  const [msgIsError, setMsgIsError] = useState(false)

  const loadYears = (selectId) => {
    api.get('/public/years').then((res) => {
      setYears(res.data)
      // Prefer explicitly selecting the id we were just told about (e.g. right
      // after creating a year); otherwise keep whatever's already selected;
      // otherwise fall back to the first year in the list.
      if (selectId) {
        setSelectedYearId(selectId)
        setBalanceForm({ yearId: selectId, openingBalance: res.data.find((y) => y.id === selectId)?.openingBalance ?? '' })
      } else if (!selectedYearId && res.data.length > 0) {
        setSelectedYearId(res.data[0].id)
        setBalanceForm({ yearId: res.data[0].id, openingBalance: res.data[0].openingBalance ?? '' })
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

  const createDay = async (e) => {
    e.preventDefault()
    showMsg('', false)
    if (!selectedYearId) {
      showMsg('Create a festival year first (above) before adding days.', true)
      return
    }
    try {
      await api.post('/admin/setup/days', {
        festivalYearId: selectedYearId,
        date: dayForm.date,
        dayNumber: Number(dayForm.dayNumber),
        label: dayForm.label,
      })
      setDayForm({ date: '', dayNumber: '', label: '' })
      loadDays(selectedYearId)
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to create day', true)
    }
  }

  const deleteDay = async (id) => {
    if (!confirm('Delete this day and all its data?')) return
    await api.delete(`/admin/setup/days/${id}`)
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
        <h2 className="font-semibold text-gray-700 mb-2">2. Update Opening Balance</h2>
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
        <h2 className="font-semibold text-gray-700 mb-2">3. Add Days to a Year</h2>

        {years.length === 0 ? (
          <p className="text-sm text-gray-400">Create a festival year first (step 1 above) — there's nothing to add days to yet.</p>
        ) : (
          <>
            <select className="input mb-2" value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)}>
              {years.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
            </select>

            <form onSubmit={createDay} className="space-y-2">
              <input type="date" className="input" required
                value={dayForm.date} onChange={(e) => setDayForm({ ...dayForm, date: e.target.value })} />
              <input type="number" placeholder="Day number, e.g. 1" className="input" required
                value={dayForm.dayNumber} onChange={(e) => setDayForm({ ...dayForm, dayNumber: e.target.value })} />
              <input type="text" placeholder="Label (optional), e.g. Ganesh Visarjan" className="input"
                value={dayForm.label} onChange={(e) => setDayForm({ ...dayForm, label: e.target.value })} />
              <button className="btn-primary w-full" disabled={!selectedYearId}>Add Day</button>
            </form>

            <div className="mt-4 space-y-2">
              {days.map((d) => (
                <div key={d.id} className="flex justify-between items-center border-b border-gray-100 py-2">
                  <div>
                    <p className="text-sm font-medium">Day {d.dayNumber} {d.label ? `· ${d.label}` : ''}</p>
                    <p className="text-xs text-gray-400">{d.date}</p>
                  </div>
                  <button onClick={() => deleteDay(d.id)} className="text-red-500 text-sm">Delete</button>
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
