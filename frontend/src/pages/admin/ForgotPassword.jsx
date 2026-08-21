import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.data?.message || 'If that email is registered, a password reset link has been sent.')
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
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
              🔑
            </div>
            <h1 className="text-xl font-black tracking-tight">Forgot Password</h1>
            <p className="text-orange-100 text-xs mt-1">We'll email you a reset link</p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="relative z-10 bg-white rounded-2xl shadow-lg shadow-orange-900/5 border border-orange-100 p-6 pt-10 space-y-3">
          {submitted ? (
            <p className="text-sm text-gray-600 bg-green-50 border border-green-100 text-green-700 rounded-lg px-3 py-2">
              {message}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Admin Email</label>
                <input
                  type="email"
                  className="input mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {String(error)}
                </p>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send Reset Link'}
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
