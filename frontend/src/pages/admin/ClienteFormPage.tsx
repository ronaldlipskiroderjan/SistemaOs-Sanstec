import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { clientesApi, ClientePayload, EquipamentoPayload } from '../../api/clientes'
import { Equipamento, TIPO_EQUIPAMENTO_LABELS, TipoEquipamento } from '../../types'

const TIPOS_EQUIPAMENTO = Object.entries(TIPO_EQUIPAMENTO_LABELS) as [TipoEquipamento, string][]

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

interface FormState {
  nome: string
  cpfCnpj: string
  telefone: string
  email: string
  observacoes: string
  temEndereco: boolean
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

const formVazio: FormState = {
  nome: '', cpfCnpj: '', telefone: '', email: '', observacoes: '',
  temEndereco: false,
  logradouro: '', numero: '', complemento: '', bairro: '',
  cidade: '', estado: '', cep: '',
}

interface EquipForm {
  tipo: TipoEquipamento
  marca: string
  modelo: string
  numeroSerie: string
}

export function ClienteFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<FormState>(formVazio)
  const [erro, setErro] = useState('')
  const [mostrarAddEquip, setMostrarAddEquip] = useState(false)
  const [equipForm, setEquipForm] = useState<EquipForm>({
    tipo: 'MAQUINA_LAVAR', marca: '', modelo: '', numeroSerie: '',
  })

