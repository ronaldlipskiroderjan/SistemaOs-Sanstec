export type Role = 'ADMIN' | 'TECNICO'

export interface Usuario {
  id: string
  nome: string
  email: string
  role: Role
  telefone?: string
}

export interface AuthState {
  token: string | null
  usuario: Usuario | null
  isLoading: boolean
}
