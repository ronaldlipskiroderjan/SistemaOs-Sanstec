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

export interface Cliente {
  id: string
  nome: string
  cpfCnpj?: string
  telefone?: string
  email?: string
  observacoes?: string
  criadoEm: string
}

// ── Usuários ─────────────────────────────────────────────────

export interface UsuarioResponse {
  id: string
  nome: string
  email: string
  role: Role
  telefone?: string
  ativo: boolean
  criadoEm: string
}

export interface UsuarioPayload {
  nome: string
  email: string
  senha: string
  role: Role
  telefone?: string
}

export interface UsuarioUpdatePayload {
  nome: string
  telefone?: string
  ativo?: boolean
}

// ── Ordens de Serviço ────────────────────────────────────────

export type StatusOS = 'ABERTA' | 'APROVADA' | 'NAO_APROVADA' | 'FECHADA'

export const STATUS_OS_LABELS: Record<StatusOS, string> = {
  ABERTA: 'Aberta',
  APROVADA: 'Aprovada',
  NAO_APROVADA: 'Não Aprovada',
  FECHADA: 'Fechada',
}

export const STATUS_OS_COLORS: Record<StatusOS, string> = {
  ABERTA: 'bg-orange-100 text-orange-600',
  APROVADA: 'bg-green-100 text-green-700',
  NAO_APROVADA: 'bg-red-100 text-red-700',
  FECHADA: 'bg-gray-100 text-gray-600',
}

export const PROXIMOS_STATUS: Partial<Record<StatusOS, StatusOS[]>> = {
  ABERTA: ['APROVADA', 'NAO_APROVADA'],
  APROVADA: ['FECHADA'],
}

export interface StatusHistorico {
  id: string
  statusAnterior?: StatusOS
  statusNovo: StatusOS
  usuarioId?: string
  usuarioNome?: string
  observacao?: string
  criadoEm: string
}

export interface OrdemServico {
  id: string
  numero: string
  clienteId: string
  clienteNome: string
  clienteTelefone?: string
  equipamentoTipo?: string
  equipamentoMarca?: string
  equipamentoModelo?: string
  tecnicoId?: string
  tecnicoNome?: string
  servicoLogradouro?: string
  servicoNumero?: string
  servicoComplemento?: string
  servicoBairro?: string
  servicoCidade?: string
  servicoEstado?: string
  servicoCep?: string
  servicoLatitude?: number
  servicoLongitude?: number
  descricaoProblema: string
  diagnostico?: string
  status: StatusOS
  valorOrcamento?: number
  dataAbertura: string
  dataAgendamento?: string
  dataFechamento?: string
  historico: StatusHistorico[]
}

// ── Dashboard ────────────────────────────────────────────────

export interface DashboardResumo {
  totalAbertas: number
  totalAprovadas: number
  totalNaoAprovadas: number
  totalFechadas: number
  recentes: OrdemServico[]
}
