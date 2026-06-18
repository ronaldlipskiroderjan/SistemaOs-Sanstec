import { useAuth } from '../../hooks/useAuth'

export function TecnicoDashboard() {
  const { usuario, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">Minhas OS</h1>
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

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-400 text-sm text-center py-8">
            Sprint 4 em breve: cards de OS com mapa e rotas.
          </p>
        </div>
      </main>
    </div>
  )
}
