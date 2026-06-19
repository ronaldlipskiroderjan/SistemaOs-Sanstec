import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { ordensApi, MudarStatusPayload } from '../../api/ordens'
import {
  STATUS_OS_COLORS, STATUS_OS_LABELS, STATUS_OS_LABELS as SL,
  PROXIMOS_STATUS, StatusOS, TIPO_EQUIPAMENTO_LABELS, TipoEquipamento,
} from '../../types'

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatCurrency(v?: number | null) {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function OrdemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [novoStatus, setNovoStatus] = useState<StatusOS | ''>('')
  const [observacao, setObservacao] = useState('')
  const [valorAprovacao, setValorAprovacao] = useState('')
  const [erroStatus, setErroStatus] = useState('')

  const { data: ordem, isLoading, isError } = useQuery({
    queryKey: ['ordem', id],
    queryFn: () => ordensApi.buscar(id!),
    enabled: !!id,
  })

  const mutacaoStatus = useMutation({
    mutationFn: (data: MudarStatusPayload) => ordensApi.mudarStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordens'] })
      queryClient.invalidateQueries({ queryKey: ['ordem', id] })
      setNovoStatus('')
      setObservacao('')
      setValorAprovacao('')
      setErroStatus('')
    },
    onError: (err: any) => {
      setErroStatus(err?.response?.data?.message ?? 'Erro ao mudar status.')
    },
  })

  if (isLoading) return <AdminLayout><div className="p-20 text-center text-gray-400 text-sm">Carregando...</div></AdminLayout>
  if (isError || !ordem) return <AdminLayout><div className="p-20 text-center text-red-500 text-sm">OS não encontrada.</div></AdminLayout>

  const proximosStatus = PROXIMOS_STATUS[ordem.status] ?? []

  return (
    <AdminLayout>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/ordens')} className="text-gray-400 hover:text-gray-600">
            ← Voltar
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 font-mono">{ordem.numero}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Aberta em {formatDate(ordem.dataAbertura)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_OS_COLORS[ordem.status]}`}>
            {STATUS_OS_LABELS[ordem.status]}
          </span>
          <button
            onClick={() => navigate(`/admin/ordens/${id}/editar`)}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-1 rounded-lg transition-colors"
          >
            Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dados do cliente e equipamento */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Cliente e Equipamento</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Cliente</p>
                <p className="font-medium text-gray-800">{ordem.clienteNome}</p>
                {ordem.clienteTelefone && <p className="text-gray-500">{ordem.clienteTelefone}</p>}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Equipamento</p>
                {ordem.equipamentoTipo ? (
                  <>
                    <p className="font-medium text-gray-800">
                      {TIPO_EQUIPAMENTO_LABELS[ordem.equipamentoTipo as TipoEquipamento]}
                    </p>
                    {(ordem.equipamentoMarca || ordem.equipamentoModelo) && (
                      <p className="text-gray-500">
                        {[ordem.equipamentoMarca, ordem.equipamentoModelo].filter(Boolean).join(' — ')}
                      </p>
                    )}
                  </>
                ) : <p className="text-gray-400">Não informado</p>}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Técnico</p>
                <p className="font-medium text-gray-800">{ordem.tecnicoNome ?? <span className="text-gray-400">Não atribuído</span>}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Agendamento</p>
                <p className="font-medium text-gray-800">{formatDate(ordem.dataAgendamento)}</p>
              </div>
              {ordem.servicoLogradouro && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 mb-1">Endereço de Serviço</p>
                  <p className="font-medium text-gray-800">
                    {ordem.servicoLogradouro}, {ordem.servicoNumero}
                    {ordem.servicoComplemento ? ` — ${ordem.servicoComplemento}` : ''}
                    {ordem.servicoBairro ? ` — ${ordem.servicoBairro}` : ''}
                    {ordem.servicoCidade ? `, ${ordem.servicoCidade}` : ''}
                    {ordem.servicoEstado ? `/${ordem.servicoEstado}` : ''}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Descrição e diagnóstico */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Problema e Diagnóstico</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Descrição do Problema</p>
                <p className="text-gray-800 whitespace-pre-wrap">{ordem.descricaoProblema}</p>
              </div>
              {ordem.diagnostico && (
                <div>
                  <p className="text-gray-500 mb-1">Diagnóstico</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{ordem.diagnostico}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-gray-500 mb-1">Orçamento</p>
                  <p className="font-semibold text-gray-800 text-base">{formatCurrency(ordem.valorOrcamento)}</p>
                </div>
                {ordem.dataFechamento && (
                  <div>
                    <p className="text-gray-500 mb-1">Data de Fechamento</p>
                    <p className="font-medium text-gray-800">{formatDate(ordem.dataFechamento)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Mudar Status */}
          {proximosStatus.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Mudar Status</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {proximosStatus.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNovoStatus(prev => prev === s ? '' : s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        novoStatus === s
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {SL[s]}
                    </button>
                  ))}
                </div>

                {novoStatus && (
                  <div className="space-y-3">
                    {novoStatus === 'APROVADA' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor do Orçamento (R$) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={valorAprovacao}
                          onChange={e => setValorAprovacao(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Ex: 250,00"
                        />
                      </div>
                    )}
                    <textarea
                      value={observacao}
                      onChange={e => setObservacao(e.target.value)}
                      rows={2}
                      placeholder="Observação (opcional)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                    {erroStatus && (
                      <p className="text-sm text-red-500">{erroStatus}</p>
                    )}
                    <button
                      onClick={() => {
                        if (novoStatus === 'APROVADA' && !valorAprovacao) {
                          setErroStatus('Informe o valor do orçamento para aprovar.')
                          return
                        }
                        setErroStatus('')
                        mutacaoStatus.mutate({
                          novoStatus,
                          observacao: observacao || undefined,
                          valorOrcamento: valorAprovacao ? parseFloat(valorAprovacao) : undefined,
                        })
                      }}
                      disabled={mutacaoStatus.isPending}
                      className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {mutacaoStatus.isPending ? 'Confirmando...' : `Confirmar: ${SL[novoStatus]}`}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Coluna lateral — histórico */}
        <div>
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Histórico</h3>
            {!ordem.historico.length ? (
              <p className="text-sm text-gray-400">Sem histórico.</p>
            ) : (
              <ol className="relative border-l border-gray-200 space-y-5 ml-2">
                {ordem.historico.map((h, i) => (
                  <li key={h.id} className="ml-4">
                    <span className={`absolute -left-1.5 w-3 h-3 rounded-full border-2 border-white ${
                      i === ordem.historico.length - 1 ? 'bg-orange-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="text-xs text-gray-400">{formatDate(h.criadoEm)}</p>
                      <p className="text-sm font-medium text-gray-700 mt-0.5">
                        {h.statusAnterior
                          ? <>{SL[h.statusAnterior]} → <span className={`font-semibold ${STATUS_OS_COLORS[h.statusNovo].replace('bg-', 'text-').split(' ')[0]}`}>{SL[h.statusNovo]}</span></>
                          : <span className="font-semibold text-orange-500">{SL[h.statusNovo]}</span>
                        }
                      </p>
                      {h.usuarioNome && <p className="text-xs text-gray-500 mt-0.5">por {h.usuarioNome}</p>}
                      {h.observacao && <p className="text-xs text-gray-500 italic mt-0.5">"{h.observacao}"</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
