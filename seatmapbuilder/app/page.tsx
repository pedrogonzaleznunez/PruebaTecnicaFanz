"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Plus, Trash2, Grid3X3, ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { SeatCanvas } from "../components/SeatCanvas"
import { JsonManager } from "../components/JsonManager"
import type { Platea, Row, Seat } from "../lib/schema"
import { generatePlateaId, generateFilaId, generateSeatId, extractPlateaNumber, extractFilaNumberFromFilaId } from "../lib/id-generator"
import { ConfirmationDialog } from "../components/ui/confirmation-dialog"

export default function SeatMapBuilder() {
  const [plateas, setPlateas] = useState<Platea[]>([])
  const [selectedPlatea, setSelectedPlatea] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [mapName, setMapName] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Toggle sidebar
  const toggleSidebar = () => {
    console.log('Toggle sidebar clicked, current state:', sidebarCollapsed)
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Confirmation dialogs
  const [confirmations, setConfirmations] = useState({
    deleteRows: false,
    clearMap: false
  })
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: any } | null>(null)

  const addPlatea = (count = 1) => {
    const newPlateas: Platea[] = []
    for (let i = 0; i < count; i++) {
      const plateaNumber = plateas.length + i + 1
      const newPlatea: Platea = {
        id: generatePlateaId(plateaNumber),
        label: `Platea ${plateaNumber}`,
        rows: [],
        selected: false,
      }
      newPlateas.push(newPlatea)
    }
    setPlateas([...plateas, ...newPlateas])
  }

  const addRowToSelectedPlatea = (count = 1) => {
    if (!selectedPlatea) return

    setPlateas(plateas.map(platea => {
      if (platea.id === selectedPlatea) {
        const plateaNumber = extractPlateaNumber(platea.id)
        const newRows: Row[] = []
        for (let i = 0; i < count; i++) {
          const rowNumber = platea.rows.length + i + 1
          const newRow: Row = {
            id: generateFilaId(plateaNumber, rowNumber),
            label: `Fila ${rowNumber}`,
            seats: [],
            selected: false,
          }
          newRows.push(newRow)
        }
        return { ...platea, rows: [...platea.rows, ...newRows] }
      }
      return platea
    }))
  }

  const deleteSelectedRows = () => {
    if (selectedRows.length === 0) return
    setPendingAction({ type: 'deleteRows', data: { count: selectedRows.length } })
    setConfirmations(prev => ({ ...prev, deleteRows: true }))
  }

  const performDeleteRows = () => {
    setPlateas(plateas.map(platea => ({
      ...platea,
      rows: platea.rows.filter(row => !selectedRows.includes(row.id))
    })))
    setSelectedRows([])
  }

  const addSeatsToSelectedRows = (seatCount: number) => {
    if (selectedRows.length === 0) return

    setPlateas(plateas.map(platea => {
      const plateaNumber = extractPlateaNumber(platea.id)
      return {
        ...platea,
        rows: platea.rows.map(row => {
          if (selectedRows.includes(row.id)) {
            const rowNumber = extractFilaNumberFromFilaId(row.id)
            const newSeats: Seat[] = []
            for (let i = 0; i < seatCount; i++) {
              const seatNumber = row.seats.length + i + 1
              // Generar etiqueta en formato A1, A2, B1, B2, etc.
              const letter = String.fromCharCode(65 + Math.floor((row.seats.length + i) / 10))
              const number = ((row.seats.length + i) % 10) + 1
              newSeats.push({
                id: generateSeatId(plateaNumber, rowNumber, seatNumber),
                label: `${letter}${number}`,
                status: "available",
                x: (row.seats.length + i) * 45 + 20,
                y: 10,
              })
            }
            return { ...row, seats: [...row.seats, ...newSeats] }
          }
          return row
        })
      }
    }))
  }

  const clearMap = () => {
    if (plateas.length > 0) {
      setConfirmations(prev => ({ ...prev, clearMap: true }))
    } else {
      performClearMap()
    }
  }

  const performClearMap = () => {
    setPlateas([])
    setSelectedPlatea(null)
    setSelectedRows([])
    setMapName("")
  }

  // Confirmation handlers
  const handleConfirmation = (type: string) => {
    switch (type) {
      case 'deleteRows':
        performDeleteRows()
        break
      case 'clearMap':
        performClearMap()
        break
    }
    setPendingAction(null)
  }

  const closeConfirmation = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({ ...prev, [key]: false }))
    setPendingAction(null)
  }

  // Calcular estadísticas
  const totalPlateas = plateas.length
  const totalRows = plateas.reduce((sum, platea) => sum + platea.rows.length, 0)
  const totalSeats = plateas.reduce((sum, platea) => 
    sum + platea.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0), 0)
  const availableSeats = plateas.reduce((sum, platea) => 
    sum + platea.rows.reduce((rowSum, row) => 
      rowSum + row.seats.filter(s => s.status === "available").length, 0), 0)
  const occupiedSeats = plateas.reduce((sum, platea) => 
    sum + platea.rows.reduce((rowSum, row) => 
      rowSum + row.seats.filter(s => s.status === "occupied").length, 0), 0)
  const selectedSeats = plateas.reduce((sum, platea) => 
    sum + platea.rows.reduce((rowSum, row) => 
      rowSum + row.seats.filter(s => s.status === "selected").length, 0), 0)

  const markSelectedSeatsAs = (status: "available" | "occupied") => {
    setPlateas(plateas.map(platea => ({
      ...platea,
      rows: platea.rows.map(row => ({
        ...row,
        seats: row.seats.map(seat => 
          seat.status === "selected" ? { ...seat, status } : seat
        ),
      }))
    })))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                console.log('Button clicked!')
                toggleSidebar()
              }}
              className="p-2 border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
              title={sidebarCollapsed ? "Mostrar panel lateral" : "Ocultar panel lateral"}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <div className="p-2 rounded-xl bg-blue-500">
              <Grid3X3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">SeatMapBuilder</h1>
              <p className="text-xs text-gray-500">Editor de mapas de asientos</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={clearMap}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300 rounded-2xl shadow-sm"
            >
              Nuevo mapa
            </Button>
            <JsonManager
              plateas={plateas}
              onPlateaChange={setPlateas}
              mapName={mapName}
              onMapNameChange={setMapName}
              onClearMap={clearMap}
            />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-81px)]">
        {/* Left Sidebar - Actions */}
        <div 
          className={`border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-0 p-0 overflow-hidden' : 'w-72 p-4 overflow-y-auto'
          }`}
        >
          {!sidebarCollapsed && (
            <div className="space-y-4">
            {/* Platea Management */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Plateas</h2>
              <div className="space-y-2">
                <Button 
                  onClick={() => addPlatea(1)} 
                  size="sm"
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Agregar platea
                </Button>
                <Button 
                  onClick={() => addPlatea(3)} 
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Agregar 3 plateas
                </Button>
              </div>
            </div>

            {/* Platea Selection */}
            {totalPlateas > 0 && (
              <div className="border border-gray-200 rounded-2xl p-4">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Seleccionar Platea</h2>
                <div className="space-y-2">
                  {plateas.map((platea) => (
                    <Button
                      key={platea.id}
                      variant={selectedPlatea === platea.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPlatea(platea.id)}
                      className={`w-full justify-start rounded-xl text-sm ${
                        selectedPlatea === platea.id 
                          ? "bg-blue-500 hover:bg-blue-600 text-white" 
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>{platea.label}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                          {platea.rows.length} filas
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Row Management */}
            {selectedPlatea && (
              <div className="border border-gray-200 rounded-2xl p-4">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Filas</h2>
                <div className="space-y-2">
                  <Button 
                    onClick={() => addRowToSelectedPlatea(1)} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    <span className="truncate">
                      Agregar fila
                    </span>
                  </Button>
                  <Button 
                    onClick={() => addRowToSelectedPlatea(5)} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Agregar 5 filas
                  </Button>
                </div>
              </div>
            )}

            {/* Seat Management */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Asientos</h2>
              <div className="space-y-2">
                <Button
                  onClick={() => addSeatsToSelectedRows(1)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm disabled:opacity-50"
                  disabled={selectedRows.length === 0}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Agregar 1 asiento
                </Button>
                <Button
                  onClick={() => addSeatsToSelectedRows(5)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm disabled:opacity-50"
                  disabled={selectedRows.length === 0}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Agregar 5 asientos
                </Button>
                <Button
                  onClick={() => addSeatsToSelectedRows(10)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm disabled:opacity-50"
                  disabled={selectedRows.length === 0}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Agregar 10 asientos
                </Button>
                <Button
                  onClick={deleteSelectedRows}
                  variant="destructive"
                  size="sm"
                  className="w-full justify-start bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm disabled:opacity-50"
                  disabled={selectedRows.length === 0}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Borrar filas seleccionadas
                </Button>
              </div>
            </div>

            {/* Map Name */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Nombre del mapa</h2>
              <Input
                placeholder="Ingresa el nombre del mapa"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-400 rounded-xl text-sm"
              />
            </div>

            {/* Selected Seats Actions */}
            {selectedSeats > 0 && (
              <div className="border border-gray-200 rounded-2xl p-4">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">
                  Asientos Seleccionados ({selectedSeats})
                </h2>
                <div className="space-y-2">
                  <Button 
                    onClick={() => markSelectedSeatsAs("available")} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start border-green-300 text-green-700 hover:bg-green-50 rounded-xl text-sm"
                  >
                    <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                    Marcar como Libres
                  </Button>
                  <Button 
                    onClick={() => markSelectedSeatsAs("occupied")} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl text-sm"
                  >
                    <div className="w-3 h-3 rounded-full bg-blue-900 mr-2"></div>
                    Marcar como Ocupados
                  </Button>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="border border-gray-200 rounded-2xl p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Estadísticas</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Plateas:</span>
                  <span className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-lg text-xs">
                    {totalPlateas}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Filas:</span>
                  <span className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-lg text-xs">
                    {totalRows}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Asientos:</span>
                  <span className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-lg text-xs">
                    {totalSeats}
                  </span>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col relative" style={{ backgroundColor: '#F9FAFB' }}>
          {/* Floating sidebar toggle button when collapsed
          {sidebarCollapsed && (
            // <button
            //   onClick={() => {
            //     console.log('Floating button clicked!')
            //     toggleSidebar()
            //   }}
            //   className="absolute top-4 left-4 z-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg p-3 transition-colors"
            //   title="Mostrar panel lateral"
            // >
            //   <Menu className="h-4 w-4" />
            // </button>
          )} */}
          
          {/* Canvas */}
          <div className="flex-1 p-8">
            <SeatCanvas
              plateas={plateas}
              onPlateaChange={setPlateas}
              selectedRows={selectedRows}
              onRowSelectionChange={setSelectedRows}
            />
          </div>

          {/* Legend */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                  <span className="text-gray-700 text-sm">Libre ({availableSeats})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-900"></div>
                  <span className="text-gray-700 text-sm">Ocupado ({occupiedSeats})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600"></div>
                  <span className="text-gray-700 text-sm">Seleccionado ({selectedSeats})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-300"></div>
                  <span className="text-gray-700 text-sm">Sin etiqueta</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                <span className="font-medium">Controles:</span> Arrastra: mover • Click izq: seleccionar • Click der: ocupar/liberar
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmations.deleteRows}
        onClose={() => closeConfirmation('deleteRows')}
        onConfirm={() => handleConfirmation('deleteRows')}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres borrar ${pendingAction?.data?.count || 0} fila(s)?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        details={["Esta acción no se puede deshacer", "Todos los asientos de estas filas también se eliminarán"]}
      />

      <ConfirmationDialog
        open={confirmations.clearMap}
        onClose={() => closeConfirmation('clearMap')}
        onConfirm={() => handleConfirmation('clearMap')}
        title="Nuevo mapa"
        message="¿Estás seguro de que quieres crear un nuevo mapa?"
        confirmText="Crear nuevo"
        cancelText="Cancelar"
        variant="warning"
        details={["Se perderán todos los cambios no guardados", "Esta acción no se puede deshacer"]}
      />
    </div>
  )
}