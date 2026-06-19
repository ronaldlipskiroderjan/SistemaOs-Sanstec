import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { ordensApi } from '../../api/ordens'
import { OSBottomSheet } from '../../components/OSBottomSheet'
import { MapaServico } from '../../components/MapaServico'
import {
  OrdemServico, STATUS_OS_COLORS, STATUS_OS_LABELS,
  TIPO_EQUIPAMENTO_LABELS, TipoEquipamento,
} from '../../types'

function formatDate(iso?: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function OSCard({ ordem, onClick }: { ordem: OrdemServico; onClick: () => void }) {
  const agendamento = formatDate(ordem.dataAgendamento)
  const temEndereco = !!ordem.servicoLogradouro

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all">
      {/* Parte clicável — abre o bottom sheet */}
      <button
        onClick={onClick}
        className="w-full text-left p-4 active:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="font-mono text-sm font-semibold text-gray-700">{ordem.numero}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_OS_COLORS[ordem.status]}`}>
            {STATUS_OS_LABELS[ordem.status]}
          </span>
        </div>

        <p className="font-semibold text-gray-800 text-base mb-0.5">{ordem.clienteNome}</p>

        {ordem.equipamentoTipo && (
          <p className="text-sm text-gray-500 mb-0.5">
            {TIPO_EQUIPAMENTO_LABELS[ordem.equipamentoTipo as TipoEquipamento]}
            {(ordem.equipamentoMarca || ordem.equipamentoModelo) && (
              <span className="text-gray-400">
                {' — '}{[ordem.equipamentoMarca, ordem.equipamentoModelo].filter(Boolean).join(' ')}
              </span>
            )}
          </p>
        )}

        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{ordem.descricaoProblema}</p>

        {agendamento && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Agendado: {agendamento}</span>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">Toque para ver detalhes →</p>
      </button>

      {temEndereco && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100">
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
        </div>
      )}
    </div>
  )
}

export function TecnicoDashboard() {
  const { usuario, logout } = useAuth()
  const [ordemAberta, setOrdemAberta] = useState<OrdemServico | null>(null)

  const { data: ordens, isLoading, isError, refetch } = useQuery({
    queryKey: ['minhasOrdens'],
    queryFn: ordensApi.minhas,
    refetchInterval: 60000,
  })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Bottom Sheet */}
      {ordemAberta && (
        <OSBottomSheet
          ordem={ordemAberta}
          onFechar={() => setOrdemAberta(null)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Minhas OS</h1>
            {!isLoading && ordens && (
              <p className="text-xs text-gray-400">{ordens.length} ordem{ordens.length !== 1 ? 's' : ''} ativa{ordens.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{usuario?.nome}</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              Técnico
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Lista de OS */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-red-500 text-sm mb-3">Erro ao carregar suas ordens.</p>
            <button
              onClick={() => refetch()}
              className="text-sm text-orange-500 hover:text-orange-700 font-medium"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoading && !isError && !ordens?.length && (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 font-medium">Nenhuma OS atribuída</p>
            <p className="text-gray-400 text-sm mt-1">Suas ordens ativas aparecerão aqui.</p>
          </div>
        )}

        {!isLoading && !isError && !!ordens?.length && (
          <div className="flex flex-col gap-3">
            {ordens.map((o: OrdemServico) => (
              <OSCard key={o.id} ordem={o} onClick={() => setOrdemAberta(o)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
