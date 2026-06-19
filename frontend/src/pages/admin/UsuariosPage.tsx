import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { usuariosApi } from '../../api/usuarios'
import { UsuarioResponse, UsuarioPayload, Role } from '../../types'
import { useAuth } from '../../hooks/useAuth'

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  TECNICO: 'Técnico',
}

const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-orange-100 text-orange-600',
  TECNICO: 'bg-green-100 text-green-700',
}

interface ModalState {
  aberto: boolean
  usuario?: UsuarioResponse
}

function UsuarioModal({ estado, onFechar }: { estado: ModalState; onFechar: () => void }) {
  const queryClient = useQueryClient()
  const [nome, setNome] = useState(estado.usuario?.nome ?? '')
  const [email, setEmail] = useState(estado.usuario?.email ?? '')
  const [senha, setSenha] = useState('')
  const [role, setRole] = useState<Role>(estado.usuario?.role ?? 'TECNICO')
  const [telefone, setTelefone] = useState(estado.usuario?.telefone ?? '')
  const [erro, setErro] = useState('')

  const isEdit = !!estado.usuario

  const mutacaoCriar = useMutation({
    mutationFn: (data: UsuarioPayload) => usuariosApi.criar(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['usuarios'] }); onFechar() },
    onError: (e: any) => setErro(e?.response?.data?.erro ?? 'Erro ao criar usuário.'),
  })

  const mutacaoAtualizar = useMutation({
    mutationFn: (data: { nome: string; telefone?: string }) =>
      usuariosApi.atualizar(estado.usuario!.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['usuarios'] }); onFechar() },
    onError: () => setErro('Erro ao atualizar usuário.'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) { setErro('Nome é obrigatório.'); return }
    if (!isEdit && !email.trim()) { setErro('E-mail é obrigatório.'); return }
    if (!isEdit && senha.length < 6) { setErro('Senha deve ter pelo menos 6 caracteres.'); return }

    if (isEdit) {
      mutacaoAtualizar.mutate({ nome, telefone: telefone || undefined })
    } else {
      mutacaoCriar.mutate({ nome, email, senha, role, telefone: telefone || undefined })
    }
  }

  const salvando = mutacaoCriar.isPending || mutacaoAtualizar.isPending

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nome completo"
            />
          </div>

          {!isEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="TECNICO">Técnico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">{erro}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={onFechar}
              className="px-5 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function UsuariosPage() {
  const queryClient = useQueryClient()
  const { usuario: usuarioLogado } = useAuth()
  const [modal, setModal] = useState<ModalState>({ aberto: false })
  const [tabAtiva, setTabAtiva] = useState<'TODOS' | Role>('TODOS')

  const { data: usuariosRaw, isLoading } = useQuery({
    queryKey: ['usuarios', tabAtiva],
    queryFn: () => usuariosApi.listar(tabAtiva === 'TODOS' ? undefined : tabAtiva),
  })

  const usuarios = usuariosRaw?.filter((u: UsuarioResponse) => u.id !== usuarioLogado?.id)

  const mutacaoToggle = useMutation({
    mutationFn: (id: string) => usuariosApi.toggleAtivo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  })

  const mutacaoExcluir = useMutation({
    mutationFn: (id: string) => usuariosApi.deletar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
    onError: (e: any) => alert(e?.response?.data?.message ?? 'Erro ao excluir usuário.'),
  })

  function confirmarExclusao(u: UsuarioResponse) {
    if (confirm(`Excluir permanentemente "${u.nome}"? Esta ação não pode ser desfeita.`)) {
      mutacaoExcluir.mutate(u.id)
    }
  }

  const TABS = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'ADMIN', label: 'Administradores' },
    { value: 'TECNICO', label: 'Técnicos' },
  ] as const

  return (
    <AdminLayout>
      {modal.aberto && (
        <UsuarioModal estado={modal} onFechar={() => setModal({ aberto: false })} />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Usuários</h2>
        <button
          onClick={() => setModal({ aberto: true })}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          + Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setTabAtiva(tab.value as typeof tabAtiva)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tabAtiva === tab.value
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="p-10 text-center text-gray-400 text-sm">Carregando...</div>
        )}

        {!isLoading && !usuarios?.length && (
          <div className="p-10 text-center text-gray-400 text-sm">Nenhum usuário encontrado.</div>
        )}

        {!isLoading && !!usuarios?.length && (
          <div className="divide-y divide-gray-100">
            {usuarios.map((u: UsuarioResponse) => (
              <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{u.nome}</p>
                    <p className="text-sm text-gray-500 truncate">{u.email}</p>
                    {u.telefone && <p className="text-xs text-gray-400">{u.telefone}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    u.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <button
                    onClick={() => setModal({ aberto: true, usuario: u })}
                    className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => mutacaoToggle.mutate(u.id)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      u.ativo
                        ? 'border-orange-200 text-orange-500 hover:bg-orange-50'
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {u.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => confirmarExclusao(u)}
                    disabled={mutacaoExcluir.isPending}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
