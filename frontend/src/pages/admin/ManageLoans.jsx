import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Village Lending (Vaddi)</h1>
      <p className="text-xs text-gray-400 -mt-2">
        Admin-only — borrower names and amounts here are not shown on the public site. Only aggregate totals appear on the public dashboard.
      </p>

      <form onSubmit={submitLoan} className="card space-y-2">
        <h2 className="font-semibold text-gray-700">{editingId ? 'Edit Loan' : 'New Loan'}</h2>
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
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <div className="flex gap-2">
          <button className="btn-primary flex-1">{editingId ? 'Update Loan' : 'Add Loan'}</button>
          {editingId && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div>
        <h2 className="font-semibold text-gray-700 mb-2">Active Loans ({activeLoans.length})</h2>
        <div className="space-y-2">
          {activeLoans.map((loan) => (
            <div key={loan.id} className="card">
              <div className="flex justify-between items-start">
                <div onClick={() => toggleExpand(loan.id)} className="cursor-pointer flex-1">
                  <p className="font-medium text-gray-800">{loan.borrowerName}</p>
                  <p className="text-xs text-gray-400">
                    Lent {money(loan.principalAmount)} on {loan.loanDate} · {loan.interestRatePercent}₹/100 {loan.interestPeriodNote}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-2 shrink-0">
                  <button onClick={() => startEdit(loan)} className="text-saffron-600 text-sm">Edit</button>
                  <button onClick={() => deleteLoan(loan.id)} className="text-red-500 text-sm">✕</button>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-gray-400">Outstanding</p><p className="font-medium text-saffron-700">{money(loan.outstandingPrincipal)}</p></div>
                <div><p className="text-gray-400">Interest paid so far</p><p className="font-medium text-green-700">{money(loan.totalInterestPaid)}</p></div>
              </div>

              <button onClick={() => toggleExpand(loan.id)} className="text-saffron-600 text-sm mt-2">
                {expandedId === loan.id ? 'Hide details ▲' : 'Record repayment / view history ▼'}
              </button>

              {expandedId === loan.id && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
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
                      <div key={r.id} className="flex justify-between text-xs text-gray-500 border-b border-gray-50 py-1">
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
          {activeLoans.length === 0 && <p className="text-sm text-gray-400">No active loans.</p>}
        </div>
      </div>

      {closedLoans.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-2">Closed Loans ({closedLoans.length})</h2>
          <div className="space-y-2">
            {closedLoans.map((loan) => (
              <div key={loan.id} className="card bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">{loan.borrowerName}</p>
                  <p className="text-xs text-gray-400">
                    {money(loan.principalAmount)} · Interest earned: {money(loan.totalInterestPaid)}
                  </p>
                </div>
                <button onClick={() => reopenLoan(loan.id)} className="text-saffron-600 text-xs">Reopen</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
