import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/Login'
import { AdminDashboard } from '../pages/admin/Dashboard'
import { AreaTrabalho } from '../pages/admin/AreaTrabalho'
import { ClienteFormPage } from '../pages/admin/ClienteFormPage'
import { OrdemFormPage } from '../pages/admin/OrdemFormPage'
import { OrdemDetailPage } from '../pages/admin/OrdemDetailPage'
import { UsuariosPage } from '../pages/admin/UsuariosPage'
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
            <Route path="/admin/trabalho" element={<AreaTrabalho />} />
            <Route path="/admin/clientes/novo" element={<ClienteFormPage />} />
            <Route path="/admin/clientes/:id/editar" element={<ClienteFormPage />} />
            <Route path="/admin/ordens/nova" element={<OrdemFormPage />} />
            <Route path="/admin/ordens/:id" element={<OrdemDetailPage />} />
            <Route path="/admin/ordens/:id/editar" element={<OrdemFormPage />} />
            <Route path="/admin/usuarios" element={<UsuariosPage />} />
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
