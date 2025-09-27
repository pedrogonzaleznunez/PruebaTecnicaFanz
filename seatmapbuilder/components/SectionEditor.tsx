"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Plus, Trash2 } from "lucide-react"
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
      <div className="h-full bg-white flex items-center justify-center">
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
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Editor de Sección</h2>
            <p className="text-sm text-gray-600 mt-1">
              Editando: <span className="font-medium text-gray-900">{section.label}</span>
            </p>
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

      {/* Basic properties */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Propiedades básicas</h3>
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
                Ancho
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
                Alto
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

      {/* Canvas de asientos */}
      <div className="flex-1 relative bg-gray-50">
        <SeatEditor
          section={section}
          onSectionUpdate={(updatedSection) => onUpdate(section.id, updatedSection)}
          selectedRows={selectedRows}
          onRowSelectionChange={onRowSelectionChange}
          selectedSeats={selectedSeats}
          onMarkSelectedSeatsAs={onMarkSelectedSeatsAs}
          onAddRow={onAddRow}
        />
      </div>

      {/* Row management */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-900">Gestión de filas</h3>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={newRowSeatCount}
              onChange={(e) => setNewRowSeatCount(parseInt(e.target.value) || 10)}
              className="w-16 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              min="1"
              max="50"
            />
            <Button
              onClick={() => onAddRow(section.id)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar fila
            </Button>
          </div>
        </div>

        {section.rows.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base">No hay filas en esta sección</p>
            <p className="text-sm">Agrega la primera fila para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto">
            {section.rows.map((row, index) => (
              <div key={row.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-gray-900">
                    {row.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {row.seats.length} asientos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onAddSeats(section.id, row.id, 1)}
                    size="sm"
                    variant="outline"
                    className="text-sm bg-white border-gray-300 hover:bg-gray-50"
                  >
                    +1 asiento
                  </Button>
                  <Button
                    onClick={() => onAddSeats(section.id, row.id, 5)}
                    size="sm"
                    variant="outline"
                    className="text-sm bg-white border-gray-300 hover:bg-gray-50"
                  >
                    +5 asientos
                  </Button>
                  <Button
                    onClick={() => onDeleteRow(section.id, row.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
