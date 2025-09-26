"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import type { Platea } from "../lib/schema"
import { Seat } from "./Seat"

interface SeatCanvasProps {
  plateas: Platea[]
  onPlateaChange: (plateas: Platea[]) => void
  selectedRows: string[]
  onRowSelectionChange: (rowIds: string[]) => void
}

export function SeatCanvas({ plateas, onPlateaChange, selectedRows, onRowSelectionChange }: SeatCanvasProps) {
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    seatId: string | null
    rowId: string | null
    plateaId: string | null
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  }>({
    isDragging: false,
    seatId: null,
    rowId: null,
    plateaId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  })
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const mouseDownTimeRef = useRef<number>(0)

  const handleSeatMouseDown = useCallback((e: React.MouseEvent, plateaId: string, rowId: string, seatId: string) => {
    if (e.button !== 0) return // Only left click

    mouseDownTimeRef.current = Date.now()
    const rect = e.currentTarget.getBoundingClientRect()
    
    setDragState({
      isDragging: false,
      seatId,
      rowId,
      plateaId,
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

        onPlateaChange(
          plateas.map((platea) => {
            if (platea.id === dragState.plateaId) {
              return {
                ...platea,
                rows: platea.rows.map((row) => {
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
            return platea
          }),
        )
      }
    },
    [dragState, plateas, onPlateaChange],
  )

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      seatId: null,
      rowId: null,
      plateaId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    })
  }, [])

  const handleSeatRightClick = useCallback(
    (e: React.MouseEvent, plateaId: string, rowId: string, seatId: string) => {
      e.preventDefault() // Prevenir menú contextual
      
      onPlateaChange(
        plateas.map((platea) => {
          if (platea.id === plateaId) {
            return {
              ...platea,
              rows: platea.rows.map((row) => {
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
          return platea
        }),
      )
    },
    [plateas, onPlateaChange],
  )

  const handleSeatClick = useCallback(
    (plateaId: string, rowId: string, seatId: string) => {
      if (dragState.isDragging) return // No hacer click si está arrastrando
      
      // Verificar que fue un click rápido (menos de 200ms)
      const clickDuration = Date.now() - mouseDownTimeRef.current
      if (clickDuration > 200) return
      
      onPlateaChange(
        plateas.map((platea) => {
          if (platea.id === plateaId) {
            return {
              ...platea,
              rows: platea.rows.map((row) => {
                if (row.id === rowId) {
                  return {
                    ...row,
                    seats: row.seats.map((seat) => {
                      if (seat.id === seatId) {
                        return {
                          ...seat,
                          status: seat.status === "selected" ? "available" : "selected",
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
          return platea
        }),
      )
    },
    [plateas, onPlateaChange, dragState.isDragging],
  )

  const toggleRowSelection = useCallback(
    (rowId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const newSelection = selectedRows.includes(rowId)
        ? selectedRows.filter((id) => id !== rowId)
        : [...selectedRows, rowId]
      onRowSelectionChange(newSelection)
    },
    [selectedRows, onRowSelectionChange],
  )

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full min-h-[600px] bg-gray-50 rounded-2xl border border-gray-200 overflow-auto"
      style={{ backgroundColor: '#F9FAFB', userSelect: 'none' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {plateas.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-md">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Mapa vacío</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Comienza agregando plateas desde el panel lateral
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 p-8" style={{ minWidth: '1400px', minHeight: '800px' }}>
          {plateas.map((platea, plateaIndex) => (
            <div key={platea.id} className="mb-12">
              {/* Platea Header */}
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded-2xl shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h2 className="text-lg font-semibold text-gray-800">{platea.label}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">
                      {platea.rows.length} filas
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">
                      {platea.rows.reduce((sum, row) => sum + row.seats.length, 0)} asientos
                    </span>
                  </div>
                </div>
              </div>

              {/* Rows within Platea */}
              {platea.rows.map((row, rowIndex) => (
                <div key={row.id} className="flex items-center gap-4 mb-8" style={{ height: '60px' }}>
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

                  {/* Seats Container - Posicionamiento absoluto para drag & drop */}
                  <div className="flex-1 relative" style={{ height: '50px', minWidth: '800px' }}>
                    {row.seats.map((seat) => (
                      <div
                        key={seat.id}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          handleSeatMouseDown(e, platea.id, row.id, seat.id)
                        }}
                      >
                        <Seat
                          id={seat.id}
                          label={seat.label}
                          status={seat.status}
                          x={seat.x}
                          y={seat.y}
                          isDragging={dragState.seatId === seat.id && dragState.isDragging}
                          onSelect={() => handleSeatClick(platea.id, row.id, seat.id)}
                          onStatusChange={() => {
                            const mockEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
                            handleSeatRightClick(mockEvent as any, platea.id, row.id, seat.id);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
    </div>
  )
}