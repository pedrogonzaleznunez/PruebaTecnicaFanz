"use client"

import React, { useState, useRef, useCallback } from "react"
import type { Section, Row, Seat as SeatType } from "../lib/schema"
import { Seat } from "./Seat"
import { FloatingSeatsPanel } from "./FloatingSeatsPanel"

interface SeatEditorProps {
  section: Section
  onSectionUpdate: (section: Section) => void
  selectedRows: string[]
  onRowSelectionChange: (rowIds: string[]) => void
  selectedSeats: number
  onMarkSelectedSeatsAs: (status: "available" | "occupied") => void
  onAddRow: (sectionId: string) => void
}

export function SeatEditor({ 
  section, 
  onSectionUpdate, 
  selectedRows, 
  onRowSelectionChange, 
  selectedSeats, 
  onMarkSelectedSeatsAs,
  onAddRow 
}: SeatEditorProps) {
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    seatId: string | null
    rowId: string | null
    sectionId: string | null
    startX: number
    startY: number
  }>({
    isDragging: false,
    seatId: null,
    rowId: null,
    sectionId: null,
    startX: 0,
    startY: 0,
  })

  const [boxSelection, setBoxSelection] = useState<{
    isSelecting: boolean
    startX: number
    startY: number
    endX: number
    endY: number
  }>({
    isSelecting: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  })

  const canvasRef = useRef<HTMLDivElement>(null)
  const mouseDownTimeRef = useRef<number>(0)

  const handleSeatMouseDown = useCallback((e: React.MouseEvent, sectionId: string, rowId: string, seatId: string) => {
    if (e.button !== 0) return // Only left click

    mouseDownTimeRef.current = Date.now()
    setDragState({
      isDragging: true,
      seatId,
      rowId,
      sectionId,
      startX: e.clientX,
      startY: e.clientY,
    })
  }, [])

  const handleSeatMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging) return

    const deltaX = e.clientX - dragState.startX
    const deltaY = e.clientY - dragState.startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance > 5) { // Movement threshold
      const updatedSection = {
        ...section,
        rows: section.rows.map((row) => {
          if (row.id === dragState.rowId) {
            return {
              ...row,
              seats: row.seats.map((seat) => {
                if (seat.id === dragState.seatId) {
                  return {
                    ...seat,
                    x: seat.x + deltaX,
                    y: seat.y + deltaY,
                  } as SeatType
                }
                return seat
              }),
            }
          }
          return row
        }),
      }
      onSectionUpdate(updatedSection)
    }
  }, [dragState, section, onSectionUpdate])

  const handleSeatMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      const clickDuration = Date.now() - mouseDownTimeRef.current
      if (clickDuration < 200) { // Short click
        // Handle seat selection
        const seat = section.rows
          .find(r => r.id === dragState.rowId)
          ?.seats.find(s => s.id === dragState.seatId)
        
        if (seat) {
          const newStatus = seat.status === "selected" ? "available" : "selected"
          const updatedSection = {
            ...section,
            rows: section.rows.map((row) => {
              if (row.id === dragState.rowId) {
                return {
                  ...row,
                  seats: row.seats.map((s) => 
                    s.id === dragState.seatId ? { ...s, status: newStatus as "available" | "occupied" | "selected" | "unlabeled" } : s
                  ),
                }
              }
              return row
            }),
          }
          onSectionUpdate(updatedSection)
        }
      }
    }

    setDragState({
      isDragging: false,
      seatId: null,
      rowId: null,
      sectionId: null,
      startX: 0,
      startY: 0,
    })
  }, [dragState, section, onSectionUpdate])

  const handleSeatRightClick = useCallback(
    (e: React.MouseEvent, sectionId: string, rowId: string, seatId: string) => {
      e.preventDefault()
      
      const updatedSection = {
        ...section,
        rows: section.rows.map((row) => {
          if (row.id === rowId) {
            return {
              ...row,
              seats: row.seats.map((seat) => {
                if (seat.id === seatId) {
                  const newStatus = seat.status === "occupied" ? "available" : "occupied"
                  return { ...seat, status: newStatus as "available" | "occupied" | "selected" | "unlabeled" }
                }
                return seat
              }),
            }
          }
          return row
        }),
      }
      onSectionUpdate(updatedSection)
    },
    [section, onSectionUpdate]
  )

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setBoxSelection({
        isSelecting: true,
        startX: e.clientX,
        startY: e.clientY,
        endX: e.clientX,
        endY: e.clientY,
      })
    }
  }, [])

  const handleCanvasMouseMove = useCallback((e: MouseEvent) => {
    if (boxSelection.isSelecting) {
      setBoxSelection(prev => ({
        ...prev,
        endX: e.clientX,
        endY: e.clientY,
      }))
    }
  }, [boxSelection.isSelecting])

  const handleCanvasMouseUp = useCallback(() => {
    if (boxSelection.isSelecting) {
      setBoxSelection({
        isSelecting: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
      })
    }
  }, [boxSelection.isSelecting])

  // Event listeners
  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleSeatMouseMove)
      document.addEventListener('mouseup', handleSeatMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleSeatMouseMove)
        document.removeEventListener('mouseup', handleSeatMouseUp)
      }
    }
  }, [dragState.isDragging, handleSeatMouseMove, handleSeatMouseUp])

  React.useEffect(() => {
    if (boxSelection.isSelecting) {
      document.addEventListener('mousemove', handleCanvasMouseMove)
      document.addEventListener('mouseup', handleCanvasMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove)
        document.removeEventListener('mouseup', handleCanvasMouseUp)
      }
    }
  }, [boxSelection.isSelecting, handleCanvasMouseMove, handleCanvasMouseUp])

  const totalSeats = section.rows.reduce((sum, row) => sum + row.seats.length, 0)
  const selectedSeatsCount = section.rows.reduce((sum, row) => 
    sum + row.seats.filter(seat => seat.status === "selected").length, 0)

  return (
    <div className="flex-1 relative" style={{ backgroundColor: '#F9FAFB' }}>
      <div
        ref={canvasRef}
        className="relative w-full h-full overflow-hidden"
        onMouseDown={handleCanvasMouseDown}
        style={{ minHeight: '400px' }}
      >
        {section.rows.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-md">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Sin filas</h3>
              <p className="text-sm text-gray-500">
                Agrega la primera fila para comenzar
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 p-8" style={{ minWidth: '800px', minHeight: '600px' }}>
            {section.rows.map((row, rowIndex) => (
              <div key={row.id} className="flex items-center gap-4 mb-4" style={{ height: '50px' }}>
                {/* Row Header */}
                <div className="flex-shrink-0" style={{ width: '120px' }}>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onRowSelectionChange([...selectedRows, row.id])
                        } else {
                          onRowSelectionChange(selectedRows.filter(id => id !== row.id))
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{row.label}</span>
                  </div>
                </div>

                {/* Seats */}
                <div className="flex-1 flex items-center gap-2" style={{ justifyContent: 'start' }}>
                  {row.seats.map((seat, seatIndex) => (
                    <div
                      key={seat.id}
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
                        onSelect={() => {}}
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
            <div className="flex items-center gap-4 mb-4" style={{ height: '50px' }}>
              <div className="flex-shrink-0" style={{ width: '120px' }}></div>
              <div className="flex-shrink-0" style={{ width: '180px' }}>
                <button
                  onClick={() => onAddRow(section.id)}
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
        )}

        {/* Box Selection Rectangle */}
        {boxSelection.isSelecting && (
          <div
            className="absolute border-2 border-blue-500 border-dashed pointer-events-none"
            style={{
              left: Math.min(boxSelection.startX, boxSelection.endX) - (canvasRef.current?.getBoundingClientRect().left || 0),
              top: Math.min(boxSelection.startY, boxSelection.endY) - (canvasRef.current?.getBoundingClientRect().top || 0),
              width: Math.abs(boxSelection.endX - boxSelection.startX),
              height: Math.abs(boxSelection.endY - boxSelection.startY),
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
            }}
          />
        )}
      </div>

      {/* Floating Seats Panel */}
      {selectedSeatsCount > 0 && (
        <FloatingSeatsPanel
          selectedSeats={selectedSeatsCount}
          onMarkAsAvailable={() => onMarkSelectedSeatsAs("available")}
          onMarkAsOccupied={() => onMarkSelectedSeatsAs("occupied")}
          onClose={() => {
            // Deseleccionar todos los asientos
            const updatedSection = {
              ...section,
              rows: section.rows.map((row: Row) => ({
                ...row,
                seats: row.seats.map((seat: SeatType) => 
                  seat.status === "selected" ? { ...seat, status: "available" as "available" | "occupied" | "selected" | "unlabeled" } : seat
                )
              }))
            }
            onSectionUpdate(updatedSection)
          }}
        />
      )}
    </div>
  )
}
