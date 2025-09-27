/**
 * Generador de IDs determinísticos para la estructura jerárquica del mapa de asientos
 * 
 * Formato:
 * - Plateas: section-s1, section-s2, ...
 * - Filas: fila-s1f1, fila-s1f2, ...  
 * - Asientos: seat-s1f1n1, seat-s1f1n2, ...
 */

export function generateSectionId(plateaNumber: number): string {
  return `section-s${plateaNumber}`
}

export function generateFilaId(plateaNumber: number, filaNumber: number): string {
  return `fila-s${plateaNumber}f${filaNumber}`
}

export function generateSeatId(plateaNumber: number, filaNumber: number, seatNumber: number): string {
  return `seat-s${plateaNumber}f${filaNumber}n${seatNumber}`
}

/**
 * Extrae números de los IDs para reconstruir la jerarquía
 */
export function extractSectionNumber(plateaId: string): number {
  const match = plateaId.match(/section-s(\d+)/)
  return match ? parseInt(match[1]) : 0
}

export function extractFilaNumber(filaId: string): number {
  const match = filaId.match(/fila-s\d+f(\d+)/)
  return match ? parseInt(match[1]) : 0
}

export function extractSeatNumber(seatId: string): number {
  const match = seatId.match(/seat-s\d+f\d+n(\d+)/)
  return match ? parseInt(match[1]) : 0
}

export function extractSectionNumberFromFilaId(filaId: string): number {
  const match = filaId.match(/fila-s(\d+)f\d+/)
  return match ? parseInt(match[1]) : 0
}

export function extractFilaNumberFromSeatId(seatId: string): number {
  const match = seatId.match(/seat-s\d+f(\d+)n\d+/)
  return match ? parseInt(match[1]) : 0
}

export function extractSectionNumberFromSeatId(seatId: string): number {
  const match = seatId.match(/seat-s(\d+)f\d+n\d+/)
  return match ? parseInt(match[1]) : 0
}

export function extractFilaNumberFromFilaId(filaId: string): number {
  const match = filaId.match(/fila-s\d+f(\d+)/)
  return match ? parseInt(match[1]) : 0
}