  const { data: cliente, isLoading: loadingCliente } = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clientesApi.buscar(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!cliente) return
    setForm({
      nome: cliente.nome,
      cpfCnpj: cliente.cpfCnpj ?? '',
      telefone: cliente.telefone ?? '',
      email: cliente.email ?? '',
      observacoes: cliente.observacoes ?? '',
      temEndereco: !!cliente.endereco,
      logradouro: cliente.endereco?.logradouro ?? '',
      numero: cliente.endereco?.numero ?? '',
      complemento: cliente.endereco?.complemento ?? '',
      bairro: cliente.endereco?.bairro ?? '',
      cidade: cliente.endereco?.cidade ?? '',
      estado: cliente.endereco?.estado ?? '',
      cep: cliente.endereco?.cep ?? '',
    })
  }, [cliente])

  const mutacaoCriar = useMutation({
    mutationFn: (data: ClientePayload) => clientesApi.criar(data),
    onSuccess: (novoCliente) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      navigate(`/admin/clientes/${novoCliente.id}/editar`, { replace: true })
    },
    onError: () => setErro('Erro ao salvar cliente. Verifique os dados e tente novamente.'),
  })

  const mutacaoAtualizar = useMutation({
    mutationFn: (data: ClientePayload) => clientesApi.atualizar(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['cliente', id] })
    },
    onError: () => setErro('Erro ao atualizar cliente.'),
  })

  const mutacaoEquipamento = useMutation({
    mutationFn: (data: EquipamentoPayload) => clientesApi.adicionarEquipamento(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente', id] })
      setMostrarAddEquip(false)
      setEquipForm({ tipo: 'MAQUINA_LAVAR', marca: '', modelo: '', numeroSerie: '' })
    },
    onError: () => setErro('Erro ao adicionar equipamento.'),
  })

  function montarPayload(): ClientePayload {
    return {
      nome: form.nome,
      cpfCnpj: form.cpfCnpj || undefined,
      telefone: form.telefone || undefined,
      email: form.email || undefined,
      observacoes: form.observacoes || undefined,
      endereco: form.temEndereco ? {
        logradouro: form.logradouro,
        numero: form.numero,
        complemento: form.complemento || undefined,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        cep: form.cep,
      } : undefined,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
    if (form.temEndereco) {
      if (!form.logradouro || !form.numero || !form.bairro || !form.cidade || !form.estado || !form.cep) {
        setErro('Preencha todos os campos obrigatórios do endereço.')
        return
      }
    }
    if (isEdit) {
      mutacaoAtualizar.mutate(montarPayload())
    } else {
      mutacaoCriar.mutate(montarPayload())
    }
  }

  function set(field: keyof FormState, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const salvando = mutacaoCriar.isPending || mutacaoAtualizar.isPending

  if (isEdit && loadingCliente) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-400 text-sm py-20">Carregando...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/clientes')} className="text-gray-400 hover:text-gray-600">
          ← Voltar
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>
        {isEdit && mutacaoAtualizar.isSuccess && (
          <span className="text-xs text-green-600 font-medium">Salvo!</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do Cliente */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Dados do Cliente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nome}
                onChange={e => set('nome', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
              <input
                value={form.cpfCnpj}
                onChange={e => set('cpfCnpj', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                value={form.telefone}
                onChange={e => set('telefone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="cliente@email.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={form.observacoes}
                onChange={e => set('observacoes', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Anotações gerais sobre o cliente"
              />
            </div>
          </div>
        </section>

        {/* Endereço */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Endereço</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.temEndereco}
                onChange={e => set('temEndereco', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Informar endereço</span>
            </label>
          </div>

          {form.temEndereco && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logradouro <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.logradouro}
                  onChange={e => set('logradouro', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, Avenida..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.numero}
                  onChange={e => set('numero', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                <input
                  value={form.complemento}
                  onChange={e => set('complemento', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apto, Sala..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.bairro}
                  onChange={e => set('bairro', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.cidade}
                  onChange={e => set('cidade', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UF <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.estado}
                    onChange={e => set('estado', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">--</option>
                    {ESTADOS_BR.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.cep}
                    onChange={e => set('cep', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </div>
            </div>
          )}

          {!form.temEndereco && (
            <p className="text-sm text-gray-400">Marque a opção acima para informar o endereço.</p>
          )}
        </section>

        {/* Equipamentos — somente no modo edição */}
        {isEdit && (
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">
                Equipamentos
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                  {cliente?.equipamentos.length ?? 0}
                </span>
              </h3>
              {!mostrarAddEquip && (
                <button
                  type="button"
                  onClick={() => setMostrarAddEquip(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  + Adicionar
                </button>
              )}
            </div>

            {/* Lista de equipamentos existentes */}
            {!!cliente?.equipamentos.length && (
              <ul className="divide-y divide-gray-100 mb-4">
                {cliente.equipamentos.map((e: Equipamento) => (
                  <li key={e.id} className="py-2.5 flex items-start gap-3">
                    <span className="mt-0.5 text-blue-500">⚙</span>
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {TIPO_EQUIPAMENTO_LABELS[e.tipo]}
                      </span>
                      {(e.marca || e.modelo) && (
                        <span className="text-xs text-gray-400 ml-2">
                          {[e.marca, e.modelo].filter(Boolean).join(' — ')}
                        </span>
                      )}
                      {e.numeroSerie && (
                        <span className="block text-xs text-gray-400">Série: {e.numeroSerie}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!cliente?.equipamentos.length && !mostrarAddEquip && (
              <p className="text-sm text-gray-400 mb-4">Nenhum equipamento cadastrado.</p>
            )}

            {/* Formulário inline para adicionar equipamento */}
            {mostrarAddEquip && (
              <div className="border border-blue-100 rounded-lg p-4 bg-blue-50">
                <p className="text-sm font-medium text-gray-700 mb-3">Novo equipamento</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={equipForm.tipo}
                      onChange={e => setEquipForm(prev => ({ ...prev, tipo: e.target.value as TipoEquipamento }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {TIPOS_EQUIPAMENTO.map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
                    <input
                      value={equipForm.marca}
                      onChange={e => setEquipForm(prev => ({ ...prev, marca: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="Samsung, LG..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Modelo</label>
                    <input
                      value={equipForm.modelo}
                      onChange={e => setEquipForm(prev => ({ ...prev, modelo: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="WF5000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Número de Série</label>
                    <input
                      value={equipForm.numeroSerie}
                      onChange={e => setEquipForm(prev => ({ ...prev, numeroSerie: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => mutacaoEquipamento.mutate({
                      tipo: equipForm.tipo,
                      marca: equipForm.marca || undefined,
                      modelo: equipForm.modelo || undefined,
                      numeroSerie: equipForm.numeroSerie || undefined,
                    })}
                    disabled={mutacaoEquipamento.isPending}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {mutacaoEquipamento.isPending ? 'Salvando...' : 'Salvar equipamento'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarAddEquip(false)}
                    className="px-4 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Erro e botões */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
            {erro}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar cliente'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/clientes')}
            className="px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
