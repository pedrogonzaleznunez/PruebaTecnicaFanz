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
    <div className="h-full bg-gray-50">
      {/* Canvas principal */}
      <div 
        id="section-canvas"
        className="relative w-full h-full overflow-hidden bg-gray-50 p-6"
        onClick={handleCanvasClick}
      >
        {/* Grid de fondo */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #d1d5db 1px, transparent 1px),
              linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
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
        
        {/* Escenario */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="w-64 h-16 bg-sky-400 border-2 border-sky-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-lg">Escenario</span>
          </div>
        </div>
        
        {/* Mensaje cuando no hay secciones */}
        {sections.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin secciones</h3>
              <p className="text-gray-500 mb-4 text-sm">
                Crea tu primera sección para comenzar
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
