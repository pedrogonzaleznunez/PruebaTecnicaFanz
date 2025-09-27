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

  return (
    <div
      ref={blockRef}
      className={`absolute cursor-move select-none transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-600 ring-offset-2' 
          : 'hover:shadow-lg'
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
      {/* Bloque principal */}
      <div className={`w-full h-full rounded-lg border transition-all duration-200 shadow-sm ${
        isSelected 
          ? 'bg-white border-blue-600 shadow-lg' 
          : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md'
      }`}>
        {/* Header con nombre */}
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h3 className="font-medium text-sm text-gray-900 truncate">
            {section.label}
          </h3>
        </div>
        
        {/* Contenido con estadísticas */}
        <div className="p-3 flex-1 flex flex-col justify-center">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {section.rows.length} filas
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {totalSeats} asientos
              </span>
            </div>
          </div>
        </div>
        
        {/* Indicador de selección */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  )
}
