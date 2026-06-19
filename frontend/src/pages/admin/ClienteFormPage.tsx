import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { clientesApi, ClientePayload } from '../../api/clientes'

interface FormState {
  nome: string
  cpfCnpj: string
  telefone: string
  email: string
  observacoes: string
}

const formVazio: FormState = {
  nome: '', cpfCnpj: '', telefone: '', email: '', observacoes: '',
}

export function ClienteFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<FormState>(formVazio)
  const [erro, setErro] = useState('')

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
    })
  }, [cliente])

  const mutacaoCriar = useMutation({
    mutationFn: (data: ClientePayload) => clientesApi.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      navigate('/admin/clientes')
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

  function montarPayload(): ClientePayload {
    return {
      nome: form.nome,
      cpfCnpj: form.cpfCnpj || undefined,
      telefone: form.telefone || undefined,
      email: form.email || undefined,
      observacoes: form.observacoes || undefined,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return }
    if (isEdit) {
      mutacaoAtualizar.mutate(montarPayload())
    } else {
      mutacaoCriar.mutate(montarPayload())
    }
  }

  function set(field: keyof FormState, value: string) {
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

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
              <input
                value={form.cpfCnpj}
                onChange={e => set('cpfCnpj', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                value={form.telefone}
                onChange={e => set('telefone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="cliente@email.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={form.observacoes}
                onChange={e => set('observacoes', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Anotações gerais sobre o cliente"
              />
            </div>
          </div>
        </section>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
            {erro}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
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
