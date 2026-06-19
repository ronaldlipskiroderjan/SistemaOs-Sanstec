import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { dashboardApi } from '../../api/dashboard'
import { STATUS_OS_COLORS, STATUS_OS_LABELS, StatusOS, TIPO_EQUIPAMENTO_LABELS, TipoEquipamento, OrdemServico } from '../../types'

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateLong(date: Date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
}

function MiniBarras({ valor, max, cor }: { valor: number; max: number; cor: string }) {
  const alturas = [0.4, 0.6, 0.5, 0.8, 0.65, 0.75, 1.0]
  const base = max > 0 ? valor / max : 0
  return (
    <div className="flex items-end gap-0.5 h-9">
      {alturas.map((h, i) => (
        <div
          key={i}
          className="w-2 rounded-t flex-shrink-0"
          style={{
            height: `${h * base * 100 + 15}%`,
            background: cor,
            opacity: i === alturas.length - 1 ? 1 : 0.3 + h * 0.5,
          }}
        />
      ))}
    </div>
  )
}

function RingGauge({ pct, cor }: { pct: number; cor: string }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke={cor} strokeWidth="9"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="48" y="52" textAnchor="middle" fill="#111827" fontSize="14" fontWeight="700">
        {pct}%
      </text>
    </svg>
  )
}

interface KPICardProps {
  label: string
  valor: number
  max: number
  cor: string
  corBarra: string
  icone: React.ReactNode
}

function KPICard({ label, valor, max, cor, corBarra, icone }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: cor + '20', color: cor }}>
          {icone}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-4xl font-bold text-gray-800">{valor}</p>
        <MiniBarras valor={valor} max={max} cor={corBarra} />
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.resumo,
    refetchInterval: 30000,
  })

  const total = (data?.totalAbertas ?? 0) + (data?.totalAprovadas ?? 0) + (data?.totalNaoAprovadas ?? 0) + (data?.totalFechadas ?? 0)
  const pctFechadas = total > 0 ? Math.round(((data?.totalFechadas ?? 0) / total) * 100) : 0
  const pctAndamento = total > 0 ? Math.round(((data?.totalAprovadas ?? 0) / total) * 100) : 0

  const STATUS_DIST = [
    { label: 'Abertas', valor: data?.totalAbertas ?? 0, cor: '#f97316', bg: '#fff7ed' },
    { label: 'Em Andamento', valor: data?.totalAprovadas ?? 0, cor: '#2ec4b6', bg: '#f0fdfa' },
    { label: 'Não Aprovadas', valor: data?.totalNaoAprovadas ?? 0, cor: '#ef4444', bg: '#fef2f2' },
    { label: 'Fechadas', valor: data?.totalFechadas ?? 0, cor: '#6b7280', bg: '#f9fafb' },
  ]

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5 capitalize">{formatDateLong(new Date())}</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Total de OS"
          valor={isLoading ? 0 : total}
          max={Math.max(total, 1)}
          cor="#2ec4b6"
          corBarra="#2ec4b6"
          icone={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <KPICard
          label="Abertas"
          valor={isLoading ? 0 : (data?.totalAbertas ?? 0)}
          max={Math.max(total, 1)}
          cor="#f97316"
          corBarra="#f97316"
          icone={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          label="Em Andamento"
          valor={isLoading ? 0 : (data?.totalAprovadas ?? 0)}
          max={Math.max(total, 1)}
          cor="#f59e0b"
          corBarra="#f59e0b"
          icone={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <KPICard
          label="Fechadas"
          valor={isLoading ? 0 : (data?.totalFechadas ?? 0)}
          max={Math.max(total, 1)}
          cor="#10b981"
          corBarra="#10b981"
          icone={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ── Linha do meio ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Taxa de Conclusão */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-700">Taxa de Conclusão</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <RingGauge pct={pctFechadas} cor="#10b981" />
              <p className="text-xs text-gray-400 mt-1">Fechadas</p>
            </div>
            <div className="text-center">
              <RingGauge pct={pctAndamento} cor="#2ec4b6" />
              <p className="text-xs text-gray-400 mt-1">Andamento</p>
            </div>
          </div>
        </div>

        {/* Distribuição por status */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Distribuição por Status</p>
          {isLoading ? (
            <div className="text-gray-400 text-sm text-center py-6">Carregando...</div>
          ) : (
            <div className="space-y-3">
              {STATUS_DIST.map(s => {
                const pct = total > 0 ? Math.round((s.valor / total) * 100) : 0
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.cor }} />
                        <span className="text-sm text-gray-600">{s.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-800">{s.valor}</span>
                        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: s.cor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── OS Recentes ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-700">OS Recentes</p>
          <button
            onClick={() => navigate('/admin/trabalho')}
            className="text-sm font-medium transition-colors"
            style={{ color: '#2ec4b6' }}
          >
            Ver todas →
          </button>
        </div>

        {isLoading && (
          <div className="p-10 text-center text-gray-400 text-sm">Carregando...</div>
        )}

        {!isLoading && !data?.recentes?.length && (
          <div className="p-10 text-center">
            <p className="text-gray-400 text-sm">Nenhuma OS cadastrada.</p>
            <button
              onClick={() => navigate('/admin/ordens/nova')}
              className="mt-2 text-sm font-medium"
              style={{ color: '#2ec4b6' }}
            >
              Criar primeira OS →
            </button>
          </div>
        )}

        {!isLoading && !!data?.recentes?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide" style={{ background: '#f8fffe' }}>
                  <th className="px-5 py-3 text-left font-semibold">Número</th>
                  <th className="px-5 py-3 text-left font-semibold">Cliente</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Equipamento</th>
                  <th className="px-5 py-3 text-left font-semibold hidden lg:table-cell">Técnico</th>
                  <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Abertura</th>
                  <th className="px-5 py-3 text-center font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentes.map((o: OrdemServico) => (
                  <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-gray-700">{o.numero}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{o.clienteNome}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                      {o.equipamentoTipo || o.equipamentoMarca || o.equipamentoModelo ? (
                        <span>
                          {o.equipamentoTipo ? TIPO_EQUIPAMENTO_LABELS[o.equipamentoTipo as TipoEquipamento] : ''}
                          {(o.equipamentoMarca || o.equipamentoModelo) && (
                            <span className="text-gray-400 text-xs block">
                              {[o.equipamentoMarca, o.equipamentoModelo].filter(Boolean).join(' ')}
                            </span>
                          )}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell">
                      {o.tecnicoNome || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 hidden sm:table-cell">
                      {formatDate(o.dataAbertura)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_OS_COLORS[o.status as StatusOS]}`}>
                        {STATUS_OS_LABELS[o.status as StatusOS]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/admin/ordens/${o.id}`)}
                        className="text-xs font-semibold transition-colors"
                        style={{ color: '#2ec4b6' }}
                      >
                        Ver →
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
