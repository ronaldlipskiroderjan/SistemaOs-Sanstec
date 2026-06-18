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

export type TipoEquipamento = 'MAQUINA_LAVAR' | 'GELADEIRA' | 'SECADORA' | 'LAVA_LOUCA' | 'OUTRO'

export const TIPO_EQUIPAMENTO_LABELS: Record<TipoEquipamento, string> = {
  MAQUINA_LAVAR: 'Máquina de Lavar',
  GELADEIRA: 'Geladeira',
  SECADORA: 'Secadora',
  LAVA_LOUCA: 'Lava-Louça',
  OUTRO: 'Outro',
}

export interface Endereco {
  id?: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  latitude?: number
  longitude?: number
}

export interface Equipamento {
  id: string
  tipo: TipoEquipamento
  marca?: string
  modelo?: string
  numeroSerie?: string
}

export interface Cliente {
  id: string
  nome: string
  cpfCnpj?: string
  telefone?: string
  email?: string
  endereco?: Endereco
  observacoes?: string
  criadoEm: string
  equipamentos: Equipamento[]
}
