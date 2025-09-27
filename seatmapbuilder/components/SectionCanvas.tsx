"use client"

import type React from "react"
import { useCallback } from "react"
import type { Section } from "../lib/schema"
import { SectionBlock } from "./SectionBlock"

interface SectionCanvasProps {
  sections: Section[]
  selectedSectionId: string | null
  onSectionSelect: (sectionId: string) => void
  onSectionUpdate: (sectionId: string, updates: Partial<Section>) => void
}

export function SectionCanvas({ 
  sections, 
  selectedSectionId, 
  onSectionSelect, 
  onSectionUpdate 
}: SectionCanvasProps) {
  
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Si se hace click en el canvas vacío, deseleccionar
    if (e.target === e.currentTarget) {
      onSectionSelect('')
    }
  }, [onSectionSelect])

  return (
    <div className="h-full bg-gray-100">
      {/* Canvas principal */}
      <div 
        id="section-canvas"
        className="relative w-full h-full overflow-hidden bg-gray-100 p-8"
        onClick={handleCanvasClick}
      >
        {/* Stadium background pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 100%, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Secciones */}
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            isSelected={selectedSectionId === section.id}
            onSelect={onSectionSelect}
            onUpdate={onSectionUpdate}
          />
        ))}
        
        {/* Escenario mejorado */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-80 h-20 bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-gray-700 rounded-lg flex items-center justify-center shadow-2xl">
            <span className="text-white font-bold text-xl tracking-wider">ESCENARIO</span>
          </div>
        </div>
        
        {/* Mensaje cuando no hay secciones */}
        {sections.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Sin secciones</h3>
              <p className="text-gray-500 mb-6 text-base">
                Crea tu primera sección para comenzar
              </p>
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm border border-blue-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Usa el botón "Agregar sección" en la barra superior
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
