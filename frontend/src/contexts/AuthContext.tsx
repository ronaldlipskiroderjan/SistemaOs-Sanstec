import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Usuario } from '../types'
import { axiosClient } from '../api/axiosClient'

interface AuthContextType {
  token: string | null
  usuario: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, usuario: Usuario) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      setIsLoading(false)
      return
    }
    axiosClient.get<Usuario>('/api/auth/me')
      .then(res => setUsuario(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = (newToken: string, newUsuario: Usuario) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUsuario(newUsuario)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{
      token,
      usuario,
      isLoading,
      isAuthenticated: !!token && !!usuario,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
