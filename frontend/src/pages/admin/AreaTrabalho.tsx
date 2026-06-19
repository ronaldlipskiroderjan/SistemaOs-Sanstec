import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { clientesApi } from '../../api/clientes'
import { ordensApi } from '../../api/ordens'
import { Cliente, OrdemServico, STATUS_OS_COLORS, STATUS_OS_LABELS, TIPO_EQUIPAMENTO_LABELS, TipoEquipamento } from '../../types'

function formatDate(iso?: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function AreaTrabalho() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [busca, setBusca] = useState('')
  const [debouncedBusca, setDebouncedBusca] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [vistaAtiva, setVistaAtiva] = useState<'clientes' | 'ordens'>('clientes')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusca(busca), 400)
    return () => clearTimeout(t)
  }, [busca])

  const { data: clientes, isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes', debouncedBusca],
    queryFn: () => clientesApi.listar(debouncedBusca),
  })

  const { data: ordens, isLoading: loadingOrdens } = useQuery({
    queryKey: ['ordens', 'cliente', clienteSelecionado?.id],
    queryFn: () => ordensApi.listar({ clienteId: clienteSelecionado!.id }),
    enabled: !!clienteSelecionado,
  })

  const mutacaoExcluir = useMutation({
    mutationFn: (id: string) => clientesApi.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      setClienteSelecionado(null)
      setVistaAtiva('clientes')
    },
    onError: (e: any) => alert(e?.response?.data?.message ?? 'Erro ao excluir cliente.'),
  })

  function confirmarExclusaoCliente(c: Cliente) {
    if (confirm(`Excluir permanentemente "${c.nome}"? Esta ação não pode ser desfeita.`)) {
      mutacaoExcluir.mutate(c.id)
    }
  }

  function selecionarCliente(c: Cliente) {
    setClienteSelecionado(c)
    setVistaAtiva('ordens')
  }

  return (
    <AdminLayout>
      <div className="flex gap-0 md:gap-6" style={{ height: 'calc(100vh - 9rem)' }}>

        {/* ── Painel esquerdo: clientes ─────────────────────── */}
        <div className={`${vistaAtiva === 'ordens' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 flex-col bg-white rounded-xl shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Clientes</h2>
            <button
              onClick={() => navigate('/admin/clientes/novo')}
              className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Novo
            </button>
          </div>

          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {loadingClientes && (
              <div className="p-6 text-center text-gray-400 text-sm">Carregando...</div>
            )}
            {!loadingClientes && !clientes?.length && (
              <div className="p-8 text-center text-gray-400 text-sm">
                {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
              </div>
            )}
            {clientes?.map((c: Cliente) => (
              <button
                key={c.id}
                onClick={() => selecionarCliente(c)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                  clienteSelecionado?.id === c.id
                    ? 'bg-orange-50 border-l-4 border-l-orange-500'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                <p className="font-medium text-gray-800 text-sm">{c.nome}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.telefone || c.email || '—'}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Painel direito: ordens do cliente ────────────── */}
        <div className={`${vistaAtiva === 'clientes' ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white rounded-xl shadow-sm overflow-hidden`}>

          {!clienteSelecionado ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <svg className="w-14 h-14 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-400 font-medium">Selecione um cliente</p>
              <p className="text-gray-300 text-sm mt-1">As ordens de serviço aparecerão aqui</p>
            </div>
          ) : (
            <>
              {/* Header do cliente selecionado */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setVistaAtiva('clientes')}
                    className="md:hidden text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    ←
                  </button>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{clienteSelecionado.nome}</h3>
                    <p className="text-xs text-gray-400">
                      {[clienteSelecionado.telefone, clienteSelecionado.email].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin/clientes/${clienteSelecionado.id}/editar`)}
                    className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => confirmarExclusaoCliente(clienteSelecionado)}
                    disabled={mutacaoExcluir.isPending}
                    className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Excluir
                  </button>
                  <button
                    onClick={() => navigate(`/admin/ordens/nova?clienteId=${clienteSelecionado.id}`)}
                    className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    + Nova OS
                  </button>
                </div>
              </div>

              {/* Lista de ordens */}
              <div className="overflow-y-auto flex-1 p-4">
                {loadingOrdens && (
                  <div className="text-center text-gray-400 text-sm py-12">Carregando ordens...</div>
                )}

                {!loadingOrdens && !ordens?.length && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-400 text-sm">Nenhuma OS para este cliente.</p>
                    <button
                      onClick={() => navigate(`/admin/ordens/nova?clienteId=${clienteSelecionado.id}`)}
                      className="mt-3 text-sm text-orange-500 hover:text-orange-700 font-medium"
                    >
                      Criar primeira OS →
                    </button>
                  </div>
                )}

                {!loadingOrdens && !!ordens?.length && (
                  <div className="space-y-3">
                    {ordens.map((o: OrdemServico) => (
                      <div
                        key={o.id}
                        onClick={() => navigate(`/admin/ordens/${o.id}`)}
                        className="border border-gray-200 rounded-xl p-4 hover:border-orange-200 hover:bg-orange-50/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-sm font-semibold text-gray-700">{o.numero}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_OS_COLORS[o.status]}`}>
                            {STATUS_OS_LABELS[o.status]}
                          </span>
                        </div>

                        {o.equipamentoTipo && (
                          <p className="text-sm text-gray-600">
                            {TIPO_EQUIPAMENTO_LABELS[o.equipamentoTipo as TipoEquipamento]}
                            {(o.equipamentoMarca || o.equipamentoModelo) && (
                              <span className="text-gray-400">
                                {' — '}{[o.equipamentoMarca, o.equipamentoModelo].filter(Boolean).join(' ')}
                              </span>
                            )}
                          </p>
                        )}

                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">{o.descricaoProblema}</p>

                        <div className="flex items-center justify-between mt-2.5">
                          <p className="text-xs text-gray-400">{formatDate(o.dataAbertura)}</p>
                          <span className="text-xs text-orange-500 font-medium">Ver detalhes →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}
