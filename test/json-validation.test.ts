import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'

// Import schemas from the main project
import { 
  seatSchema, 
  rowSchema, 
  plateaSchema, 
  seatMapSchema,
  type Seat,
  type Row,
  type Platea,
  type SeatMap
} from '../seatmapbuilder/lib/schema'

describe('JSON Validation Tests', () => {
  const fixturesDir = join(__dirname, 'fixtures')

  describe('Valid JSON Files', () => {
    it('should validate valid-seatmap.json', () => {
      const validSeatMap = JSON.parse(
        readFileSync(join(fixturesDir, 'valid-seatmap.json'), 'utf-8')
      )
      
      const result = seatMapSchema.safeParse(validSeatMap)
      expect(result.success).toBe(true)
      
      if (result.success) {
        const seatMap: SeatMap = result.data
        expect(seatMap.name).toBe('Teatro Principal')
        expect(seatMap.plateas).toHaveLength(2)
        expect(seatMap.metadata?.totalSeats).toBe(6)
      }
    })

    it('should validate edge-cases.json', () => {
      const edgeCases = JSON.parse(
        readFileSync(join(fixturesDir, 'edge-cases.json'), 'utf-8')
      )
      
      const result = seatMapSchema.safeParse(edgeCases)
      expect(result.success).toBe(true)
      
      if (result.success) {
        const seatMap: SeatMap = result.data
        expect(seatMap.plateas).toHaveLength(2)
        expect(seatMap.plateas[0].rows).toHaveLength(0) // Empty platea
        expect(seatMap.plateas[1].rows[0].seats).toHaveLength(1) // Single seat
      }
    })
  })

  describe('Invalid JSON Files', () => {
    it('should reject invalid-seatmap.json', () => {
      const invalidSeatMap = JSON.parse(
        readFileSync(join(fixturesDir, 'invalid-seatmap.json'), 'utf-8')
      )
      
      const result = seatMapSchema.safeParse(invalidSeatMap)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        const errors = result.error.errors
        expect(errors.length).toBeGreaterThan(0)
        
        // Check for specific validation errors
        const errorMessages = errors.map(e => e.message)
        expect(errorMessages.some(msg => msg.includes('String must contain at least 1 character(s)'))).toBe(true)
        expect(errorMessages.some(msg => msg.includes('Expected number, received string'))).toBe(true)
        expect(errorMessages.some(msg => msg.includes('Invalid enum value'))).toBe(true)
      }
    })
  })

  describe('Individual Schema Validation', () => {
    it('should validate seat schema', () => {
      const validSeat: Seat = {
        id: 'seat-1',
        label: 'A1',
        status: 'available',
        x: 100,
        y: 200
      }
      
      const result = seatSchema.safeParse(validSeat)
      expect(result.success).toBe(true)
    })

    it('should reject invalid seat status', () => {
      const invalidSeat = {
        id: 'seat-1',
        label: 'A1',
        status: 'invalid-status',
        x: 100,
        y: 200
      }
      
      const result = seatSchema.safeParse(invalidSeat)
      expect(result.success).toBe(false)
    })

    it('should validate row schema', () => {
      const validRow: Row = {
        id: 'row-1',
        label: 'Fila 1',
        seats: [
          {
            id: 'seat-1',
            label: 'A1',
            status: 'available',
            x: 100,
            y: 200
          }
        ]
      }
      
      const result = rowSchema.safeParse(validRow)
      expect(result.success).toBe(true)
    })

    it('should validate platea schema', () => {
      const validPlatea: Platea = {
        id: 'platea-1',
        label: 'Platea A',
        x: 100,
        y: 200,
        width: 300,
        height: 200,
        rows: []
      }
      
      const result = plateaSchema.safeParse(validPlatea)
      expect(result.success).toBe(true)
    })
  })

  describe('JSON Structure Tests', () => {
    it('should handle optional fields correctly', () => {
      const seatMapWithoutOptional = {
        name: 'Test Theater',
        plateas: []
      }
      
      const result = seatMapSchema.safeParse(seatMapWithoutOptional)
      expect(result.success).toBe(true)
    })

    it('should validate metadata when present', () => {
      const seatMapWithMetadata = {
        name: 'Test Theater',
        plateas: [],
        metadata: {
          totalPlateas: 2,
          totalRows: 5,
          totalSeats: 100,
          exportedBy: 'SeatMapBuilder'
        }
      }
      
      const result = seatMapSchema.safeParse(seatMapWithMetadata)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.metadata?.totalSeats).toBe(100)
      }
    })

    it('should handle seat meta field', () => {
      const seatWithMeta = {
        id: 'seat-1',
        label: 'A1',
        status: 'available',
        x: 100,
        y: 200,
        meta: {
          customField: 'test',
          number: 42,
          boolean: true
        }
      }
      
      const result = seatSchema.safeParse(seatWithMeta)
      expect(result.success).toBe(true)
    })
  })

  describe('Data Integrity Tests', () => {
    it('should maintain data consistency after validation', () => {
      const validSeatMap = JSON.parse(
        readFileSync(join(fixturesDir, 'valid-seatmap.json'), 'utf-8')
      )
      
      const result = seatMapSchema.safeParse(validSeatMap)
      expect(result.success).toBe(true)
      
      if (result.success) {
        const seatMap: SeatMap = result.data
        
        // Verify all seats have valid IDs
        seatMap.plateas.forEach(platea => {
          platea.rows.forEach(row => {
            row.seats.forEach(seat => {
              expect(seat.id).toBeTruthy()
              expect(seat.label).toBeTruthy()
              expect(['available', 'occupied', 'selected', 'unlabeled']).toContain(seat.status)
              expect(typeof seat.x).toBe('number')
              expect(typeof seat.y).toBe('number')
            })
          })
        })
      }
    })
  })
})
