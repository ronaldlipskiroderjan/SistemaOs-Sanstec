import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/Login'
import { AdminDashboard } from '../pages/admin/Dashboard'
import { TecnicoDashboard } from '../pages/tecnico/Dashboard'
import { useAuth } from '../hooks/useAuth'

function RootRedirect() {
  const { isAuthenticated, isLoading, usuario } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={usuario?.role === 'ADMIN' ? '/admin' : '/tecnico'} replace />
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['TECNICO']} />}>
            <Route path="/tecnico" element={<TecnicoDashboard />} />
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
