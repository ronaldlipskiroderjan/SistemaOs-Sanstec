interface Props {
  lat?: number | null
  lng?: number | null
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
}

function textoEndereco(p: Props) {
  return [p.logradouro, p.numero, p.bairro, p.cidade, p.estado, p.cep]
    .filter(Boolean)
    .join(', ')
}

export function MapaServico(props: Props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined
  const { lat, lng } = props
  const texto = textoEndereco(props)

  const googleMapsUrl = lat && lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(texto)}`

  const wazeUrl = lat && lng
    ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(texto)}`

  return (
    <div className="space-y-3">
      {/* Mapa embed — usa coordenadas se tiver, senão usa texto do endereço */}
      {apiKey && texto ? (
        <div className="w-full h-48 rounded-xl overflow-hidden border border-gray-200">
          <iframe
            title="Localização do serviço"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={
              lat && lng
                ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`
                : `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(texto)}&zoom=15`
            }
          />
        </div>
      ) : (
        <div className="w-full h-32 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 text-center px-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-xs text-gray-500">{texto || 'Endereço não informado'}</p>
          {!apiKey && texto && (
            <p className="text-xs text-gray-400">Configure VITE_GOOGLE_MAPS_KEY para ver o mapa</p>
          )}
        </div>
      )}

      {/* Botões de rota */}
      <div className="flex gap-2">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          Google Maps
        </a>
        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.54 6.63C19.08 3.3 15.68 1 12 1 8.32 1 4.92 3.3 3.46 6.63 2 9.96 2.68 13.85 5.1 16.49L12 23l6.9-6.51c2.42-2.64 3.1-6.53 1.64-9.86z" />
          </svg>
          Waze
        </a>
      </div>
    </div>
  )
}
