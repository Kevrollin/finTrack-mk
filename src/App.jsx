import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Transactions from './pages/Transactions'
import Admin from './pages/Admin'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import AppShell from './components/AppShell'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/terms" element={<PublicRoute><Terms /></PublicRoute>} />
        <Route path="/privacy" element={<PublicRoute><Privacy /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
