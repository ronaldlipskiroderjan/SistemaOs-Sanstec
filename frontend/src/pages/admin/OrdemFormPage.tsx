import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { ordensApi, OrdemServicoPayload, OrdemServicoUpdatePayload } from '../../api/ordens'
import { clientesApi } from '../../api/clientes'
import { usuariosApi } from '../../api/usuarios'
import { Cliente, TIPO_EQUIPAMENTO_LABELS, TipoEquipamento } from '../../types'

const TIPOS_EQUIPAMENTO = Object.entries(TIPO_EQUIPAMENTO_LABELS) as [TipoEquipamento, string][]

function mascararCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

function mascararData(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

function brParaIso(br: string) {
  const p = br.split('/')
  if (p.length === 3 && p[0].length === 2 && p[1].length === 2 && p[2].length === 4) {
    return `${p[2]}-${p[1]}-${p[0]}`
  }
  return ''
}

function isoParaBr(iso: string) {
  if (!iso || iso.length < 10) return ''
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
}

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

interface EquipForm {
  tipo: string
  marca: string
  modelo: string
}

interface EndForm {
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

const equipVazio: EquipForm = { tipo: '', marca: '', modelo: '' }
const endVazio: EndForm = { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'PR', cep: '' }

export function OrdemFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const clienteIdParam = searchParams.get('clienteId')
  const voltarParaTrabalho = !!clienteIdParam

  const [clienteId, setClienteId] = useState(clienteIdParam ?? '')
  const [tecnicoId, setTecnicoId] = useState('')
  const [equip, setEquip] = useState<EquipForm>(equipVazio)
  const [end, setEnd] = useState<EndForm>(endVazio)
  const [descricaoProblema, setDescricaoProblema] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [valorOrcamento, setValorOrcamento] = useState('')
  const [dataAgendamento, setDataAgendamento] = useState('')
  const [dataTexto, setDataTexto] = useState('')
  const [erro, setErro] = useState('')
  const [buscandoCep, setBuscandoCep] = useState(false)

  const { data: clientes } = useQuery({
    queryKey: ['clientes', ''],
    queryFn: () => clientesApi.listar(),
  })

  const { data: tecnicos } = useQuery({
    queryKey: ['tecnicos'],
    queryFn: usuariosApi.tecnicos,
  })

  const { data: ordem, isLoading: loadingOrdem } = useQuery({
    queryKey: ['ordem', id],
    queryFn: () => ordensApi.buscar(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!ordem) return
    setClienteId(ordem.clienteId)
    setTecnicoId(ordem.tecnicoId ?? '')
    setEquip({
      tipo: ordem.equipamentoTipo ?? '',
      marca: ordem.equipamentoMarca ?? '',
      modelo: ordem.equipamentoModelo ?? '',
    })
    setEnd({
      logradouro: ordem.servicoLogradouro ?? '',
      numero: ordem.servicoNumero ?? '',
      complemento: ordem.servicoComplemento ?? '',
      bairro: ordem.servicoBairro ?? '',
      cidade: ordem.servicoCidade ?? '',
      estado: ordem.servicoEstado ?? '',
      cep: ordem.servicoCep ?? '',
    })
    setDescricaoProblema(ordem.descricaoProblema)
    setDiagnostico(ordem.diagnostico ?? '')
    setValorOrcamento(ordem.valorOrcamento?.toString() ?? '')
    const isoData = ordem.dataAgendamento
      ? new Date(ordem.dataAgendamento).toISOString().slice(0, 16)
      : ''
    setDataAgendamento(isoData)
    setDataTexto(isoParaBr(isoData.slice(0, 10)))
  }, [ordem])

  const mutacaoCriar = useMutation({
    mutationFn: (data: OrdemServicoPayload) => ordensApi.criar(data),
    onSuccess: (novaOrdem) => {
      queryClient.invalidateQueries({ queryKey: ['ordens'] })
      queryClient.invalidateQueries({ queryKey: ['ordens', 'cliente', clienteIdParam] })
      navigate(`/admin/ordens/${novaOrdem.id}`)
    },
    onError: () => setErro('Erro ao criar OS. Verifique os dados.'),
  })

  const mutacaoAtualizar = useMutation({
    mutationFn: (data: OrdemServicoUpdatePayload) => ordensApi.atualizar(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordens'] })
      queryClient.invalidateQueries({ queryKey: ['ordem', id] })
      navigate(`/admin/ordens/${id}`)
    },
    onError: () => setErro('Erro ao atualizar OS.'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!clienteId && !isEdit) { setErro('Selecione um cliente.'); return }

    const equipPayload = {
      equipamentoTipo: equip.tipo || undefined,
      equipamentoMarca: equip.marca || undefined,
      equipamentoModelo: equip.modelo || undefined,
    }
    const endPayload = {
      servicoLogradouro: end.logradouro || undefined,
      servicoNumero: end.numero || undefined,
      servicoComplemento: end.complemento || undefined,
      servicoBairro: end.bairro || undefined,
      servicoCidade: end.cidade || undefined,
      servicoEstado: end.estado || undefined,
      servicoCep: end.cep || undefined,
    }

    if (isEdit) {
      mutacaoAtualizar.mutate({
        tecnicoId: tecnicoId || undefined,
        ...equipPayload,
        ...endPayload,
        descricaoProblema,
        diagnostico: diagnostico || undefined,
        valorOrcamento: valorOrcamento ? parseFloat(valorOrcamento) : undefined,
        dataAgendamento: dataAgendamento || undefined,
      })
    } else {
      mutacaoCriar.mutate({
        clienteId,
        tecnicoId: tecnicoId || undefined,
        ...equipPayload,
        ...endPayload,
        descricaoProblema,
        valorOrcamento: valorOrcamento ? parseFloat(valorOrcamento) : undefined,
        dataAgendamento: dataAgendamento || undefined,
      })
    }
  }

  async function buscarCep(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setBuscandoCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setEnd(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }))
      }
    } catch {
      // silencia erro de rede
    } finally {
      setBuscandoCep(false)
    }
  }

  function setE(field: keyof EquipForm, value: string) {
    setEquip(prev => ({ ...prev, [field]: value }))
  }
  function setA(field: keyof EndForm, value: string) {
    setEnd(prev => ({ ...prev, [field]: value }))
  }

  const salvando = mutacaoCriar.isPending || mutacaoAtualizar.isPending

  if (isEdit && loadingOrdem) {
    return <AdminLayout><div className="p-20 text-center text-gray-400 text-sm">Carregando...</div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(voltarParaTrabalho ? '/admin/trabalho' : '/admin/ordens')}
          className="text-gray-400 hover:text-gray-600"
        >
          ← Voltar
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? `Editar OS ${ordem?.numero ?? ''}` : 'Nova Ordem de Serviço'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Dados gerais ─────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Dados da OS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {!isEdit && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                {clienteIdParam ? (
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                    {clientes?.find((c: Cliente) => c.id === clienteIdParam)?.nome ?? 'Carregando...'}
                  </div>
                ) : (
                  <select
                    value={clienteId}
                    onChange={e => setClienteId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clientes?.map((c: Cliente) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
              <select
                value={tecnicoId}
                onChange={e => setTecnicoId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Sem técnico atribuído</option>
                {tecnicos?.map((t: { id: string; nome: string }) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Agendamento</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  value={dataTexto}
                  onChange={e => {
                    const masked = mascararData(e.target.value)
                    setDataTexto(masked)
                    const iso = brParaIso(masked)
                    if (iso) setDataAgendamento(iso + 'T' + (dataAgendamento.slice(11, 16) || '08:00'))
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="time"
                  value={dataAgendamento.slice(11, 16)}
                  onChange={e => setDataAgendamento((brParaIso(dataTexto) || new Date().toISOString().slice(0, 10)) + 'T' + e.target.value)}
                  className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {isEdit && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                <textarea
                  value={diagnostico}
                  onChange={e => setDiagnostico(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Diagnóstico técnico após inspeção"
                />
              </div>
            )}

            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Orçamento (R$)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={valorOrcamento}
                  onChange={e => setValorOrcamento(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0,00"
                />
              </div>
            )}

          </div>
        </section>

        {/* ── Equipamento ──────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Equipamento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={equip.tipo}
                onChange={e => setE('tipo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Selecionar tipo...</option>
                {TIPOS_EQUIPAMENTO.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input
                value={equip.marca}
                onChange={e => setE('marca', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Samsung, LG, Brastemp..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                value={equip.modelo}
                onChange={e => setE('modelo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="WF5000, BRM50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Problema
              </label>
              <textarea
                value={descricaoProblema}
                onChange={e => setDescricaoProblema(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Descreva o problema relatado pelo cliente"
              />
            </div>
          </div>
        </section>

        {/* ── Endereço do Serviço ───────────────────────────── */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Endereço do Serviço</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
              <input
                value={end.logradouro}
                onChange={e => setA('logradouro', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Rua, Avenida..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                value={end.numero}
                onChange={e => setA('numero', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                value={end.complemento}
                onChange={e => setA('complemento', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Apto, Casa..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input
                value={end.bairro}
                onChange={e => setA('bairro', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                value={end.cidade}
                onChange={e => setA('cidade', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                <select
                  value={end.estado}
                  onChange={e => setA('estado', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">--</option>
                  {ESTADOS_BR.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                  {buscandoCep && <span className="ml-2 text-xs text-gray-400">Buscando...</span>}
                </label>
                <input
                  value={end.cep}
                  onChange={e => {
                    const masked = mascararCep(e.target.value)
                    setA('cep', masked)
                    buscarCep(masked)
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>
        </section>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">{erro}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar OS'}
          </button>
          <button
            type="button"
            onClick={() => navigate(voltarParaTrabalho ? '/admin/trabalho' : '/admin/ordens')}
            className="px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
