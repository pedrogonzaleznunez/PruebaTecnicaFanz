"use client"

import type React from "react"
import { useCallback, useState, useRef } from "react"

import type { Section } from "@lib/schema"
import { SectionBlock } from "@components/section/SectionBlock"

interface SectionCanvasProps {
  sections: Section[]
  selectedSectionId: string | null
  selectedSections: string[]
  onSectionSelect: (sectionId: string, event: React.MouseEvent) => void
  onSectionUpdate: (sectionId: string, updates: Partial<Section>) => void
  onCreateStadium?: () => void
}

export function SectionCanvas({ 
  sections, 
  selectedSectionId, 
  selectedSections,
  onSectionSelect, 
  onSectionUpdate,
  onCreateStadium
}: SectionCanvasProps) {
  
  // Estados para box selection
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<{
    startX: number
    startY: number
    endX: number
    endY: number
  } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Iniciar box selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Solo iniciar si no estamos haciendo click en una sección
    const target = e.target as HTMLElement
    const isClickingOnSection = target.closest('[data-section-id]')
    
    if (!isClickingOnSection && e.button === 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const startX = e.clientX - rect.left
      const startY = e.clientY - rect.top
      
      setIsSelecting(true)
      setSelectionBox({
        startX,
        startY,
        endX: startX,
        endY: startY
      })
    }
  }, [])

  // Actualizar box selection
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isSelecting && selectionBox) {
      const rect = e.currentTarget.getBoundingClientRect()
      const endX = e.clientX - rect.left
      const endY = e.clientY - rect.top
      
      setSelectionBox(prev => prev ? {
        ...prev,
        endX,
        endY
      } : null)
    }
  }, [isSelecting, selectionBox])

  // Finalizar box selection
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isSelecting && selectionBox) {
      const rect = e.currentTarget.getBoundingClientRect()
      const endX = e.clientX - rect.left
      const endY = e.clientY - rect.top
      
      // Calcular el rectángulo de selección
      const minX = Math.min(selectionBox.startX, endX)
      const maxX = Math.max(selectionBox.startX, endX)
      const minY = Math.min(selectionBox.startY, endY)
      const maxY = Math.max(selectionBox.startY, endY)
      
      // Encontrar secciones dentro del rectángulo
      const selectedSectionIds: string[] = []
      sections.forEach(section => {
        const sectionRight = section.x + section.width
        const sectionBottom = section.y + section.height
        
        // Verificar si la sección intersecta con el rectángulo de selección
        if (section.x < maxX && sectionRight > minX && 
            section.y < maxY && sectionBottom > minY) {
          selectedSectionIds.push(section.id)
        }
      })
      
      // Seleccionar las secciones encontradas
      if (selectedSectionIds.length > 0) {
        // Crear evento sintético para selección múltiple
        const syntheticEvent = {
          ...e,
          metaKey: true,
          ctrlKey: true,
          preventDefault: () => {},
          stopPropagation: () => {}
        } as React.MouseEvent
        
        // Seleccionar todas las secciones de una vez
        selectedSectionIds.forEach(sectionId => {
          onSectionSelect(sectionId, syntheticEvent)
        })
      } else {
        // Si no hay secciones seleccionadas, deseleccionar todo
        onSectionSelect('', e)
      }
      
      setIsSelecting(false)
      setSelectionBox(null)
    }
  }, [isSelecting, selectionBox, sections, onSectionSelect])

  return (
    <div className="h-full bg-gray-100">
      {/* Botón Crear Estadio */}
      {onCreateStadium && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={onCreateStadium}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Crear Estadio
          </button>
        </div>
      )}
      
      {/* Canvas principal */}
      <div 
        ref={canvasRef}
        id="section-canvas"
        className="relative w-full h-full overflow-hidden bg-gray-100 p-8"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Grid background pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Secciones */}
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            isSelected={selectedSectionId === section.id}
            isMultiSelected={selectedSections.includes(section.id)}
            onSelect={onSectionSelect}
            onUpdate={onSectionUpdate}
          />
        ))}
        
        {/* Rectángulo de selección punteado */}
        {isSelecting && selectionBox && (
          <div
            className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-30 pointer-events-none"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.endX),
              top: Math.min(selectionBox.startY, selectionBox.endY),
              width: Math.abs(selectionBox.endX - selectionBox.startX),
              height: Math.abs(selectionBox.endY - selectionBox.startY),
            }}
          />
        )}
        
        {/* Escenario mejorado */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-180 h-20 bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-gray-700 rounded-lg flex items-center justify-center shadow-2xl">
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
