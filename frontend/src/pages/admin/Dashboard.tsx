import { useAuth } from '../../hooks/useAuth'

export function AdminDashboard() {
  const { usuario, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Sistema OS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">{usuario?.nome}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              Admin
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {['Abertas', 'Aprovadas', 'Não Aprovadas', 'Fechadas'].map(status => (
            <div key={status} className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm text-gray-500">{status}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">—</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-400 text-sm text-center py-8">
            Sprint 1 em breve: listagem e criação de OS.
          </p>
        </div>
      </main>
    </div>
  )
}
