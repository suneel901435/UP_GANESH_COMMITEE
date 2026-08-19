import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Dashboard from './pages/Dashboard'
import DayWiseLedger from './pages/DayWiseLedger'
import DayDetail from './pages/DayDetail'
import Programs from './pages/Programs'
import AnnadanamSponsors from './pages/AnnadanamSponsors'
import Sponsors from './pages/Sponsors'
import VelamPaata from './pages/VelamPaata'
import PastYears from './pages/PastYears'

import Login from './pages/admin/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageSetup from './pages/admin/ManageSetup'
import ManageCollections from './pages/admin/ManageCollections'
import ManageExpenses from './pages/admin/ManageExpenses'
import ManagePrograms from './pages/admin/ManagePrograms'
import ManageSponsors from './pages/admin/ManageSponsors'
import ManageAnnadanam from './pages/admin/ManageAnnadanam'
import ManageVelamItems from './pages/admin/ManageVelamItems'
import ManageLoans from './pages/admin/ManageLoans'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-4 pb-16">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/ledger" element={<DayWiseLedger />} />
          <Route path="/ledger/day/:date" element={<DayDetail />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/annadanam" element={<AnnadanamSponsors />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/velam" element={<VelamPaata />} />
          <Route path="/past-years" element={<PastYears />} />

          {/* Admin */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/setup" element={<ProtectedRoute><ManageSetup /></ProtectedRoute>} />
          <Route path="/admin/collections" element={<ProtectedRoute><ManageCollections /></ProtectedRoute>} />
          <Route path="/admin/expenses" element={<ProtectedRoute><ManageExpenses /></ProtectedRoute>} />
          <Route path="/admin/programs" element={<ProtectedRoute><ManagePrograms /></ProtectedRoute>} />
          <Route path="/admin/sponsors" element={<ProtectedRoute><ManageSponsors /></ProtectedRoute>} />
          <Route path="/admin/annadanam" element={<ProtectedRoute><ManageAnnadanam /></ProtectedRoute>} />
          <Route path="/admin/velam-items" element={<ProtectedRoute><ManageVelamItems /></ProtectedRoute>} />
          <Route path="/admin/loans" element={<ProtectedRoute><ManageLoans /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  )
}
