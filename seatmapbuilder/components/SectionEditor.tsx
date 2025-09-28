"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Plus, Trash2, ChevronLeft, Edit3 } from "lucide-react"
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
  onDeleteSelectedSeats: (sectionId: string, rowId: string) => void
  onDeleteSection: () => void
  hasSelectedSection: boolean
  canvasCollapsed: boolean
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
  onDeleteSelectedSeats,
  onDeleteSection, 
  hasSelectedSection, 
  canvasCollapsed 
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
              title={canvasCollapsed ? "Mostrar canvas" : "Ocultar canvas"}
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${canvasCollapsed ? 'rotate-180' : ''}`} />
            </button>
          <div>
              <h2 className="text-lg font-semibold text-gray-900">Editor de Sección</h2>
              <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                Editando: 
                <input
              value={section.label}
              onChange={(e) => onUpdate(section.id, { label: e.target.value })}
                  className="ml-1 font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-white focus:border-b focus:border-blue-500 px-1 py-0.5 rounded"
              placeholder="Nombre de la sección"
            />
                <Edit3 className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>
          {hasSelectedSection && (
            <Button
              onClick={onDeleteSection}
              size="sm"
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
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
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Forma de la sección
              </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Rectángulo horizontal */}
              <button
                onClick={() => onUpdate(section.id, { width: 280, height: 160 })}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  section.width === 280 && section.height === 160
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-full h-8 bg-gray-300 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-600">280×160</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">Horizontal</p>
              </button>

              {/* Cuadrado */}
              <button
                onClick={() => onUpdate(section.id, { width: 200, height: 200 })}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  section.width === 200 && section.height === 200
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-12 h-12 bg-gray-300 rounded mx-auto flex items-center justify-center">
                  <span className="text-xs text-gray-600">200×200</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">Cuadrado</p>
              </button>

              {/* Rectángulo vertical */}
              <button
                onClick={() => onUpdate(section.id, { width: 190, height: 320 })}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  section.width === 190 && section.height === 320
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-8 h-12 bg-gray-300 rounded mx-auto flex items-center justify-center">
                  <span className="text-xs text-gray-600">190×320</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">Vertical</p>
              </button>

              {/* Rectángulo grande */}
              <button
                onClick={() => onUpdate(section.id, { width: 320, height: 200 })}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  section.width === 320 && section.height === 200
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-full h-8 bg-gray-300 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-600">320×200</span>
            </div>
                <p className="text-xs text-gray-600 mt-2 text-center">Grande</p>
              </button>
            </div>
          </div>
        </div>
      </div>

          {/* Section Statistics Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
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
               <div className="text-center p-3 bg-emerald-50 rounded-lg">
                 <div className="text-xl font-bold text-emerald-600">
                   {section.rows.reduce((sum, row) => 
                     sum + row.seats.filter(seat => seat.status === 'available').length, 0
                   )}
                 </div>
                 <div className="text-xs text-emerald-600">Libres</div>
               </div>
               <div className="text-center p-3 bg-violet-50 rounded-lg">
                 <div className="text-xl font-bold text-violet-600">
                   {section.rows.reduce((sum, row) => 
                     sum + row.seats.filter(seat => seat.status === 'occupied').length, 0
                   )}
                 </div>
                 <div className="text-xs text-violet-600">Ocupados</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Rows and Seats Management */}
      <div className="flex-1 p-4 bg-white overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
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
                          <div key={seat.id} className="relative group">
                            <button
                              onClick={(e) => {
                                const isMultiSelect = e.metaKey || e.ctrlKey
                                
                                if (isMultiSelect) {
                                  // Selección por rango
                                  const selectedSeats = row.seats.filter(s => s.status === 'selected')
                                  if (selectedSeats.length > 0) {
                                    // Encontrar el primer asiento seleccionado
                                    const firstSelectedIndex = row.seats.findIndex(s => s.status === 'selected')
                                    const currentIndex = seatIndex
                                    
                                    // Determinar el rango
                                    const startIndex = Math.min(firstSelectedIndex, currentIndex)
                                    const endIndex = Math.max(firstSelectedIndex, currentIndex)
                                    
                                    // Seleccionar todos los asientos en el rango
                                    const updatedSection = {
                                      ...section,
                                      rows: section.rows.map(r => 
                                        r.id === row.id 
                                          ? {
                                              ...r,
                                              seats: r.seats.map((s, index) => 
                                                index >= startIndex && index <= endIndex
                                                  ? { ...s, status: 'selected' as const }
                                                  : s
                                              )
                                            }
                                          : r
                                      )
                                    }
                                    onUpdate(section.id, updatedSection)
                                  } else {
                                    // Si no hay asientos seleccionados, seleccionar solo este
                                    const updatedSection = {
                                      ...section,
                                      rows: section.rows.map(r => 
                                        r.id === row.id 
                                          ? {
                                              ...r,
                                              seats: r.seats.map(s => 
                                                s.id === seat.id 
                                                  ? { ...s, status: 'selected' as const }
                                                  : s
                                              )
                                            }
                                          : r
                                      )
                                    }
                                    onUpdate(section.id, updatedSection)
                                  }
                                } else {
                                  // Toggle seat selection normal
                                  const updatedSection = {
                                    ...section,
                                    rows: section.rows.map(r => 
                                      r.id === row.id 
                                        ? {
                                            ...r,
                                            seats: r.seats.map(s => 
                                              s.id === seat.id 
                                                ? { ...s, status: s.status === 'selected' ? 'available' as const : 'selected' as const }
                                                : s
                                            )
                                          }
                                        : r
                                    )
                                  }
                                  onUpdate(section.id, updatedSection)
                                }
                              }}
                               className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-all duration-200 ${
                                 seat.status === 'available' 
                                   ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 focus:ring-2 focus:ring-emerald-300' 
                                   : seat.status === 'occupied' 
                                   ? 'bg-violet-100 text-violet-800 hover:bg-violet-200 focus:ring-2 focus:ring-violet-300'
                                   : seat.status === 'selected'
                                   ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-2 focus:ring-blue-300'
                                   : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300'
                               }`}
                            >
                              {seat.label}
                            </button>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              {seat.status === 'available' ? 'Libre' : 
                               seat.status === 'occupied' ? 'Ocupado' : 
                               seat.status === 'selected' ? 'Seleccionado' : 'Sin etiqueta'}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
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
                                         s.status === 'selected' ? { ...s, status: 'occupied' as const } : s
                                       )
                                     }
                                   : r
                               )
                             }
                             onUpdate(section.id, updatedSection)
                           }}
                           size="sm"
                           className="bg-violet-600 hover:bg-violet-700 focus:ring-2 focus:ring-violet-300 disabled:bg-violet-300 disabled:cursor-not-allowed text-white px-3 py-1 text-sm font-medium transition-all duration-200"
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
                                         s.status === 'selected' ? { ...s, status: 'available' as const } : s
                                       )
                                     }
                                   : r
                               )
                             }
                             onUpdate(section.id, updatedSection)
                           }}
                           size="sm"
                           className="bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white px-3 py-1 text-sm font-medium transition-all duration-200"
                         >
                           Marcar como libres
                         </Button>
                        <Button
                          onClick={() => onDeleteSelectedSeats(section.id, row.id)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-300 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-3 py-1 text-sm font-medium transition-all duration-200"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
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
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                        >
                          +1
                        </Button>
                        <Button
                          onClick={() => onAddSeats(section.id, row.id, 5)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                        >
                          +5
                        </Button>
                        <Button
                          onClick={() => onAddSeats(section.id, row.id, 10)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
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
