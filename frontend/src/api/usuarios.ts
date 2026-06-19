import { axiosClient } from './axiosClient'
import { Usuario, UsuarioResponse, UsuarioPayload, UsuarioUpdatePayload } from '../types'

export const usuariosApi = {
  tecnicos: (): Promise<Usuario[]> =>
    axiosClient.get('/api/usuarios/tecnicos').then(r => r.data),

  listar: (role?: string): Promise<UsuarioResponse[]> =>
    axiosClient.get('/api/usuarios', { params: role ? { role } : undefined }).then(r => r.data),

  criar: (data: UsuarioPayload): Promise<UsuarioResponse> =>
    axiosClient.post('/api/usuarios', data).then(r => r.data),

  atualizar: (id: string, data: UsuarioUpdatePayload): Promise<UsuarioResponse> =>
    axiosClient.put(`/api/usuarios/${id}`, data).then(r => r.data),

  toggleAtivo: (id: string): Promise<UsuarioResponse> =>
    axiosClient.patch(`/api/usuarios/${id}/ativo`).then(r => r.data),

  deletar: (id: string): Promise<void> =>
    axiosClient.delete(`/api/usuarios/${id}`).then(() => undefined),
}
