import axiosClient from './axiosClient'
import { Cliente, Equipamento } from '../types'

export interface ClientePayload {
  nome: string
  cpfCnpj?: string
  telefone?: string
  email?: string
  endereco?: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  observacoes?: string
}

export interface EquipamentoPayload {
  tipo: string
  marca?: string
  modelo?: string
  numeroSerie?: string
}

export const clientesApi = {
  listar: (busca?: string): Promise<Cliente[]> =>
    axiosClient.get('/api/clientes', { params: { busca } }).then(r => r.data),

  buscar: (id: string): Promise<Cliente> =>
    axiosClient.get(`/api/clientes/${id}`).then(r => r.data),

  criar: (data: ClientePayload): Promise<Cliente> =>
    axiosClient.post('/api/clientes', data).then(r => r.data),

  atualizar: (id: string, data: ClientePayload): Promise<Cliente> =>
    axiosClient.put(`/api/clientes/${id}`, data).then(r => r.data),

  adicionarEquipamento: (clienteId: string, data: EquipamentoPayload): Promise<Equipamento> =>
    axiosClient.post(`/api/clientes/${clienteId}/equipamentos`, data).then(r => r.data),
}
