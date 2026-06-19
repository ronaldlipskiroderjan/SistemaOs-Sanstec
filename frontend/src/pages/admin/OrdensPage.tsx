import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { ordensApi } from '../../api/ordens'
import { OrdemServico, STATUS_OS_COLORS, STATUS_OS_LABELS, StatusOS, TIPO_EQUIPAMENTO_LABELS, TipoEquipamento } from '../../types'

const TABS: { label: string; value: string }[] = [
  { label: 'Todas', value: '' },
  { label: 'Abertas', value: 'ABERTA' },
  { label: 'Aprovadas', value: 'APROVADA' },
  { label: 'Não Aprovadas', value: 'NAO_APROVADA' },
  { label: 'Fechadas', value: 'FECHADA' },
]

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function OrdensPage() {
  const navigate = useNavigate()
  const [tabAtiva, setTabAtiva] = useState('')

  const { data: ordens, isLoading, isError } = useQuery({
    queryKey: ['ordens', tabAtiva],
    queryFn: () => ordensApi.listar(tabAtiva ? { status: tabAtiva } : undefined),
  })

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ordens de Serviço</h2>
        <button
          onClick={() => navigate('/admin/ordens/nova')}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          + Nova OS
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setTabAtiva(tab.value)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
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
        {isError && (
          <div className="p-10 text-center text-red-500 text-sm">Erro ao carregar ordens.</div>
        )}
        {!isLoading && !isError && !ordens?.length && (
          <div className="p-10 text-center text-gray-400 text-sm">
            {tabAtiva ? 'Nenhuma OS com este status.' : 'Nenhuma OS cadastrada ainda.'}
          </div>
        )}

        {!isLoading && !isError && !!ordens?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Número</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Equipamento</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Técnico</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Abertura</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordens.map((o: OrdemServico) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium text-gray-700">{o.numero}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{o.clienteNome}</span>
                      {o.clienteTelefone && (
                        <span className="block text-xs text-gray-400">{o.clienteTelefone}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {o.equipamentoTipo
                        ? TIPO_EQUIPAMENTO_LABELS[o.equipamentoTipo as TipoEquipamento]
                        : '—'}
                      {o.equipamentoMarca && (
                        <span className="block text-xs text-gray-400">{o.equipamentoMarca}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {o.tecnicoNome || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {formatDate(o.dataAbertura)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_OS_COLORS[o.status]}`}>
                        {STATUS_OS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/ordens/${o.id}`)}
                        className="text-orange-500 hover:text-orange-700 text-xs font-medium transition-colors"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
