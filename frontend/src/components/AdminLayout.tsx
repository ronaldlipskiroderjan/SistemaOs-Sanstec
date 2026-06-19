import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
  children: React.ReactNode
}

function IconDashboard() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function IconTrabalho() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function IconUsuarios() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: <IconDashboard />, end: true },
  { to: '/admin/trabalho', label: 'Área de Trabalho', icon: <IconTrabalho />, end: false },
  { to: '/admin/usuarios', label: 'Usuários', icon: <IconUsuarios />, end: false },
]

export function AdminLayout({ children }: Props) {
  const { usuario, logout } = useAuth()
  const { pathname } = useLocation()
  const [aberta, setAberta] = useState(false)

  const iniciais = usuario?.nome?.charAt(0).toUpperCase() ?? 'A'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d9488' }}>

      {/* Overlay mobile */}
      {aberta && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setAberta(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-200
        md:relative md:translate-x-0
        ${aberta ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <img
            src="/logo.png"
            alt="Sanstec"
            className="w-full object-contain"
            style={{
              height: '72px',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
            }}
          />
        </div>

        {/* Nav label */}
        <p className="px-5 pt-5 pb-2 text-xs font-semibold uppercase tracking-widest text-white/50">
          Navegação
        </p>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setAberta(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: '#2ec4b6' }}>
              {iniciais}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{usuario?.nome}</p>
              <p className="text-xs truncate text-white/60">Admin</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="text-white/60 transition-colors hover:text-red-300"
            >
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Conteúdo principal ───────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Barra mobile */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10"
          style={{ background: '#0d9488' }}>
          <button
            onClick={() => setAberta(true)}
            className="text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-bold">Sistema OS</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4">
          <div key={pathname} className="bg-white rounded-2xl min-h-full p-6 page-transition" style={{ boxShadow: '0 8px 40px 0 rgba(0,0,0,0.35), 0 2px 8px 0 rgba(0,0,0,0.18)' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
