"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Plus, Trash2, Grid3X3, ChevronLeft, ChevronRight, Menu, Save, Edit3 } from "lucide-react"
import { SeatCanvas } from "../components/SeatCanvas"
import { JsonManager } from "../components/JsonManager"
import type { Section, Row, Seat } from "../lib/schema"
import { generateSectionId, generateFilaId, generateSeatId, extractSectionNumber, extractFilaNumberFromFilaId } from "../lib/id-generator"
import { ConfirmationDialog } from "../components/ui/confirmation-dialog"
import { Accordion } from "../components/ui/accordion"
import { LoadingScreen } from "../components/LoadingScreen"

export default function SeatMapBuilder() {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [mapName, setMapName] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Toggle sidebar
  const toggleSidebar = () => {
    console.log('Toggle sidebar clicked, current state:', sidebarCollapsed)
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Toggle platea selection
  const toggleSectionSelection = (sectionId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 2 seconds loading

    return () => clearTimeout(timer)
  }, [])

  // Listen for platea selection from canvas
  useEffect(() => {
    const handleSelectSectionInSidebar = (event: CustomEvent) => {
      const { sectionId } = event.detail
      setSelectedSection(sectionId)
    }

    window.addEventListener('selectSectionInSidebar', handleSelectSectionInSidebar as EventListener)
    
    return () => {
      window.removeEventListener('selectSectionInSidebar', handleSelectSectionInSidebar as EventListener)
    }
  }, [])

  // Calculate selected seats count
  const selectedSeats = sections.reduce((sum, platea) => 
    sum + platea.rows.reduce((rowSum, row) => 
      rowSum + row.seats.filter(seat => seat.status === 'selected').length, 0), 0)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // DEL key - Delete selected rows or seats
      if (event.key === 'Delete') {
        if (selectedRows.length > 0) {
          deleteSelectedRows()
        } else if (selectedSeats > 0) {
          deleteSelectedSeats()
        }
      }
      
      // CTRL+Z - Undo (placeholder for future implementation)
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault()
        // TODO: Implement undo functionality
        console.log('Undo functionality not yet implemented')
      }
      
      // CTRL+S - Save map
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault()
        saveMap()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedRows, selectedSeats])

  // Confirmation dialogs
  const [confirmations, setConfirmations] = useState({
    deleteRows: false,
    deleteSeats: false,
    deleteSections: false,
    clearMap: false
  })
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: any } | null>(null)

  const addSection = (count = 1) => {
    const newSections: Section[] = []
    for (let i = 0; i < count; i++) {
      const sectionNumber = sections.length + i + 1
      const newSection: Section = {
        id: generateSectionId(sectionNumber),
        label: `Section ${sectionNumber}`,
        rows: [],
        selected: false,
      }
      newSections.push(newSection)
    }
    setSections([...sections, ...newSections])
    
    // Auto-seleccionar la primera platea nueva
    if (newSections.length > 0) {
      setSelectedSection(newSections[0].id)
    }
  }

  const addRowToSelectedSection = (count = 1) => {
    if (!selectedSection) return

    setSections(sections.map(platea => {
      if (platea.id === selectedSection) {
        const sectionNumber = extractSectionNumber(platea.id)
        const newRows: Row[] = []
        for (let i = 0; i < count; i++) {
          const rowNumber = platea.rows.length + i + 1
          const newRow: Row = {
            id: generateFilaId(sectionNumber, rowNumber),
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

  const addRowToSpecificSection = (sectionId: string, count = 1) => {
    setSections(sections.map(platea => {
      if (platea.id === sectionId) {
        const sectionNumber = extractSectionNumber(platea.id)
        const newRows: Row[] = []
        for (let i = 0; i < count; i++) {
          const rowNumber = platea.rows.length + i + 1
          const newRow: Row = {
            id: generateFilaId(sectionNumber, rowNumber),
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
    
    // Auto-seleccionar la platea en el sidebar
    setSelectedSection(sectionId)
  }

  const deleteSelectedRows = () => {
    if (selectedRows.length === 0) return
    setPendingAction({ type: 'deleteRows', data: { count: selectedRows.length } })
    setConfirmations(prev => ({ ...prev, deleteRows: true }))
  }

  const performDeleteRows = () => {
    setSections(sections.map(platea => ({
      ...platea,
      rows: platea.rows.filter(row => !selectedRows.includes(row.id))
    })))
    setSelectedRows([])
  }

  const deleteSelectedSeats = () => {
    if (selectedSeats === 0) return
    setPendingAction({ type: 'deleteSeats', data: { count: selectedSeats } })
    setConfirmations(prev => ({ ...prev, deleteSeats: true }))
  }

  const deleteSelectedSections = () => {
    if (selectedSections.length === 0) return
    setPendingAction({ type: 'deleteSections', data: { count: selectedSections.length } })
    setConfirmations(prev => ({ ...prev, deleteSections: true }))
  }

  const performDeleteSeats = () => {
    setSections(sections.map(platea => ({
      ...platea,
      rows: platea.rows.map(row => ({
        ...row,
        seats: row.seats.filter(seat => seat.status !== 'selected')
      }))
    })))
  }

  const performDeleteSections = () => {
    setSections(sections.filter(section => !selectedSections.includes(section.id)))
    setSelectedSections([])
    setSelectedSection(null)
  }

  const saveMap = () => {
    // Auto-save functionality - could be extended to save to localStorage or backend
    const mapData = {
      name: mapName || 'Mapa sin nombre',
      sections,
      createdAt: new Date().toISOString(),
      version: '1.0'
    }
    
    // Save to localStorage as backup
    localStorage.setItem('seatmapbuilder_autosave', JSON.stringify(mapData))
    
    // Show success feedback
    console.log('Mapa guardado automáticamente')
  }

  const addSeatsToSelectedRows = (seatCount: number) => {
    if (selectedRows.length === 0) return

    setSections(sections.map(platea => {
      const sectionNumber = extractSectionNumber(platea.id)
      return {
        ...platea,
        rows: platea.rows.map(row => {
          if (selectedRows.includes(row.id)) {
            const rowNumber = extractFilaNumberFromFilaId(row.id)
            const newSeats: Seat[] = []
            for (let i = 0; i < seatCount; i++) {
              const seatNumber = row.seats.length + i + 1
              // Generar etiqueta en formato A1, A2, ..., A10, B1, B2, ..., B10, etc.
              const seatIndexInRow = row.seats.length + i
              const letterIndex = Math.floor(seatIndexInRow / 10)
              const numberInGroup = (seatIndexInRow % 10) + 1
              const letter = String.fromCharCode(65 + letterIndex) // A, B, C, etc.
              newSeats.push({
                id: generateSeatId(sectionNumber, rowNumber, seatNumber),
                label: `${letter}${numberInGroup}`,
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
    if (sections.length > 0) {
      setConfirmations(prev => ({ ...prev, clearMap: true }))
    } else {
      performClearMap()
    }
  }

  const performClearMap = () => {
    setSections([])
    setSelectedSection(null)
    setSelectedRows([])
    setMapName("")
  }

  // Confirmation handlers
  const handleConfirmation = (type: string) => {
    switch (type) {
      case 'deleteRows':
        performDeleteRows()
        break
      case 'deleteSeats':
        performDeleteSeats()
        break
      case 'deleteSections':
        performDeleteSections()
        break
      case 'clearMap':
        performClearMap()
        break
    }
    setConfirmations(prev => ({ ...prev, [type]: false }))
    setPendingAction(null)
  }

  const closeConfirmation = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({ ...prev, [key]: false }))
    setPendingAction(null)
  }

  // Calcular estadísticas
  const totalSections = sections.length
  const totalRows = sections.reduce((sum, platea) => sum + platea.rows.length, 0)
  const totalSeats = sections.reduce((sum, platea) => 
    sum + platea.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0), 0)
  const availableSeats = sections.reduce((sum, platea) => 
    sum + platea.rows.reduce((rowSum, row) => 
      rowSum + row.seats.filter(s => s.status === "available").length, 0), 0)
  const occupiedSeats = sections.reduce((sum, platea) => 
    sum + platea.rows.reduce((rowSum, row) => 
      rowSum + row.seats.filter(s => s.status === "occupied").length, 0), 0)

  const markSelectedSeatsAs = (status: "available" | "occupied") => {
    setSections(sections.map(platea => ({
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
      <header className="border-b border-gray-200" style={{ backgroundColor: '#E8F4FB' }}>
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
            <div className="flex items-center gap-3 ml-6">
              <div className="relative">
                <Input
                  placeholder="Nombre del mapa"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-400 rounded-xl text-sm w-48 pr-8"
                />
                <button
                  onClick={() => {
                    const newName = prompt('Nuevo nombre del mapa:', mapName)
                    if (newName !== null) {
                      setMapName(newName)
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Editar nombre del mapa"
                >
                  <Edit3 className="h-3 w-3" />
                </button>
              </div>
              {/* <Button
                onClick={saveMap}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-xl"
                title="Guardar mapa (Ctrl+S)"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button> */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={clearMap}
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300 rounded-2xl shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo mapa
            </Button>
            <JsonManager
              sections={sections}
              onSectionChange={setSections}
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
            <div className="space-y-3">
            {/* Section Management */}
            <Accordion title="Secciones" defaultOpen={true}>
              <div className="space-y-2">
                <Button 
                  onClick={() => addSection(1)} 
                  size="sm"
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Agregar sección
                </Button>
                <Button
                  onClick={deleteSelectedSections}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl text-sm disabled:opacity-50"
                  disabled={selectedSections.length === 0}
                  style={{ borderColor: '#fca5a5', color: '#dc2626' }}
                >
                  <Trash2 className="h-3 w-3 mr-2" style={{ color: '#dc2626' }} />
                  Borrar secciones selecc.
                </Button>
              </div>
            </Accordion>

            {/* Section Selection */}
            <Accordion 
              title="Seleccionar Sección" 
              defaultOpen={true}
              disabled={totalSections === 0}
            >
              {totalSections > 0 && (
                <div className="space-y-2">
                  {sections.map((platea) => (
                    <Button
                      key={platea.id}
                      variant={selectedSection === platea.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSection(platea.id)}
                      className={`w-full justify-start rounded-xl text-sm ${
                        selectedSection === platea.id 
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
              )}
            </Accordion>

            {/* Row Management */}
            <Accordion 
              title="Filas" 
              defaultOpen={true}
              disabled={!selectedSection}
            >
              {selectedSection && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => addRowToSelectedSection(1)} 
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
                    onClick={() => addRowToSelectedSection(5)} 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Agregar 5 filas
                  </Button>
                  <Button
                    onClick={deleteSelectedRows}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl text-sm disabled:opacity-50"
                    disabled={selectedRows.length === 0}
                    style={{ borderColor: '#fca5a5', color: '#dc2626' }}

                  >
                    <Trash2 className="h-3 w-3 mr-2" style={{ color: '#dc2626' }} />
                    Borrar filas selec.
                  </Button>
                </div>
              )}
            </Accordion>

            {/* Seat Management */}
            <Accordion 
              title="Asientos" 
              defaultOpen={true}
              disabled={selectedRows.length === 0}
            >
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
                  onClick={deleteSelectedSeats}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl text-sm disabled:opacity-50"
                  disabled={selectedSeats === 0}
                  style={{ borderColor: '#fca5a5', color: '#dc2626' }}
                >
                  <Trash2 className="h-3 w-3 mr-2" style={{ color: '#dc2626' }} />
                  Borrar asientos selec.
                </Button>
              </div>
            </Accordion>



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
              sections={sections}
              onSectionChange={setSections}
              selectedRows={selectedRows}
              onRowSelectionChange={setSelectedRows}
              selectedSections={selectedSections}
              onSectionSelectionChange={setSelectedSections}
              selectedSeats={selectedSeats}
              onMarkSelectedSeatsAs={markSelectedSeatsAs}
              onAddRowToSection={(sectionId) => {
                addRowToSpecificSection(sectionId, 1)
              }}
            />
          </div>

          {/* Legend and Statistics */}
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
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                  <span className="font-medium">Controles:</span> Arrastra: mover • Click izq: seleccionar • Click der: ocupar/liberar
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
                  <span className="font-medium">Estadísticas:</span> {totalSections} sections • {totalRows} filas • {totalSeats} asientos
                </div>
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
        open={confirmations.deleteSeats}
        onClose={() => closeConfirmation('deleteSeats')}
        onConfirm={() => handleConfirmation('deleteSeats')}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres borrar ${pendingAction?.data?.count || 0} asiento(s)?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        details={["Esta acción no se puede deshacer", "Los asientos seleccionados se eliminarán permanentemente"]}
      />

      <ConfirmationDialog
        open={confirmations.deleteSections}
        onClose={() => closeConfirmation('deleteSections')}
        onConfirm={() => handleConfirmation('deleteSections')}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres borrar ${pendingAction?.data?.count || 0} sección(es)?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        details={["Esta acción no se puede deshacer", "Todas las filas y asientos de estas secciones también se eliminarán"]}
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

      {/* Loading Screen */}
      <LoadingScreen isLoading={isLoading} message="Cargando SeatMapBuilder..." />
    </div>
  )
}