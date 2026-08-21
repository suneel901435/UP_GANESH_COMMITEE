import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data || 'Login failed. Check your email and password.')
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
              🕉️
            </div>
            <h1 className="text-xl font-black tracking-tight">Admin Login</h1>
            <p className="text-orange-100 text-xs mt-1">Sign in to manage the festival</p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 bg-white rounded-2xl shadow-lg shadow-orange-900/5 border border-orange-100 p-6 pt-10 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Email</label>
            <input
              type="email"
              className="input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Password</label>
            <input
              type="password"
              className="input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {String(error)}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <Link to="/admin/forgot-password" className="block text-center text-xs font-semibold text-saffron-700 hover:underline pt-1">
            Forgot password?
          </Link>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          First time? Default login is admin@ganeshfest.local / Admin@123 — change it right after.
        </p>
      </div>
    </div>
  )
}
