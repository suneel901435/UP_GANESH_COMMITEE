import React, { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminPageHeader from '../../components/AdminPageHeader'
import AdminEmptyState from '../../components/AdminEmptyState'

function today() {
  return new Date().toISOString().slice(0, 10)
}
function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

const emptyLoanForm = {
  borrowerName: '', borrowerContact: '', principalAmount: '',
  interestRatePercent: '2', interestPeriodNote: 'per month',
  loanDate: today(), notes: '',
}

export default function ManageLoans() {
  const [loans, setLoans] = useState([])
  const [msg, setMsg] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [repayments, setRepayments] = useState({})
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState(emptyLoanForm)

  const [repayForm, setRepayForm] = useState({ paymentDate: today(), principalPaid: '', interestPaid: '', notes: '' })

  const loadLoans = () => {
    api.get('/admin/loans').then((res) => setLoans(res.data))
  }
  useEffect(loadLoans, [])

  const startEdit = (loan) => {
    setEditingId(loan.id)
    setForm({
      borrowerName: loan.borrowerName || '',
      borrowerContact: loan.borrowerContact || '',
      principalAmount: loan.principalAmount ?? '',
      interestRatePercent: loan.interestRatePercent ?? '2',
      interestPeriodNote: loan.interestPeriodNote || 'per month',
      loanDate: loan.loanDate || today(),
      notes: loan.notes || '',
    })
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyLoanForm)
  }

  const submitLoan = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const payload = {
        borrowerName: form.borrowerName,
        borrowerContact: form.borrowerContact,
        principalAmount: Number(form.principalAmount),
        interestRatePercent: Number(form.interestRatePercent),
        interestPeriodNote: form.interestPeriodNote,
        loanDate: form.loanDate,
        notes: form.notes,
      }
      if (editingId) {
        await api.put(`/admin/loans/${editingId}`, payload)
      } else {
        await api.post('/admin/loans', payload)
      }
      cancelEdit()
      loadLoans()
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to save loan')
    }
  }

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    const res = await api.get(`/admin/loans/${id}/repayments`)
    setRepayments((prev) => ({ ...prev, [id]: res.data }))
  }

  const submitRepayment = async (loanId) => {
    if (!repayForm.principalPaid && !repayForm.interestPaid) {
      alert('Enter at least a principal or interest amount')
      return
    }
    await api.post(`/admin/loans/${loanId}/repayments`, {
      paymentDate: repayForm.paymentDate,
      principalPaid: repayForm.principalPaid ? Number(repayForm.principalPaid) : 0,
      interestPaid: repayForm.interestPaid ? Number(repayForm.interestPaid) : 0,
      notes: repayForm.notes,
    })
    setRepayForm({ paymentDate: today(), principalPaid: '', interestPaid: '', notes: '' })
    loadLoans()
    const res = await api.get(`/admin/loans/${loanId}/repayments`)
    setRepayments((prev) => ({ ...prev, [loanId]: res.data }))
  }

  const closeLoan = async (id) => {
    if (!confirm('Mark this loan as fully closed?')) return
    await api.post(`/admin/loans/${id}/close`)
    loadLoans()
  }

  const reopenLoan = async (id) => {
    await api.post(`/admin/loans/${id}/reopen`)
    loadLoans()
  }

  const deleteLoan = async (id) => {
    if (!confirm('Delete this loan record entirely? This also deletes its repayment history.')) return
    await api.delete(`/admin/loans/${id}`)
    if (editingId === id) cancelEdit()
    loadLoans()
  }

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE')
  const closedLoans = loans.filter((l) => l.status === 'CLOSED')
  const totalOutstanding = activeLoans.reduce((s, l) => s + (Number(l.outstandingPrincipal) || 0), 0)

  return (
    <div className="space-y-5">
      <AdminPageHeader
        icon="💵"
        eyebrow="Village Lending"
        title="Village Lending (Vaddi)"
        subtitle="Admin-only — borrower names and amounts are not shown on the public site."
        stat={{ label: 'Outstanding', value: money(totalOutstanding) }}
      />

      <form onSubmit={submitLoan} className="form-shell">
        <h2 className="section-label">{editingId ? '✏️ Edit Loan' : '➕ New Loan'}</h2>
        <input type="text" placeholder="Borrower name" className="input" required
          value={form.borrowerName} onChange={(e) => setForm({ ...form, borrowerName: e.target.value })} />
        <input type="text" placeholder="Contact (optional)" className="input"
          value={form.borrowerContact} onChange={(e) => setForm({ ...form, borrowerContact: e.target.value })} />
        <input type="number" inputMode="numeric" placeholder="Principal amount" className="input" required
          value={form.principalAmount} onChange={(e) => setForm({ ...form, principalAmount: e.target.value })} />
        <div className="flex gap-2">
          <input type="number" step="0.1" placeholder="Interest ₹ per 100" className="input"
            value={form.interestRatePercent} onChange={(e) => setForm({ ...form, interestRatePercent: e.target.value })} />
          <input type="text" placeholder="Period, e.g. per month" className="input"
            value={form.interestPeriodNote} onChange={(e) => setForm({ ...form, interestPeriodNote: e.target.value })} />
        </div>
        <input type="date" className="input" required
          value={form.loanDate} onChange={(e) => setForm({ ...form, loanDate: e.target.value })} />
        <input type="text" placeholder="Notes (optional)" className="input"
          value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        {msg && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{msg}</p>}
        <div className="flex gap-2 pt-1">
          <button className="btn-primary flex-1">{editingId ? 'Update Loan' : 'Add Loan'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div>
        <p className="section-label mb-2">🟢 Active Loans ({activeLoans.length})</p>
        <div className="space-y-2.5">
          {activeLoans.map((loan) => (
            <div key={loan.id} className="card">
              <div className="flex justify-between items-start">
                <div onClick={() => toggleExpand(loan.id)} className="cursor-pointer flex-1 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-base shrink-0">
                    💵
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{loan.borrowerName}</p>
                    <p className="text-xs text-gray-400">
                      Lent {money(loan.principalAmount)} on {loan.loanDate} · {loan.interestRatePercent}₹/100 {loan.interestPeriodNote}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button onClick={() => startEdit(loan)} className="btn-edit-text">Edit</button>
                  <button onClick={() => deleteLoan(loan.id)} className="btn-danger-text">Delete</button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-orange-50 rounded-lg p-2"><p className="text-gray-400 text-xs">Outstanding</p><p className="font-bold text-orange-700">{money(loan.outstandingPrincipal)}</p></div>
                <div className="bg-emerald-50 rounded-lg p-2"><p className="text-gray-400 text-xs">Interest paid so far</p><p className="font-bold text-emerald-700">{money(loan.totalInterestPaid)}</p></div>
              </div>

              <button onClick={() => toggleExpand(loan.id)} className="btn-edit-text mt-2 !px-0">
                {expandedId === loan.id ? 'Hide details ▲' : 'Record repayment / view history ▼'}
              </button>

              {expandedId === loan.id && (
                <div className="mt-3 border-t border-orange-100 pt-3 space-y-3">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="date" className="input" value={repayForm.paymentDate}
                        onChange={(e) => setRepayForm({ ...repayForm, paymentDate: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <input type="number" inputMode="numeric" placeholder="Principal paid" className="input"
                        value={repayForm.principalPaid} onChange={(e) => setRepayForm({ ...repayForm, principalPaid: e.target.value })} />
                      <input type="number" inputMode="numeric" placeholder="Interest (vaddi) paid" className="input"
                        value={repayForm.interestPaid} onChange={(e) => setRepayForm({ ...repayForm, interestPaid: e.target.value })} />
                    </div>
                    <input type="text" placeholder="Notes (optional)" className="input"
                      value={repayForm.notes} onChange={(e) => setRepayForm({ ...repayForm, notes: e.target.value })} />
                    <button onClick={() => submitRepayment(loan.id)} className="btn-secondary w-full">Record Repayment</button>
                  </div>

                  <div className="space-y-1">
                    {(repayments[loan.id] || []).map((r) => (
                      <div key={r.id} className="flex justify-between text-xs text-gray-500 border-b border-gray-50 py-1.5">
                        <span>{r.paymentDate}{r.notes ? ` · ${r.notes}` : ''}</span>
                        <span>
                          {Number(r.principalPaid) > 0 && <>P: {money(r.principalPaid)} </>}
                          {Number(r.interestPaid) > 0 && <>I: {money(r.interestPaid)}</>}
                        </span>
                      </div>
                    ))}
                    {(repayments[loan.id] || []).length === 0 && <p className="text-xs text-gray-400">No repayments yet.</p>}
                  </div>

                  <button onClick={() => closeLoan(loan.id)} className="text-xs text-gray-500 underline">
                    Mark as fully closed manually
                  </button>
                </div>
              )}
            </div>
          ))}
          {activeLoans.length === 0 && <AdminEmptyState icon="💵" title="No active loans" subtitle="Loans you add above will show up here." />}
        </div>
      </div>

      {closedLoans.length > 0 && (
        <div>
          <p className="section-label mb-2">⚪ Closed Loans ({closedLoans.length})</p>
          <div className="space-y-2.5">
            {closedLoans.map((loan) => (
              <div key={loan.id} className="card bg-gray-50/70 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-700">{loan.borrowerName}</p>
                  <p className="text-xs text-gray-400">
                    {money(loan.principalAmount)} · Interest earned: {money(loan.totalInterestPaid)}
                  </p>
                </div>
                <button onClick={() => reopenLoan(loan.id)} className="btn-edit-text">Reopen</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
