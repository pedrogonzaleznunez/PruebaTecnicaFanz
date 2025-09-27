"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import type { Section, Row, Seat as SeatType } from "../lib/schema"
import { Seat } from "./Seat"
import { FloatingSeatsPanel } from "./FloatingSeatsPanel"

interface SeatCanvasProps {
  sections: Section[]
  onSectionChange: (sections: Section[]) => void
  selectedRows: string[]
  onRowSelectionChange: (rowIds: string[]) => void
  selectedSections: string[]
  onSectionSelectionChange: (sectionIds: string[]) => void
  onAddRowToSection?: (sectionId: string) => void
  selectedSeats?: number
  onMarkSelectedSeatsAs?: (status: "available" | "occupied") => void
}

export function SeatCanvas({ sections, onSectionChange, selectedRows, onRowSelectionChange, selectedSections, onSectionSelectionChange, onAddRowToSection, selectedSeats = 0, onMarkSelectedSeatsAs }: SeatCanvasProps) {
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    seatId: string | null
    rowId: string | null
    sectionId: string | null
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  }>({
    isDragging: false,
    seatId: null,
    rowId: null,
    sectionId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  })

  // Box selection state
  const [boxSelection, setBoxSelection] = useState<{
    isActive: boolean
    startX: number
    startY: number
    endX: number
    endY: number
  }>({
    isActive: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
  })
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const mouseDownTimeRef = useRef<number>(0)

  const handleSeatMouseDown = useCallback((e: React.MouseEvent, sectionId: string, rowId: string, seatId: string) => {
    if (e.button !== 0) return // Only left click

    mouseDownTimeRef.current = Date.now()
    const rect = e.currentTarget.getBoundingClientRect()
    
    setDragState({
      isDragging: false,
      seatId,
      rowId,
      sectionId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    })
    
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.seatId || !canvasRef.current) return

      const distance = Math.sqrt(
        Math.pow(e.clientX - dragState.startX, 2) + Math.pow(e.clientY - dragState.startY, 2)
      )

      // Iniciar drag solo si se movió más de 8 pixels
      if (distance > 8 && !dragState.isDragging) {
        setDragState(prev => ({ ...prev, isDragging: true }))
      }

      // Solo actualizar posición si estamos arrastrando
      if (dragState.isDragging) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const newX = e.clientX - canvasRect.left - dragState.offsetX
        const newY = e.clientY - canvasRect.top - dragState.offsetY

        onSectionChange(
          sections.map((section) => {
            if (section.id === dragState.sectionId) {
              return {
                ...section,
                rows: section.rows.map((row) => {
                  if (row.id === dragState.rowId) {
                    return {
                      ...row,
                      seats: row.seats.map((seat) => {
                        if (seat.id === dragState.seatId) {
                          return { 
                            ...seat, 
                            x: Math.max(0, Math.min(newX, 800)), // Limitar X a 800px
                            y: Math.max(0, Math.min(newY, 400)) // Limitar Y a 400px
                          }
                        }
                        return seat
                      }),
                    }
                  }
                  return row
                })
              }
            }
            return section
          }),
        )
      }
    },
    [dragState, sections, onSectionChange],
  )

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      seatId: null,
      rowId: null,
      sectionId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    })
  }, [])

  // Box selection functions
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    console.log('Canvas mouse down:', e.target, e.currentTarget, e.target === e.currentTarget)
    if (e.button !== 0) return // Only left click
    
    // Check if we clicked on the canvas itself or on empty space
    const target = e.target as HTMLElement
    if (target.closest('[data-seat-id]') || target.closest('.seat-container')) {
      console.log('Clicked on seat, not starting box selection')
      return
    }
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    console.log('Starting box selection at:', startX, startY)
    setBoxSelection({
      isActive: true,
      startX,
      startY,
      endX: startX,
      endY: startY
    })
  }, [])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!boxSelection.isActive || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top

    setBoxSelection(prev => ({
      ...prev,
      endX,
      endY
    }))
  }, [boxSelection.isActive])

  const handleCanvasMouseUp = useCallback(() => {
    if (!boxSelection.isActive) return

    console.log('Box selection ended, selecting seats...')
    // Calculate which seats are within the selection rectangle
    const selectedSeats: Array<{ sectionId: string; rowId: string; seatId: string }> = []
    
    // Get all seat elements
    const seatElements = document.querySelectorAll('[data-seat-id]')
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    
    if (!canvasRect) return

    console.log('Found', seatElements.length, 'seat elements')

    seatElements.forEach(seatElement => {
      const seatRect = seatElement.getBoundingClientRect()
      const seatX = seatRect.left - canvasRect.left + seatRect.width / 2
      const seatY = seatRect.top - canvasRect.top + seatRect.height / 2

      const minX = Math.min(boxSelection.startX, boxSelection.endX)
      const maxX = Math.max(boxSelection.startX, boxSelection.endX)
      const minY = Math.min(boxSelection.startY, boxSelection.endY)
      const maxY = Math.max(boxSelection.startY, boxSelection.endY)

      if (seatX >= minX && seatX <= maxX && seatY >= minY && seatY <= maxY) {
        const seatId = seatElement.getAttribute('data-seat-id')
        if (seatId) {
          console.log('Seat', seatId, 'is within selection rectangle')
          // Find the seat in our data structure
          sections.forEach(section => {
            section.rows.forEach(row => {
              row.seats.forEach(seat => {
                if (seat.id === seatId) {
                  selectedSeats.push({ sectionId: section.id, rowId: row.id, seatId: seat.id })
                }
              })
            })
          })
        }
      }
    })

    console.log('Selected seats:', selectedSeats.length)

    // Update seat selection
    if (selectedSeats.length > 0) {
      onSectionChange(
        sections.map(section => ({
          ...section,
          rows: section.rows.map(row => ({
            ...row,
            seats: row.seats.map(seat => {
              const isSelected = selectedSeats.some(s => s.seatId === seat.id)
              return isSelected ? { ...seat, status: "selected" as const } : seat
            })
          }))
        }))
      )
    }

    // Reset box selection
    setBoxSelection({
      isActive: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    })
  }, [boxSelection, sections, onSectionChange])

  const handleSeatRightClick = useCallback(
    (e: React.MouseEvent, sectionId: string, rowId: string, seatId: string) => {
      e.preventDefault() // Prevenir menú contextual
      
      onSectionChange(
        sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              rows: section.rows.map((row) => {
                if (row.id === rowId) {
                  return {
                    ...row,
                    seats: row.seats.map((seat) => {
                      if (seat.id === seatId) {
                        return {
                          ...seat,
                          status: seat.status === "available" ? "occupied" : "available",
                        }
                      }
                      return seat
                    }),
                  }
                }
                return row
              })
            }
          }
          return section
        }),
      )
    },
    [sections, onSectionChange],
  )

  const handleSeatClick = useCallback(
    (sectionId: string, rowId: string, seatId: string, event?: React.MouseEvent) => {
      if (dragState.isDragging) return // No hacer click si está arrastrando
      
      // Verificar que fue un click rápido (menos de 200ms)
      const clickDuration = Date.now() - mouseDownTimeRef.current
      if (clickDuration > 200) return
      
      const isCmdClick = event?.metaKey || event?.ctrlKey
      
      if (isCmdClick) {
        // Selección de rango con Cmd+Click
        const section = sections.find(p => p.id === sectionId)
        const row = section?.rows.find(r => r.id === rowId)
        if (!row) return
        
        const clickedSeatIndex = row.seats.findIndex(s => s.id === seatId)
        const selectedSeats = row.seats.filter(s => s.status === "selected")
        
        if (selectedSeats.length === 0) {
          // Si no hay asientos seleccionados, seleccionar solo este
          onSectionChange(
            sections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  rows: section.rows.map((row) => {
                    if (row.id === rowId) {
                      return {
                        ...row,
                        seats: row.seats.map((seat) => {
                          if (seat.id === seatId) {
                            return { ...seat, status: "selected" }
                          }
                          return seat
                        }),
                      }
                    }
                    return row
                  })
                }
              }
              return section
            }),
          )
        } else {
          // Seleccionar rango desde el primer asiento seleccionado hasta el clickeado
          const firstSelectedIndex = row.seats.findIndex(s => s.id === selectedSeats[0].id)
          const startIndex = Math.min(firstSelectedIndex, clickedSeatIndex)
          const endIndex = Math.max(firstSelectedIndex, clickedSeatIndex)
          
          onSectionChange(
            sections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  rows: section.rows.map((row) => {
                    if (row.id === rowId) {
                      return {
                        ...row,
                        seats: row.seats.map((seat, index) => {
                          if (index >= startIndex && index <= endIndex) {
                            return { ...seat, status: "selected" }
                          }
                          return seat
                        }),
                      }
                    }
                    return row
                  })
                }
              }
              return section
            }),
          )
        }
      } else {
        // Click normal - toggle individual con selección jerárquica
        const section = sections.find(p => p.id === sectionId)
        const row = section?.rows.find(r => r.id === rowId)
        const seat = row?.seats.find(s => s.id === seatId)
        
        if (!seat) return
        
        const newSeatStatus = seat.status === "selected" ? "available" : "selected"
        
        onSectionChange(
          sections.map((section) => {
            if (section.id === sectionId) {
              return {
                ...section,
                rows: section.rows.map((row) => {
                  if (row.id === rowId) {
                    return {
                      ...row,
                      seats: row.seats.map((seat) => {
                        if (seat.id === seatId) {
                          return { ...seat, status: newSeatStatus }
                        }
                        return seat
                      }),
                    }
                  }
                  return row
                })
              }
            }
            return section
          }),
        )
        
        // Selección jerárquica: si se selecciona un asiento, seleccionar también su fila y section
        if (newSeatStatus === "selected") {
          // Seleccionar la fila si no está seleccionada
          if (!selectedRows.includes(rowId)) {
            onRowSelectionChange([...selectedRows, rowId])
          }
          
          // Seleccionar la section si no está seleccionada
          if (!selectedSections.includes(sectionId)) {
            onSectionSelectionChange([...selectedSections, sectionId])
          }
        }
      }
    },
    [sections, onSectionChange, dragState.isDragging, selectedRows, onRowSelectionChange, selectedSections, onSectionSelectionChange],
  )

  const toggleRowSelection = useCallback(
    (rowId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      
      const isCmdClick = e.metaKey || e.ctrlKey
      
      if (isCmdClick) {
        // Selección de rango con Cmd+Click para filas
        const section = sections.find(p => p.rows.some(r => r.id === rowId))
        if (!section) return
        
        const clickedRowIndex = section.rows.findIndex(r => r.id === rowId)
        
        if (selectedRows.length === 0) {
          // Si no hay filas seleccionadas, seleccionar solo esta
          onRowSelectionChange([rowId])
        } else {
          // Encontrar la primera fila seleccionada en la misma section
          const firstSelectedRowId = selectedRows.find(id => 
            section.rows.some(r => r.id === id)
          )
          if (!firstSelectedRowId) {
            onRowSelectionChange([rowId])
            return
          }
          
          const firstSelectedIndex = section.rows.findIndex(r => r.id === firstSelectedRowId)
          const startIndex = Math.min(firstSelectedIndex, clickedRowIndex)
          const endIndex = Math.max(firstSelectedIndex, clickedRowIndex)
          
          const rangeRowIds = section.rows
            .slice(startIndex, endIndex + 1)
            .map(r => r.id)
          
          onRowSelectionChange(rangeRowIds)
        }
      } else {
        // Click normal - toggle individual
        const newSelection = selectedRows.includes(rowId)
          ? selectedRows.filter((id) => id !== rowId)
          : [...selectedRows, rowId]
        onRowSelectionChange(newSelection)
      }
    },
    [selectedRows, onRowSelectionChange, sections],
  )

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full min-h-[600px] bg-gray-50 rounded-2xl border border-gray-200 overflow-auto"
      style={{ backgroundColor: '#F9FAFB', userSelect: 'none' }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={(e) => {
        handleMouseMove(e)
        handleCanvasMouseMove(e)
      }}
      onMouseUp={() => {
        handleMouseUp()
        handleCanvasMouseUp()
      }}
      onMouseLeave={() => {
        handleMouseUp()
        handleCanvasMouseUp()
      }}
      onClick={(e) => {
        // Deseleccionar todo si se hace clic en el canvas vacío
        if (e.target === e.currentTarget) {
          onRowSelectionChange([])
          onSectionSelectionChange([])
        }
      }}
    >
      {sections.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-md">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Mapa vacío</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Comienza agregando sections desde el panel lateral
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 p-8" style={{ minWidth: '1400px', minHeight: '800px' }}>
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="mb-12">
              {/* Section Header */}
              <div 
                className={`mb-6 p-4 bg-white border rounded-2xl shadow-md cursor-pointer transition-all duration-200 ${
                  selectedSections.includes(section.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-lg"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  const newSelectedSections = selectedSections.includes(section.id)
                    ? selectedSections.filter(id => id !== section.id)
                    : [...selectedSections, section.id]
                  
                  onSectionSelectionChange(newSelectedSections)
                  
                  // Auto-seleccionar la section en el sidebar si no hay ninguna seleccionada
                  if (newSelectedSections.includes(section.id) && !selectedSections.includes(section.id)) {
                    // Emitir evento para seleccionar en sidebar
                    const event = new CustomEvent('selectSectionInSidebar', { detail: { sectionId: section.id } })
                    window.dispatchEvent(event)
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      selectedSections.includes(section.id) ? "bg-blue-600" : "bg-blue-500"
                    }`}></div>
                    <h2 className={`text-lg font-semibold ${
                      selectedSections.includes(section.id) ? "text-blue-800" : "text-gray-800"
                    }`}>{section.label}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">
                      {section.rows.length} filas
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">
                      {section.rows.reduce((sum, row) => sum + row.seats.length, 0)} asientos
                    </span>
                  </div>
                </div>
              </div>

              {/* Rows within Section */}
              {section.rows.map((row, rowIndex) => (
                <div key={row.id} className="flex items-center gap-4 mb-4" style={{ height: '50px' }}>
                  {/* Row Header - Fixed width */}
                  <div className="flex-shrink-0" style={{ width: '180px' }}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        selectedRows.includes(row.id)
                          ? "bg-blue-500 border-blue-500 text-white shadow-md"
                          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm text-gray-700"
                      }`}
                      onClick={(e) => toggleRowSelection(row.id, e)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => {}}
                        className="w-3 h-3 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="font-medium text-sm">{row.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        selectedRows.includes(row.id) 
                          ? "bg-blue-400 text-white" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {row.seats.length}
                      </span>
                    </div>
                  </div>

                  {/* Seats Container - Flexbox para alineación uniforme */}
                  <div className="flex-1 flex items-center justify-start gap-2" style={{ height: '40px', minWidth: '800px' }}>
                    {row.seats.map((seat, seatIndex) => (
                      <div
                        key={seat.id}
                        data-seat-id={seat.id}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          handleSeatMouseDown(e, section.id, row.id, seat.id)
                        }}
                        className="relative"
                      >
                        <Seat
                          id={seat.id}
                          label={seat.label}
                          status={seat.status}
                          x={0}
                          y={0}
                          isDragging={dragState.seatId === seat.id && dragState.isDragging}
                          onSelect={(event) => handleSeatClick(section.id, row.id, seat.id, event)}
                          onStatusChange={() => {
                            const mockEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
                            handleSeatRightClick(mockEvent as any, section.id, row.id, seat.id);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Add Row Button */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-shrink-0" style={{ width: '180px' }}>
                  <button
                    onClick={() => onAddRowToSection?.(section.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar fila
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid overlay for better positioning */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Box Selection Rectangle */}
      {boxSelection.isActive && (
        <div
          className="absolute border-2 border-blue-500 border-dashed pointer-events-none z-10"
          style={{
            left: Math.min(boxSelection.startX, boxSelection.endX),
            top: Math.min(boxSelection.startY, boxSelection.endY),
            width: Math.abs(boxSelection.endX - boxSelection.startX),
            height: Math.abs(boxSelection.endY - boxSelection.startY),
            backgroundColor: 'rgba(59, 130, 246, 0.05)', // Muy sutil azul con 5% opacidad
          }}
        />
      )}

      {/* Floating Seats Panel */}
      <FloatingSeatsPanel
        selectedSeats={selectedSeats}
        onMarkAsAvailable={() => onMarkSelectedSeatsAs?.("available")}
        onMarkAsOccupied={() => onMarkSelectedSeatsAs?.("occupied")}
        onClose={() => {
          // Deseleccionar todos los asientos
          const updatedSections = sections.map((section: Section) => ({
            ...section,
            rows: section.rows.map((row: Row) => ({
              ...row,
              seats: row.seats.map((seat: SeatType) => 
                seat.status === 'selected' ? { ...seat, status: 'available' as const } : seat
              )
            }))
          }))
          onSectionChange(updatedSections)
        }}
      />
    </div>
  )
}