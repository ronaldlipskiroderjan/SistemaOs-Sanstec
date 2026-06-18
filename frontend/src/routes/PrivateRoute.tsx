import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types'

interface Props {
  allowedRoles?: Role[]
}

export function PrivateRoute({ allowedRoles }: Props) {
  const { isAuthenticated, isLoading, usuario } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-sm">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && usuario && !allowedRoles.includes(usuario.role)) {
    return <Navigate to={usuario.role === 'ADMIN' ? '/admin' : '/tecnico'} replace />
  }

  return <Outlet />
}
