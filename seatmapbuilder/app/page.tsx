"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Grid3X3, ChevronLeft, ChevronRight, Menu, Save, Edit3 } from "lucide-react"

import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { ConfirmationDialog } from "@components/ui/confirmation-dialog"
import { JsonManager } from "@components/JsonManager"
import { SectionCanvas } from "@components/section/SectionCanvas"
import { SectionEditor } from "@components/section/SectionEditor"
import { LoadingScreen } from "@components/LoadingScreen"

import type { Section, Row, Seat } from "@lib/schema"
import { generateSectionId, generateFilaId, generateSeatId, extractSectionNumber, extractFilaNumberFromFilaId } from "@lib/id-generator"

export default function SeatMapBuilder() {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [selectedSeats, setSelectedSeats] = useState(0)
  const [mapName, setMapName] = useState("")
  const [canvasCollapsed, setCanvasCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simular carga inicial de la aplicación
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // 2 segundos de carga

    return () => clearTimeout(timer)
  }, [])

  // Listen for canvas toggle events from SectionEditor
  useEffect(() => {
    const handleToggleCanvas = () => {
      setCanvasCollapsed(!canvasCollapsed)
    }

    window.addEventListener('toggleCanvas', handleToggleCanvas)
    
    return () => {
      window.removeEventListener('toggleCanvas', handleToggleCanvas)
    }
  }, [canvasCollapsed])

  // Listen for Escape key to deselect all and Delete key to delete sections
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSections([])
        setSelectedSection(null)
      } else if (event.key === 'Delete' && selectedSections.length > 0) {
        deleteSelectedSections()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedSections])

  // Confirmation dialogs
  const [confirmations, setConfirmations] = useState({
    deleteSections: false,
    deleteRow: false,
    deleteSeats: false,
    clearMap: false
  })
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: any } | null>(null)

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ))
  }

  const handleSectionSelect = (sectionId: string, event: React.MouseEvent) => {
    // Si se hace click en el canvas vacío, deseleccionar todo
    if (sectionId === '') {
      setSelectedSections([])
      setSelectedSection(null)
      return
    }

    const isMultiSelect = event.metaKey || event.ctrlKey
    
    if (isMultiSelect) {
      // Selección múltiple
      if (selectedSections.includes(sectionId)) {
        // Deseleccionar si ya está seleccionada
        const newSelected = selectedSections.filter(id => id !== sectionId)
        setSelectedSections(newSelected)
        setSelectedSection(newSelected.length > 0 ? newSelected[0] : null)
      } else {
        // Agregar a la selección
        const newSelected = [...selectedSections, sectionId]
        setSelectedSections(newSelected)
        setSelectedSection(sectionId)
      }
    } else {
      // Selección única - pero si ya hay selección múltiple, mantenerla
      if (selectedSections.length > 1) {
        // Si hay múltiples seleccionadas, agregar esta también
        if (!selectedSections.includes(sectionId)) {
          const newSelected = [...selectedSections, sectionId]
          setSelectedSections(newSelected)
          setSelectedSection(sectionId)
        }
      } else {
        // Selección única normal
        setSelectedSections([sectionId])
        setSelectedSection(sectionId)
      }
    }
  }

  const addRowToSection = (sectionId: string, seatCount = 10) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const newRowNumber = section.rows.length + 1
    const newRow: Row = {
      id: generateFilaId(extractSectionNumber(sectionId), newRowNumber),
      label: `Fila ${newRowNumber}`,
      seats: [],
      selected: false,
    }

    // Generate seats for the new row
    for (let i = 1; i <= seatCount; i++) {
      const seatId = generateSeatId(extractSectionNumber(sectionId), newRowNumber, i)
      newRow.seats.push({
        id: seatId,
        x: (i - 1) * 30,
        y: 0,
        label: `${String.fromCharCode(64 + newRowNumber)}${i}`,
        status: "available" as const,
        meta: {},
      })
    }

    updateSection(sectionId, {
      rows: [...section.rows, newRow]
    })
  }

  const deleteRowFromSection = (sectionId: string, rowId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const row = section.rows.find(r => r.id === rowId)
    if (!row) return

    setPendingAction({ type: 'deleteRow', data: { sectionId, rowId, rowLabel: row.label } })
    setConfirmations(prev => ({ ...prev, deleteRow: true }))
  }

  const performDeleteRow = () => {
    if (pendingAction?.type === 'deleteRow' && pendingAction.data) {
      const { sectionId, rowId } = pendingAction.data
      const section = sections.find(s => s.id === sectionId)
      if (section) {
    updateSection(sectionId, {
      rows: section.rows.filter(row => row.id !== rowId)
    })
      }
    }
  }

  const addSeatsToRow = (sectionId: string, rowId: string, count: number) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const row = section.rows.find(r => r.id === rowId)
    if (!row) return

    const rowNumber = extractFilaNumberFromFilaId(rowId)
    const newSeats: Seat[] = []
    for (let i = 1; i <= count; i++) {
      const seatNumber = row.seats.length + i
      const seatId = generateSeatId(extractSectionNumber(sectionId), rowNumber, seatNumber)
      newSeats.push({
        id: seatId,
        x: (row.seats.length + i - 1) * 30,
        y: 0,
        label: `${String.fromCharCode(64 + rowNumber)}${seatNumber}`,
        status: "available" as const,
        meta: {},
      })
    }

    updateSection(sectionId, {
      rows: section.rows.map(r => 
        r.id === rowId 
          ? { ...r, seats: [...r.seats, ...newSeats] }
          : r
      )
    })
  }

  const markSelectedSeatsAs = (status: "available" | "occupied") => {
    if (!selectedSection) return

    const section = sections.find(s => s.id === selectedSection)
    if (!section) return

    const updatedSection = {
      ...section,
      rows: section.rows.map(row => ({
        ...row,
        seats: row.seats.map(seat => 
          seat.status === "selected" ? { ...seat, status } : seat
        )
      }))
    }

    updateSection(selectedSection, updatedSection)
  }

  const deleteSelectedSeats = (sectionId: string, rowId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const row = section.rows.find(r => r.id === rowId)
    if (!row) return

    const selectedSeats = row.seats.filter(seat => seat.status === 'selected')
    if (selectedSeats.length === 0) return

    setPendingAction({ 
      type: 'deleteSeats', 
      data: { 
        sectionId, 
        rowId, 
        seatCount: selectedSeats.length,
        rowLabel: row.label
      } 
    })
    setConfirmations(prev => ({ ...prev, deleteSeats: true }))
  }

  const performDeleteSeats = () => {
    if (pendingAction?.type === 'deleteSeats' && pendingAction.data) {
      const { sectionId, rowId } = pendingAction.data
      const section = sections.find(s => s.id === sectionId)
      if (section) {
        const row = section.rows.find(r => r.id === rowId)
        if (row) {
          updateSection(sectionId, {
            rows: section.rows.map(r =>
              r.id === rowId
                ? { ...r, seats: r.seats.filter(seat => seat.status !== 'selected') }
                : r
            )
          })
        }
      }
    }
  }

  const addSection = (count = 1) => {
    const newSections: Section[] = []
    for (let i = 0; i < count; i++) {
      const sectionNumber = sections.length + i + 1
      // Calculate position to avoid overlap with stadium-like layout
      const colsPerRow = 3 // Maximum sections per row for stadium feel
      const sectionWidth = 220
      const sectionHeight = 180
      const spacing = 30
      
      const col = (sections.length + i) % colsPerRow
      const row = Math.floor((sections.length + i) / colsPerRow)
      
      // Stadium-like positioning: sections closer to stage are larger
      const distanceFromStage = row
      const sizeMultiplier = Math.max(0.8, 1 - (distanceFromStage * 0.1))
      const adjustedWidth = sectionWidth * sizeMultiplier
      const adjustedHeight = sectionHeight * sizeMultiplier
      
      // Center sections and add some curve
      const centerX = 400 // Center of canvas
      const sectionSpacing = adjustedWidth + spacing
      const totalWidth = (colsPerRow - 1) * sectionSpacing
      const startX = centerX - totalWidth / 2
      
      const newSection: Section = {
        id: generateSectionId(sectionNumber),
        label: `Sección ${sectionNumber}`,
        x: startX + col * sectionSpacing,
        y: 100 + row * (adjustedHeight + spacing),
        width: adjustedWidth,
        height: adjustedHeight,
        rows: [],
        selected: false,
      }
      newSections.push(newSection)
    }
    setSections([...sections, ...newSections])
    
    // Auto-seleccionar la primera sección nueva
    if (newSections.length > 0) {
      setSelectedSection(newSections[0].id)
    }
  }

  const createStadium = () => {
    // Limpiar secciones existentes
    setSections([])
    setSelectedSection(null)
    setSelectedSections([])
    
    const newSections: Section[] = []
    
    // Dimensiones del canvas (aproximadas)
    const canvasWidth = 1200 // Ancho total del canvas
    const canvasHeight = 600 // Alto total del canvas
    const spacing = 30
    
    // Dimensiones base
    const centralWidth = 300  // Secciones centrales más anchas
    const centralHeight = 200
    const lateralWidth = 220  // Secciones laterales más altas
    const lateralHeight = 250
    
    // Calcular el centro del canvas (donde está el escenario)
    const centerX = canvasWidth / 2
    
    // Calcular posiciones para alinear con el centro del escenario
    const totalWidth = (lateralWidth * 2) + (centralWidth * 2) + (spacing * 3) // 2 laterales + 2 centrales + 3 espacios
    const startX = centerX - (totalWidth / 2) + 100 // Centrar todo el conjunto con el escenario
    
    // Crear 7 secciones en layout de estadio (6 tribunas + 1 campo central)
    const sectionsConfig = [
      // Sección 1 - Lateral izquierda superior
      { x: startX, y: 80, width: lateralWidth, height: lateralHeight, label: "Platea Izquierda Superior" },
      // Sección 2 - Central izquierda
      { x: startX + lateralWidth + spacing, y: 100, width: centralWidth, height: centralHeight, label: "Platea Central Izquierda" },
      // Sección 3 - Central derecha
      { x: startX + lateralWidth + spacing + centralWidth + spacing, y: 100, width: centralWidth, height: centralHeight, label: "Platea Central Derecha" },
      // Sección 4 - Lateral derecha superior
      { x: startX + lateralWidth + spacing + centralWidth + spacing + centralWidth + spacing, y: 80, width: lateralWidth, height: lateralHeight, label: "Platea Derecha Superior" },
      // Sección 5 - Campo Central (más cerca de las Plateas centrales)
      { x: startX + lateralWidth + spacing, y: 100 + centralHeight + spacing + 50, width: centralWidth * 2 + spacing, height: centralHeight, label: "Campo Central" },
      // Sección 6 - Lateral izquierda inferior
      { x: startX, y: 80 + lateralHeight + spacing, width: lateralWidth, height: lateralHeight, label: "Platea Izquierda Inferior" },
      // Sección 7 - Lateral derecha inferior
      { x: startX + lateralWidth + spacing + centralWidth + spacing + centralWidth + spacing, y: 80 + lateralHeight + spacing, width: lateralWidth, height: lateralHeight, label: "Platea Derecha Inferior" }
    ]
    
    sectionsConfig.forEach((config, index) => {
      const newSection: Section = {
        id: generateSectionId(index + 1),
        label: config.label,
        x: config.x,
        y: config.y,
        width: config.width,
        height: config.height,
        rows: [],
        selected: false,
      }
      newSections.push(newSection)
    })
    
    setSections(newSections)
    
    // Auto-seleccionar la primera sección central
    setSelectedSection(newSections[1].id) // Sección central izquierda
  }

  const deleteSelectedSections = () => {
    if (selectedSections.length > 0) {
      setPendingAction({ type: 'deleteSections', data: { count: selectedSections.length } })
      setConfirmations(prev => ({ ...prev, deleteSections: true }))
    }
  }

  const performDeleteSections = () => {
    if (selectedSections.length > 0) {
      setSections(sections.filter(section => !selectedSections.includes(section.id)))
      setSelectedSections([])
      setSelectedSection(null)
    }
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
    setSelectedSections([])
    setSelectedRows([])
    setMapName("")
  }

  // Confirmation handlers
  const handleConfirmation = (type: string) => {
    switch (type) {
      case 'deleteSections':
        performDeleteSections()
        break
      case 'deleteRow':
        performDeleteRow()
        break
      case 'deleteSeats':
        performDeleteSeats()
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
  const totalSections = sections.length
  const totalRows = sections.reduce((sum, section) => sum + section.rows.length, 0)
  const totalSeats = sections.reduce((sum, section) => 
    sum + section.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0), 0)
  const availableSeats = sections.reduce((sum, section) => 
    sum + section.rows.reduce((rowSum, row) => 
      rowSum + row.seats.filter(s => s.status === "available").length, 0), 0)
  const occupiedSeats = sections.reduce((sum, section) => 
    sum + section.rows.reduce((rowSum, row) => 
      rowSum + row.seats.filter(s => s.status === "occupied").length, 0), 0)
  // Mostrar pantalla de carga
  if (isLoading) {
    return <LoadingScreen message="Inicializando SeatMapBuilder..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 shadow-sm" style={{ backgroundColor: '#e7f4fc' }}>
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600">
              <Grid3X3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">SeatMapBuilder</h1>
              <p className="text-sm text-gray-500">Editor de mapas de asientos</p>
            </div>
          </div>

          {/* Centered content */}
          <div className="flex items-center gap-4">
            {/* Map name input */}
              <div className="relative">
                <Input
                  placeholder="Nombre del mapa"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                className="bg-white border-gray-300 text-gray-700 placeholder:text-gray-400 rounded-lg text-sm w-48 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            {/* Secondary actions */}
            <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={clearMap}
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300 rounded-2xl shadow-md transition-all duration-200"
            >
                <Plus className="h-4 w-4 mr-2" />
              Nuevo mapa
            </Button>
              
            <JsonManager
                plateas={sections}
                onPlateaChange={setSections}
              mapName={mapName}
              onMapNameChange={setMapName}
              onClearMap={clearMap}
            />
          </div>
        </div>
        
           {/* Primary actions - Add section and Delete sections */}
           <div className="flex items-center gap-3 justify-end">
             {selectedSections.length > 0 && (
               <Button 
                 onClick={deleteSelectedSections}
                 className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm px-4 py-2"
               >
                 <Trash2 className="h-4 w-4 mr-2" />
                 Eliminar {selectedSections.length > 1 ? 'secciones' : 'sección'}
               </Button>
             )}
             
          <Button 
            onClick={() => addSection(1)}
               className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar sección
          </Button>
           </div>
        </div>
      </header>

      {/* Statistics bar */}

      <div className="flex h-[calc(100vh-140px)]">
        {/* Main canvas area */}
        <div className={`relative transition-all duration-300 ease-in-out ${
          canvasCollapsed ? 'w-0 overflow-hidden' : 'flex-1'
        }`}>
          {!canvasCollapsed && (
          <SectionCanvas
            sections={sections}
            selectedSectionId={selectedSection}
              selectedSections={selectedSections}
              onSectionSelect={handleSectionSelect}
            onSectionUpdate={updateSection}
            onCreateStadium={createStadium}
          />
          )}
        </div>

        {/* Right panel - Section editor */}
        <div className={`border-l border-gray-200 bg-white transition-all duration-300 ease-in-out ${
          canvasCollapsed ? 'flex-1' : 'w-[600px]'
        }`}>
          <SectionEditor
            section={sections.find(s => s.id === selectedSection) || null}
            onUpdate={updateSection}
            onAddRow={addRowToSection}
            onDeleteRow={deleteRowFromSection}
            onAddSeats={addSeatsToRow}
            selectedRows={selectedRows}
            onRowSelectionChange={setSelectedRows}
            selectedSeats={selectedSeats}
            onMarkSelectedSeatsAs={markSelectedSeatsAs}
            onDeleteSelectedSeats={deleteSelectedSeats}
            onDeleteSection={deleteSelectedSections}
            hasSelectedSection={!!selectedSection}
            canvasCollapsed={canvasCollapsed}
          />
        </div>
      </div>

      {/* Bottom Statistics Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{totalSections}</span> secciones
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{totalRows}</span> filas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{totalSeats}</span> asientos
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                <span className="font-medium text-emerald-600">{availableSeats}</span> libres
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                <span className="font-medium text-violet-600">{occupiedSeats}</span> ocupados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmations.deleteSections}
        onClose={() => closeConfirmation('deleteSections')}
        onConfirm={() => handleConfirmation('deleteSections')}
        title="Confirmar eliminación"
         message={`¿Estás seguro de que quieres borrar ${pendingAction?.data?.count || 1} sección${(pendingAction?.data?.count || 1) > 1 ? 'es' : ''} seleccionada${(pendingAction?.data?.count || 1) > 1 ? 's' : ''}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        details={["Esta acción no se puede deshacer", "Todas las filas y asientos de esta sección también se eliminarán"]}
       />

      <ConfirmationDialog
        open={confirmations.deleteRow}
        onClose={() => closeConfirmation('deleteRow')}
        onConfirm={() => handleConfirmation('deleteRow')}
        title="Confirmar eliminación de fila"
        message={`¿Estás seguro de que quieres borrar la fila "${pendingAction?.data?.rowLabel || ''}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        details={["Esta acción no se puede deshacer", "Todos los asientos de esta fila también se eliminarán"]}
      />

      <ConfirmationDialog
        open={confirmations.deleteSeats}
        onClose={() => closeConfirmation('deleteSeats')}
        onConfirm={() => handleConfirmation('deleteSeats')}
        title="Confirmar eliminación de asientos"
        message={`¿Estás seguro de que quieres borrar ${pendingAction?.data?.seatCount || 0} asiento${(pendingAction?.data?.seatCount || 0) > 1 ? 's' : ''} seleccionado${(pendingAction?.data?.seatCount || 0) > 1 ? 's' : ''}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        details={["Esta acción no se puede deshacer", "Los asientos seleccionados se eliminarán permanentemente"]}
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