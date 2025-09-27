"use client"

import React, { useState, useRef, useCallback } from "react"
import type { Section } from "../lib/schema"

interface SectionBlockProps {
  section: Section
  isSelected: boolean
  onSelect: (sectionId: string) => void
  onUpdate: (sectionId: string, updates: Partial<Section>) => void
}

export function SectionBlock({ section, isSelected, onSelect, onUpdate }: SectionBlockProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const blockRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Seleccionar la sección
    onSelect(section.id)
    
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
      <div className={`w-full h-full rounded-lg border transition-all duration-200 shadow-sm ${
        isSelected 
          ? 'bg-white border-blue-500 shadow-md' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}>
        
        {/* Header simple y limpio */}
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {section.label}
            </h3>
            {isSelected && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="p-3 flex-1">
          {/* Estadísticas compactas */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{section.rows.length}</div>
              <div className="text-xs text-gray-500">filas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{totalSeats}</div>
              <div className="text-xs text-gray-500">asientos</div>
            </div>
          </div>
          
          {/* Vista previa de asientos simplificada */}
          {section.rows.length > 0 && (
            <div className="space-y-1">
              {section.rows.slice(0, 3).map((row, index) => (
                <div key={row.id} className="flex justify-center gap-0.5">
                  {row.seats.slice(0, 6).map((seat, seatIndex) => (
                    <div
                      key={seat.id}
                      className={`w-1.5 h-1.5 rounded-sm ${
                        seat.status === 'available' 
                          ? 'bg-green-500' 
                          : seat.status === 'occupied' 
                          ? 'bg-red-500' 
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                  {row.seats.length > 6 && (
                    <span className="text-xs text-gray-400 ml-1">+{row.seats.length - 6}</span>
                  )}
                </div>
              ))}
              {section.rows.length > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{section.rows.length - 3} filas más
                </div>
              )}
            </div>
          )}
          
          {/* Estado de asientos */}
          <div className="flex justify-center gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{availableSeats}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">{occupiedSeats}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
