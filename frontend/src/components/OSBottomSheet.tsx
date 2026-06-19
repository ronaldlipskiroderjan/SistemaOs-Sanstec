import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordensApi, MudarStatusPayload } from '../api/ordens'
import {
  OrdemServico, STATUS_OS_COLORS, STATUS_OS_LABELS, StatusOS,
  PROXIMOS_STATUS, TIPO_EQUIPAMENTO_LABELS, TipoEquipamento,
} from '../types'
import { MapaServico } from './MapaServico'
import { useState } from 'react'

interface Props {
  ordem: OrdemServico
  onFechar: () => void
}

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

export function OSBottomSheet({ ordem, onFechar }: Props) {
  const queryClient = useQueryClient()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [novoStatus, setNovoStatus] = useState<StatusOS | ''>('')
  const [observacao, setObservacao] = useState('')
  const [valorAprovacao, setValorAprovacao] = useState('')
  const [erroStatus, setErroStatus] = useState('')

  const proximosStatus = PROXIMOS_STATUS[ordem.status] ?? []

  // fecha ao clicar fora
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onFechar])

  const mutacaoStatus = useMutation({
    mutationFn: (data: MudarStatusPayload) => ordensApi.mudarStatus(ordem.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minhasOrdens'] })
      setNovoStatus('')
      setObservacao('')
      setValorAprovacao('')
      setErroStatus('')
      onFechar()
    },
    onError: (e: any) => setErroStatus(e?.response?.data?.message ?? 'Erro ao mudar status.'),
  })

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === overlayRef.current) onFechar() }}
    >
      {/* Fundo escuro */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col">

        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-mono font-bold text-gray-800 text-lg">{ordem.numero}</p>
            <p className="text-xs text-gray-500 mt-0.5">Aberta em {formatDate(ordem.dataAbertura)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_OS_COLORS[ordem.status]}`}>
              {STATUS_OS_LABELS[ordem.status]}
            </span>
            <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-1">×</button>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Cliente */}
          <section>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cliente</h4>
            <p className="font-semibold text-gray-800">{ordem.clienteNome}</p>
            {ordem.clienteTelefone && (
              <div className="flex gap-2 mt-2">
                <a
                  href={`tel:${ordem.clienteTelefone}`}
                  className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Ligar
                </a>
                <a
                  href={`https://wa.me/55${ordem.clienteTelefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.533 5.855L.057 23.18l5.46-1.431A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.742-.524-5.288-1.437l-.379-.224-3.934 1.031 1.049-3.831-.247-.394A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            )}
          </section>

          {/* Equipamento */}
          {ordem.equipamentoTipo && (
            <section>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Equipamento</h4>
              <p className="font-medium text-gray-700">
                {TIPO_EQUIPAMENTO_LABELS[ordem.equipamentoTipo as TipoEquipamento]}
              </p>
              {(ordem.equipamentoMarca || ordem.equipamentoModelo) && (
                <p className="text-sm text-gray-500">
                  {[ordem.equipamentoMarca, ordem.equipamentoModelo].filter(Boolean).join(' — ')}
                </p>
              )}
            </section>
          )}

          {/* Problema e diagnóstico */}
          <section>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Problema</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ordem.descricaoProblema}</p>
            {ordem.diagnostico && (
              <>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-3 mb-2">Diagnóstico</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ordem.diagnostico}</p>
              </>
            )}
          </section>

          {/* Valores */}
          {ordem.valorOrcamento != null && (
            <section className="flex gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Orçamento</p>
                <p className="font-semibold text-gray-800">{formatCurrency(ordem.valorOrcamento)}</p>
              </div>
            </section>
          )}

          {/* Agendamento */}
          {ordem.dataAgendamento && (
            <section>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Agendamento</h4>
              <p className="text-sm text-gray-700">{formatDate(ordem.dataAgendamento)}</p>
            </section>
          )}

          {/* Mapa */}
          {ordem.servicoLogradouro && (
            <section>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Local de Atendimento</h4>
              <MapaServico
                lat={ordem.servicoLatitude}
                lng={ordem.servicoLongitude}
                logradouro={ordem.servicoLogradouro}
                numero={ordem.servicoNumero}
                bairro={ordem.servicoBairro}
                cidade={ordem.servicoCidade}
                estado={ordem.servicoEstado}
                cep={ordem.servicoCep}
              />
            </section>
          )}

          {/* Mudar Status */}
          {proximosStatus.length > 0 && (
            <section className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Atualizar Status</h4>
              <div className="flex flex-wrap gap-2 mb-3">
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
                    {STATUS_OS_LABELS[s]}
                  </button>
                ))}
              </div>
              {novoStatus && (
                <div className="space-y-2">
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
                  {erroStatus && <p className="text-sm text-red-500">{erroStatus}</p>}
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
                    className="w-full bg-orange-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {mutacaoStatus.isPending ? 'Confirmando...' : `Confirmar: ${STATUS_OS_LABELS[novoStatus]}`}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
