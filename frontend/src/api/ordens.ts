import { axiosClient } from './axiosClient'
import { OrdemServico } from '../types'

export interface OrdemServicoPayload {
  clienteId: string
  tecnicoId?: string
  equipamentoTipo?: string
  equipamentoMarca?: string
  equipamentoModelo?: string
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
  valorOrcamento?: number
  dataAgendamento?: string
}

export interface OrdemServicoUpdatePayload {
  tecnicoId?: string
  equipamentoTipo?: string
  equipamentoMarca?: string
  equipamentoModelo?: string
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
  valorOrcamento?: number
  dataAgendamento?: string
}

export interface MudarStatusPayload {
  novoStatus: string
  observacao?: string
  valorOrcamento?: number
}

export const ordensApi = {
  listar: (params?: { status?: string; clienteId?: string; tecnicoId?: string }): Promise<OrdemServico[]> =>
    axiosClient.get('/api/ordens', { params }).then(r => r.data),

  buscar: (id: string): Promise<OrdemServico> =>
    axiosClient.get(`/api/ordens/${id}`).then(r => r.data),

  criar: (data: OrdemServicoPayload): Promise<OrdemServico> =>
    axiosClient.post('/api/ordens', data).then(r => r.data),

  atualizar: (id: string, data: OrdemServicoUpdatePayload): Promise<OrdemServico> =>
    axiosClient.put(`/api/ordens/${id}`, data).then(r => r.data),

  mudarStatus: (id: string, data: MudarStatusPayload): Promise<OrdemServico> =>
    axiosClient.post(`/api/ordens/${id}/status`, data).then(r => r.data),

  minhas: (): Promise<OrdemServico[]> =>
    axiosClient.get('/api/ordens/minhas').then(r => r.data),
}
