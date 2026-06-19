import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AdminLayout } from '../../components/AdminLayout'
import { clientesApi } from '../../api/clientes'
import { Cliente } from '../../types'

export function ClientesPage() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [debouncedBusca, setDebouncedBusca] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusca(busca), 400)
    return () => clearTimeout(timer)
  }, [busca])

  const { data: clientes, isLoading, isError } = useQuery({
    queryKey: ['clientes', debouncedBusca],
    queryFn: () => clientesApi.listar(debouncedBusca),
  })

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button
          onClick={() => navigate('/admin/clientes/novo')}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          + Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ ou telefone..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {isLoading && (
          <div className="p-10 text-center text-gray-400 text-sm">Carregando...</div>
        )}

        {isError && (
          <div className="p-10 text-center text-red-500 text-sm">
            Erro ao carregar clientes. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && !clientes?.length && (
          <div className="p-10 text-center text-gray-400 text-sm">
            {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
          </div>
        )}

        {!isLoading && !isError && !!clientes?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">CPF / CNPJ</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Telefone</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">E-mail</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientes.map((c: Cliente) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{c.nome}</span>
                      {c.email && (
                        <span className="block text-xs text-gray-400 mt-0.5">{c.email}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {c.cpfCnpj || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {c.telefone || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {c.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/clientes/${c.id}/editar`)}
                        className="text-orange-500 hover:text-orange-700 text-xs font-medium transition-colors"
                      >
                        Editar
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
