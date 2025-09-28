"use client"

import React, { useState, useRef, useCallback } from "react"

import type { Section } from "@lib/schema"

interface SectionBlockProps {
  section: Section
  isSelected: boolean
  isMultiSelected: boolean
  onSelect: (sectionId: string, event: React.MouseEvent) => void
  onUpdate: (sectionId: string, updates: Partial<Section>) => void
}

export function SectionBlock({ section, isSelected, isMultiSelected, onSelect, onUpdate }: SectionBlockProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const blockRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Seleccionar la sección
    onSelect(section.id, e)
    
    // Calcular offset para el drag
    const rect = blockRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
    
    setIsDragging(true)
  }, [section.id, onSelect])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const canvas = document.getElementById('section-canvas')
    if (!canvas) return
    
    const canvasRect = canvas.getBoundingClientRect()
    const newX = e.clientX - canvasRect.left - dragOffset.x
    const newY = e.clientY - canvasRect.top - dragOffset.y
    
    // Limitar movimiento dentro del canvas
    const maxX = canvasRect.width - section.width
    const maxY = canvasRect.height - section.height
    
    const clampedX = Math.max(0, Math.min(newX, maxX))
    const clampedY = Math.max(0, Math.min(newY, maxY))
    
    onUpdate(section.id, { x: clampedX, y: clampedY })
  }, [isDragging, dragOffset, section.id, section.width, section.height, onUpdate])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Event listeners para drag
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const totalSeats = section.rows.reduce((sum, row) => sum + row.seats.length, 0)

  const availableSeats = section.rows.reduce((sum, row) => 
    sum + row.seats.filter(seat => seat.status === 'available').length, 0
  )
  const occupiedSeats = section.rows.reduce((sum, row) => 
    sum + row.seats.filter(seat => seat.status === 'occupied').length, 0
  )

  return (
    <div
      ref={blockRef}
      data-section-id={section.id}
      className={`absolute cursor-move select-none transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 ring-offset-1' 
          : 'hover:shadow-md'
      }`}
      style={{
        left: section.x,
        top: section.y,
        width: section.width,
        height: section.height,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        zIndex: isSelected ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Bloque principal limpio */}
      <div className={`w-full h-full rounded-lg border transition-all duration-200 shadow-sm flex flex-col ${
        (isSelected || isMultiSelected)
          ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-200' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}>
        
        {/* Header simple y limpio */}
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {section.label}
            </h3>
            {(isSelected || isMultiSelected) && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="p-3 flex-1 flex flex-col min-h-0">
          {/* Estadísticas compactas */}
          <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">{section.rows.length}</div>
              <div className="text-xs text-gray-500">filas</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">{totalSeats}</div>
              <div className="text-xs text-gray-500">asientos</div>
            </div>
          </div>
          
          {/* Vista previa de asientos simplificada */}
          {section.rows.length > 0 && (
            <div className="space-y-1 flex-1 min-h-0 overflow-hidden">
              {section.rows.slice(0, 3).map((row, index) => {
                // Calcular cuántos asientos mostrar según el ancho de la sección
                const maxSeatsToShow = Math.min(
                  Math.floor((section.width - 24) / 8), // 8px por asiento (6px + 2px gap)
                  row.seats.length
                )
                
                return (
                  <div key={row.id} className="flex justify-center gap-0.5">
                    {row.seats.slice(0, maxSeatsToShow).map((seat, seatIndex) => (
                      <div
                        key={seat.id}
                        className={`w-1.5 h-1.5 rounded-sm ${
                          seat.status === 'available' 
                            ? 'bg-emerald-500' 
                            : seat.status === 'occupied' 
                            ? 'bg-violet-500' 
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                    {row.seats.length > maxSeatsToShow && (
                      <span className="text-xs text-gray-400 ml-1">+{row.seats.length - maxSeatsToShow}</span>
                    )}
                  </div>
                )
              })}
              {section.rows.length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{section.rows.length - 3} filas más
                </div>
              )}
            </div>
          )}
          
          {/* Estado de asientos - Más prominente */}
          <div className="flex justify-center gap-4 mt-3 text-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="font-medium text-emerald-700">{availableSeats}</span>
              <span className="text-xs text-gray-500">libres</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
              <span className="font-medium text-violet-700">{occupiedSeats}</span>
              <span className="text-xs text-gray-500">ocupados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
