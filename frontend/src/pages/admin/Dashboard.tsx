import { AdminLayout } from '../../components/AdminLayout'

export function AdminDashboard() {
  return (
    <AdminLayout>
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
          Sprint 2 em breve: criação e gestão de OS.
        </p>
      </div>
    </AdminLayout>
  )
}
