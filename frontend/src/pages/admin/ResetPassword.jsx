import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('This reset link is missing its token. Please request a new one.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword })
      setDone(true)
      setTimeout(() => navigate('/admin/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/10 text-center mb-[-28px] pb-12">
          <div className="relative z-10">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl mb-3">
              🔒
            </div>
            <h1 className="text-xl font-black tracking-tight">Reset Password</h1>
            <p className="text-orange-100 text-xs mt-1">Choose a new admin password</p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="relative z-10 bg-white rounded-2xl shadow-lg shadow-orange-900/5 border border-orange-100 p-6 pt-10 space-y-3">
          {!token && (
            <p className="text-amber-700 text-sm bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              This link is missing its reset token. Please use the link from your email, or request a new one.
            </p>
          )}

          {done ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              Password reset! Redirecting to login...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">New Password</label>
                <input
                  type="password"
                  className="input mt-1"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Confirm New Password</label>
                <input
                  type="password"
                  className="input mt-1"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {String(error)}
                </p>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          <Link to="/admin/login" className="text-saffron-700 font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
