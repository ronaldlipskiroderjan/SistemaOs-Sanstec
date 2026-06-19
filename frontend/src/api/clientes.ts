import { axiosClient } from './axiosClient'
import { Cliente } from '../types'

export interface ClientePayload {
  nome: string
  cpfCnpj?: string
  telefone?: string
  email?: string
  observacoes?: string
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

  deletar: (id: string): Promise<void> =>
    axiosClient.delete(`/api/clientes/${id}`).then(() => undefined),
}
