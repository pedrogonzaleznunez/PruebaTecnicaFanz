"use client"

import { Grid3X3 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Cargando SeatMapBuilder..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo animado mejorado */}
        <div className="relative mb-12">
          {/* Círculos de fondo con gradiente */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-20 animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Logo principal */}
          <div className="relative z-10 p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 mx-auto w-24 h-24 flex items-center justify-center shadow-2xl animate-float">
            <Grid3X3 className="h-12 w-12 text-white drop-shadow-lg" />
          </div>
          
          {/* Anillo giratorio */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 border-4 border-transparent border-t-blue-500 border-r-blue-400 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Título mejorado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
            SeatMapBuilder
          </h1>
          <p className="text-gray-600 text-lg font-medium">{message}</p>
        </div>

        {/* Barra de progreso mejorada */}
        <div className="w-80 mx-auto mb-8">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full animate-loading-bar shadow-lg" style={{
              width: '100%'
            }}></div>
          </div>
        </div>

        {/* Puntos de carga mejorados */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce shadow-md" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce shadow-md" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce shadow-md" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Texto adicional */}
        <p className="text-sm text-gray-500 mt-8 font-light">
          Preparando tu experiencia de diseño...
        </p>
      </div>
    </div>
  )
}
