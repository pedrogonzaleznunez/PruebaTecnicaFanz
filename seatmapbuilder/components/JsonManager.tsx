"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Download, Upload, FileText, Copy, X } from "lucide-react"

import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Badge } from "@components/ui/badge"
import { Textarea } from "@components/ui/textarea"
import { ConfirmationDialog } from "@components/ui/confirmation-dialog"

import type { Platea, SeatMap } from "@lib/schema"

interface JsonManagerProps {
  plateas: Platea[]
  onPlateaChange: (plateas: Platea[]) => void
  mapName: string
  onMapNameChange: (name: string) => void
  onClearMap: () => void
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  data?: SeatMap
}

export function JsonManager({ plateas, onPlateaChange, mapName, onMapNameChange, onClearMap }: JsonManagerProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importText, setImportText] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Confirmation dialogs
  const [confirmations, setConfirmations] = useState({
    exportNoName: false,
    importMap: false,
    copySuccess: false,
    copyError: false
  })
  const [pendingImportData, setPendingImportData] = useState<any>(null)

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (exportDialogOpen) setExportDialogOpen(false)
        if (importDialogOpen) setImportDialogOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [exportDialogOpen, importDialogOpen])

  const validateSeatMapData = (data: any): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic structure validation
    if (!data || typeof data !== "object") {
      errors.push("El archivo no contiene un objeto JSON válido")
      return { isValid: false, errors, warnings }
    }

    if (!data.name || typeof data.name !== "string") {
      warnings.push("Nombre del mapa faltante o inválido")
    }

    if (!data.plateas || !Array.isArray(data.plateas)) {
      errors.push("La propiedad 'plateas' es requerida y debe ser un array")
      return { isValid: false, errors, warnings }
    }

    // Validate plateas
    data.plateas.forEach((platea: any, plateaIndex: number) => {
      if (!platea.id || typeof platea.id !== "string") {
        errors.push(`Platea ${plateaIndex + 1}: ID faltante o inválido`)
      }

      if (!platea.label || typeof platea.label !== "string") {
        warnings.push(`Platea ${plateaIndex + 1}: Etiqueta faltante o inválida`)
      }

      if (!platea.rows || !Array.isArray(platea.rows)) {
        errors.push(`Platea ${plateaIndex + 1}: La propiedad 'rows' debe ser un array`)
        return
      }

      // Validate rows within platea
      platea.rows.forEach((row: any, rowIndex: number) => {
        if (!row.id || typeof row.id !== "string") {
          errors.push(`Platea ${plateaIndex + 1}, Fila ${rowIndex + 1}: ID faltante o inválido`)
        }

        if (!row.label || typeof row.label !== "string") {
          warnings.push(`Platea ${plateaIndex + 1}, Fila ${rowIndex + 1}: Etiqueta faltante o inválida`)
        }

        if (!row.seats || !Array.isArray(row.seats)) {
          errors.push(`Platea ${plateaIndex + 1}, Fila ${rowIndex + 1}: La propiedad 'seats' debe ser un array`)
          return
        }

        // Validate seats
        row.seats.forEach((seat: any, seatIndex: number) => {
          if (!seat.id || typeof seat.id !== "string") {
            errors.push(`Platea ${plateaIndex + 1}, Fila ${rowIndex + 1}, Asiento ${seatIndex + 1}: ID faltante o inválido`)
          }

          if (!seat.label || typeof seat.label !== "string") {
            warnings.push(`Platea ${plateaIndex + 1}, Fila ${rowIndex + 1}, Asiento ${seatIndex + 1}: Etiqueta faltante o inválida`)
          }

          if (typeof seat.x !== "number" || typeof seat.y !== "number") {
            errors.push(`Platea ${plateaIndex + 1}, Fila ${rowIndex + 1}, Asiento ${seatIndex + 1}: Coordenadas x,y deben ser números`)
          }

          if (!["available", "occupied", "selected", "unlabeled"].includes(seat.status)) {
            warnings.push(
              `Platea ${plateaIndex + 1}, Fila ${rowIndex + 1}, Asiento ${seatIndex + 1}: Estado '${seat.status}' no reconocido, se usará 'available'`,
            )
          }
        })
      })
    })

    // Check for duplicate IDs
    const allIds = new Set()
    data.plateas.forEach((platea: any) => {
      if (allIds.has(platea.id)) {
        errors.push(`ID de platea duplicado: ${platea.id}`)
      }
      allIds.add(platea.id)

      platea.rows?.forEach((row: any) => {
        if (allIds.has(row.id)) {
          errors.push(`ID de fila duplicado: ${row.id}`)
        }
        allIds.add(row.id)

        row.seats?.forEach((seat: any) => {
          if (allIds.has(seat.id)) {
            errors.push(`ID de asiento duplicado: ${seat.id}`)
          }
          allIds.add(seat.id)
        })
      })
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: errors.length === 0 ? data : undefined,
    }
  }

  const handleTextImport = () => {
    setIsValidating(true)
    try {
      const data = JSON.parse(importText)
      const result = validateSeatMapData(data)
      setValidationResult(result)

      if (result.isValid && result.data) {
              // Auto-fix common issues
              const cleanedData = {
                ...result.data,
                plateas: result.data.plateas.map((platea: any) => ({
                  ...platea,
                  selected: false,
                  rows: platea.rows.map((row: any) => ({
                    ...row,
                    selected: false,
                    seats: row.seats.map((seat: any) => ({
                      ...seat,
                      status: ["available", "occupied", "selected", "unlabeled"].includes(seat.status)
                        ? seat.status
                        : "available",
                    })),
                  })),
                })),
              }

              const totalPlateas = cleanedData.plateas.length
              const totalRows = cleanedData.plateas.reduce((sum: number, platea: any) => sum + platea.rows.length, 0)
              const totalSeats = cleanedData.plateas.reduce((sum: number, platea: any) => 
                sum + platea.rows.reduce((rowSum: number, row: any) => rowSum + row.seats.length, 0), 0)

              // Store data for confirmation dialog
              setPendingImportData({
                data: cleanedData,
                stats: { totalPlateas, totalRows, totalSeats },
                warnings: result.warnings.length
              })
              setConfirmations(prev => ({ ...prev, importMap: true }))
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ["JSON inválido: " + (error as Error).message],
        warnings: [],
      })
    }
    setIsValidating(false)
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setImportText(text)
      setImportDialogOpen(true)
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const exportToFile = () => {
    if (!mapName.trim()) {
      setConfirmations(prev => ({ ...prev, exportNoName: true }))
      return
    }

    performExport()
  }

  const performExport = () => {
    const data: SeatMap = {
      name: mapName,
      plateas: plateas,
      createdAt: new Date().toISOString(),
      version: "1.0",
      metadata: {
        totalPlateas: plateas.length,
        totalRows: plateas.reduce((sum, platea) => sum + platea.rows.length, 0),
        totalSeats: plateas.reduce((sum, platea) => 
          sum + platea.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0), 0),
        exportedBy: "SeatMapBuilder (Fanz)",
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${mapName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportDialogOpen(false)
  }

  const copyToClipboard = async () => {
    const data: SeatMap = {
      name: mapName,
      plateas: plateas,
      createdAt: new Date().toISOString(),
      version: "1.0",
      metadata: {
        totalPlateas: plateas.length,
        totalRows: plateas.reduce((sum, platea) => sum + platea.rows.length, 0),
        totalSeats: plateas.reduce((sum, platea) => 
          sum + platea.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0), 0),
        exportedBy: "SeatMapBuilder (Fanz)",
      },
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setConfirmations(prev => ({ ...prev, copySuccess: true }))
    } catch (error) {
      setConfirmations(prev => ({ ...prev, copyError: true }))
    }
  }

  // Confirmation handlers
  const handleImportConfirm = () => {
    if (pendingImportData) {
      onPlateaChange(pendingImportData.data.plateas)
      onMapNameChange(pendingImportData.data.name || "")
      setImportDialogOpen(false)
      setImportText("")
      setValidationResult(null)
      setPendingImportData(null)
    }
  }

  const closeConfirmation = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({ ...prev, [key]: false }))
  }

  const totalPlateas = plateas.length
  const totalRows = plateas.reduce((sum, platea) => sum + platea.rows.length, 0)
  const totalSeats = plateas.reduce((sum, platea) => 
    sum + platea.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0), 0)

  return (
    <div className="flex items-center gap-3">
      {/* Export Button */}
      <Button 
        variant="outline" 
        disabled={plateas.length === 0}
        onClick={() => setExportDialogOpen(true)}
        className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300 rounded-2xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar JSON
      </Button>

      {/* Export Modal */}
      {exportDialogOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setExportDialogOpen(false)}
        >
          <div 
            className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-blue-500" />
              <h2 className="text-lg font-semibold text-blue-500">Exportar Mapa de Asientos</h2>
              <button
                onClick={() => setExportDialogOpen(false)}
                className="ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="export-name" className="text-black">Nombre del mapa</Label>
                <Input
                  id="export-name"
                  value={mapName}
                  onChange={(e) => onMapNameChange(e.target.value)}
                  placeholder="Ingresa el nombre del mapa"
                  className="text-black placeholder:text-gray-500"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-black">Resumen del mapa:</h4>
                <div className="space-y-1 text-sm text-black">
                  <div className="flex justify-between">
                    <span>Plateas:</span>
                    <Badge variant="secondary" className="bg-gray-200 text-black">{totalPlateas}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Filas:</span>
                    <Badge variant="secondary" className="bg-gray-200 text-black">{totalRows}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Asientos:</span>
                    <Badge variant="secondary" className="bg-gray-200 text-black">{totalSeats}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={exportToFile} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" disabled={!mapName.trim()}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Archivo
                </Button>
                <Button variant="outline" onClick={copyToClipboard} className="border-gray-300 text-black hover:bg-gray-100">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Button */}
      <Button 
        variant="outline"
        onClick={() => setImportDialogOpen(true)}
        className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300 rounded-2xl shadow-md transition-all duration-200"
      >
        <Upload className="h-4 w-4 mr-2" />
        Importar JSON
      </Button>

      {/* Import Modal */}
      {importDialogOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setImportDialogOpen(false)}
        >
          <div 
            className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-4 w-4 text-blue-500" />
              <h2 className="text-lg font-semibold text-blue-500">Importar Mapa de Asientos</h2>
              <button
                onClick={() => setImportDialogOpen(false)}
                className="ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-text" className="text-black">Pegar JSON o cargar desde archivo</Label>
                <Textarea
                  id="import-text"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Pega aquí el contenido JSON del mapa..."
                  className="min-h-[200px] font-mono text-sm text-black placeholder:text-gray-500"
                />
              </div>

              {validationResult && (
                <div className="space-y-3">
                  {validationResult.errors.length > 0 && (
                    <div className="p-3 rounded-md bg-red-50 border border-red-200">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 mt-0.5 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="font-medium text-red-800 mb-1">Errores encontrados:</div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                            {validationResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 mt-0.5 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="font-medium text-yellow-800 mb-1">Advertencias:</div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                            {validationResult.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {validationResult.isValid && (
                    <div className="p-3 rounded-md bg-green-50 border border-green-200">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 mt-0.5 flex-shrink-0"></div>
                        <div className="flex-1">
                        <div className="font-medium text-green-800">JSON válido</div>
                        <div className="text-sm text-green-700 mt-1">
                          El archivo contiene {validationResult.data?.plateas.length} plateas con{" "}
                          {validationResult.data?.plateas.reduce((sum, platea) => sum + platea.rows.length, 0)} filas y{" "}
                          {validationResult.data?.plateas.reduce((sum, platea) => 
                            sum + platea.rows.reduce((rowSum, row) => rowSum + row.seats.length, 0), 0)} asientos.
                        </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleTextImport} disabled={!importText.trim() || isValidating} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                  {isValidating ? "Validando..." : "Validar e Importar"}
                </Button>
                <Button variant="outline" onClick={() => setImportText("")} className="border-gray-300 text-black hover:bg-gray-100">
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Input */}
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-300 rounded-2xl shadow-md transition-all duration-200"
      >
        <FileText className="h-4 w-4 mr-2" />
        Cargar Archivo
      </Button>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmations.exportNoName}
        onClose={() => closeConfirmation('exportNoName')}
        onConfirm={() => {}}
        title="Nombre requerido"
        message="Por favor, ingresa un nombre para el mapa antes de exportar."
        confirmText="Entendido"
        cancelText=""
        variant="warning"
      />

      <ConfirmationDialog
        open={confirmations.importMap}
        onClose={() => closeConfirmation('importMap')}
        onConfirm={handleImportConfirm}
        title="Confirmar importación"
        message={`¿Importar mapa "${pendingImportData?.data?.name || "Sin nombre"}"?`}
        confirmText="Importar"
        cancelText="Cancelar"
        variant="info"
        details={pendingImportData ? [
          `${pendingImportData.stats.totalPlateas} plateas`,
          `${pendingImportData.stats.totalRows} filas`,
          `${pendingImportData.stats.totalSeats} asientos`,
          ...(pendingImportData.warnings > 0 ? [`${pendingImportData.warnings} advertencias`] : [])
        ] : []}
      />

      <ConfirmationDialog
        open={confirmations.copySuccess}
        onClose={() => closeConfirmation('copySuccess')}
        onConfirm={() => {}}
        title="Copiado exitosamente"
        message="El JSON ha sido copiado al portapapeles."
        confirmText="Entendido"
        cancelText=""
        variant="success"
      />

      <ConfirmationDialog
        open={confirmations.copyError}
        onClose={() => closeConfirmation('copyError')}
        onConfirm={() => {}}
        title="Error al copiar"
        message="No se pudo copiar el JSON al portapapeles. Intenta usar el botón de descarga."
        confirmText="Entendido"
        cancelText=""
        variant="danger"
      />
    </div>
  )
}
