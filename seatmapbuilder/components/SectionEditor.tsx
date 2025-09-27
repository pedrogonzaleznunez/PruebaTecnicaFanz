"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Plus, Trash2, ChevronLeft } from "lucide-react"
import type { Section, Row, Seat } from "../lib/schema"
import { generateFilaId, generateSeatId, extractSectionNumber } from "../lib/id-generator"
import { SeatEditor } from "./SeatEditor"

interface SectionEditorProps {
  section: Section | null
  onUpdate: (sectionId: string, updates: Partial<Section>) => void
  onAddRow: (sectionId: string) => void
  onDeleteRow: (sectionId: string, rowId: string) => void
  onAddSeats: (sectionId: string, rowId: string, count: number) => void
  selectedRows: string[]
  onRowSelectionChange: (rowIds: string[]) => void
  selectedSeats: number
  onMarkSelectedSeatsAs: (status: "available" | "occupied") => void
  onDeleteSection: () => void
  hasSelectedSection: boolean
}

export function SectionEditor({ 
  section, 
  onUpdate, 
  onAddRow, 
  onDeleteRow, 
  onAddSeats,
  selectedRows,
  onRowSelectionChange,
  selectedSeats,
  onMarkSelectedSeatsAs,
  onDeleteSection,
  hasSelectedSection
}: SectionEditorProps) {
  const [newRowSeatCount, setNewRowSeatCount] = useState(10)

  if (!section) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Selecciona una sección</h3>
          <p className="text-sm text-gray-500">
            Haz click en una sección del canvas para editarla
          </p>
        </div>
      </div>
    )
  }

  const totalSeats = section.rows.reduce((sum, row) => sum + row.seats.length, 0)

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Canvas toggle button */}
            <button
              onClick={() => {
                // This will be handled by the parent component
                const event = new CustomEvent('toggleCanvas')
                window.dispatchEvent(event)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm p-2 transition-colors"
              title="Ocultar canvas"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Editor de Sección</h2>
              <p className="text-sm text-gray-600 mt-1">
                Editando: <span className="font-medium text-gray-900">{section.label}</span>
              </p>
            </div>
          </div>
          <Button
            onClick={onDeleteSection}
            size="sm"
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>


      {/* Basic Properties and Section Status - Side by Side */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="grid grid-cols-2 gap-4">
          {/* Basic Properties Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Propiedades básicas
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la sección
                </label>
                <Input
                  value={section.label}
                  onChange={(e) => onUpdate(section.id, { label: e.target.value })}
                  className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Nombre de la sección"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ancho (px)
                  </label>
                  <Input
                    type="number"
                    value={section.width}
                    onChange={(e) => onUpdate(section.id, { width: parseInt(e.target.value) || 200 })}
                    className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alto (px)
                  </label>
                  <Input
                    type="number"
                    value={section.height}
                    onChange={(e) => onUpdate(section.id, { height: parseInt(e.target.value) || 150 })}
                    className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Statistics Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Estado de la sección
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{section.rows.length}</div>
                <div className="text-xs text-gray-600">Filas</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{totalSeats}</div>
                <div className="text-xs text-gray-600">Asientos</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {section.rows.reduce((sum, row) => 
                    sum + row.seats.filter(seat => seat.status === 'available').length, 0
                  )}
                </div>
                <div className="text-xs text-green-600">Libres</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">
                  {section.rows.reduce((sum, row) => 
                    sum + row.seats.filter(seat => seat.status === 'occupied').length, 0
                  )}
                </div>
                <div className="text-xs text-red-600">Ocupados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Rows and Seats Management */}
      <div className="flex-1 p-4 bg-white overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              Gestión de Filas y Asientos
            </h3>
            
            {/* Add Row Controls */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Asientos por fila:</span>
              <Input
                type="number"
                value={newRowSeatCount}
                onChange={(e) => setNewRowSeatCount(parseInt(e.target.value) || 10)}
                className="w-20 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                min="1"
                max="50"
              />
              <Button
                onClick={() => onAddRow(section.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar fila
              </Button>
            </div>
          </div>

          {/* Rows List with Seat Labels */}
          {section.rows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-base font-medium mb-2">No hay filas en esta sección</p>
              <p className="text-sm">Usa el botón de arriba para agregar la primera fila</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto">
              {section.rows.map((row, index) => (
                <div key={row.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  {/* Row Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-gray-900">
                        {row.label}
                      </span>
                      <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">
                        {row.seats.length} asientos
                      </span>
                    </div>
                    <Button
                      onClick={() => onDeleteRow(section.id, row.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Seat Labels Display */}
                  {row.seats.length > 0 && (
                    <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">Asientos (click para seleccionar):</div>
                      <div className="flex flex-wrap gap-1">
                        {row.seats.map((seat, seatIndex) => (
                          <button
                            key={seat.id}
                            onClick={() => {
                              // Toggle seat selection
                              const updatedSection = {
                                ...section,
                                rows: section.rows.map(r => 
                                  r.id === row.id 
                                    ? {
                                        ...r,
                                        seats: r.seats.map(s => 
                                          s.id === seat.id 
                                            ? { ...s, status: s.status === 'selected' ? 'available' : 'selected' }
                                            : s
                                        )
                                      }
                                    : r
                                )
                              }
                              onUpdate(section.id, updatedSection)
                            }}
                            className={`px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
                              seat.status === 'available' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : seat.status === 'occupied' 
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : seat.status === 'selected'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {seat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Seat Status Controls */}
                  {row.seats.some(seat => seat.status === 'selected') && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-800 mb-2">
                        Asientos seleccionados: {row.seats.filter(seat => seat.status === 'selected').length}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            const updatedSection = {
                              ...section,
                              rows: section.rows.map(r => 
                                r.id === row.id 
                                  ? {
                                      ...r,
                                      seats: r.seats.map(s => 
                                        s.status === 'selected' ? { ...s, status: 'occupied' } : s
                                      )
                                    }
                                  : r
                              )
                            }
                            onUpdate(section.id, updatedSection)
                          }}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
                        >
                          Marcar como ocupados
                        </Button>
                        <Button
                          onClick={() => {
                            const updatedSection = {
                              ...section,
                              rows: section.rows.map(r => 
                                r.id === row.id 
                                  ? {
                                      ...r,
                                      seats: r.seats.map(s => 
                                        s.status === 'selected' ? { ...s, status: 'available' } : s
                                      )
                                    }
                                  : r
                              )
                            }
                            onUpdate(section.id, updatedSection)
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
                        >
                          Marcar como libres
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Add Seats Controls */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Agregar asientos:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => onAddSeats(section.id, row.id, 1)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
                        >
                          +1
                        </Button>
                        <Button
                          onClick={() => onAddSeats(section.id, row.id, 5)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
                        >
                          +5
                        </Button>
                        <Button
                          onClick={() => onAddSeats(section.id, row.id, 10)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm"
                        >
                          +10
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}