/**
 * Generador de IDs determinísticos para la estructura jerárquica del mapa de asientos
 * 
 * Formato:
 * - Plateas: platea-p1, platea-p2, ...
 * - Filas: fila-p1f1, fila-p1f2, ...  
 * - Asientos: seat-p1f1n1, seat-p1f1n2, ...
 */

export function generatePlateaId(plateaNumber: number): string {
  return `platea-p${plateaNumber}`
}

export function generateFilaId(plateaNumber: number, filaNumber: number): string {
  return `fila-p${plateaNumber}f${filaNumber}`
}

export function generateSeatId(plateaNumber: number, filaNumber: number, seatNumber: number): string {
  return `seat-p${plateaNumber}f${filaNumber}n${seatNumber}`
}

/**
 * Extrae números de los IDs para reconstruir la jerarquía
 */
export function extractPlateaNumber(plateaId: string): number {
  const match = plateaId.match(/platea-p(\d+)/)
  return match ? parseInt(match[1]) : 0
}

export function extractFilaNumber(filaId: string): number {
  const match = filaId.match(/fila-p\d+f(\d+)/)
  return match ? parseInt(match[1]) : 0
}

export function extractSeatNumber(seatId: string): number {
  const match = seatId.match(/seat-p\d+f\d+n(\d+)/)
  return match ? parseInt(match[1]) : 0
}

export function extractPlateaNumberFromFilaId(filaId: string): number {
  const match = filaId.match(/fila-p(\d+)f\d+/)
  return match ? parseInt(match[1]) : 0
}

export function extractFilaNumberFromSeatId(seatId: string): number {
  const match = seatId.match(/seat-p\d+f(\d+)n\d+/)
  return match ? parseInt(match[1]) : 0
}

export function extractPlateaNumberFromSeatId(seatId: string): number {
  const match = seatId.match(/seat-p(\d+)f\d+n\d+/)
  return match ? parseInt(match[1]) : 0
}

export function extractFilaNumberFromFilaId(filaId: string): number {
  const match = filaId.match(/fila-p\d+f(\d+)/)
  return match ? parseInt(match[1]) : 0
}

// Section-based ID generators (aliases for compatibility)
export function generateSectionId(sectionNumber: number): string {
  return generatePlateaId(sectionNumber)
}

export function extractSectionNumber(sectionId: string): number {
  return extractPlateaNumber(sectionId)
}