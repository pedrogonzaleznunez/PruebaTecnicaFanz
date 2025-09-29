import { describe, it, expect } from 'vitest'
import { z } from 'zod'
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

describe('Schema Validation Tests', () => {
  describe('Seat Schema', () => {
    it('should validate a complete seat object', () => {
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

    it('should validate all seat statuses', () => {
      const statuses: Array<Seat['status']> = ['available', 'occupied', 'selected', 'unlabeled']
      
      statuses.forEach(status => {
        const seat: Seat = {
          id: 'seat-1',
          label: 'A1',
          status,
          x: 100,
          y: 200
        }
        
        const result = seatSchema.safeParse(seat)
        expect(result.success).toBe(true)
      })
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
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid enum value')
      }
    })

    it('should reject empty id', () => {
      const invalidSeat = {
        id: '',
        label: 'A1',
        status: 'available',
        x: 100,
        y: 200
      }
      
      const result = seatSchema.safeParse(invalidSeat)
      expect(result.success).toBe(false)
    })

    it('should reject empty label', () => {
      const invalidSeat = {
        id: 'seat-1',
        label: '',
        status: 'available',
        x: 100,
        y: 200
      }
      
      const result = seatSchema.safeParse(invalidSeat)
      expect(result.success).toBe(false)
    })

    it('should accept optional meta field', () => {
      const seatWithMeta: Seat = {
        id: 'seat-1',
        label: 'A1',
        status: 'available',
        x: 100,
        y: 200,
        meta: {
          customField: 'test',
          number: 42
        }
      }
      
      const result = seatSchema.safeParse(seatWithMeta)
      expect(result.success).toBe(true)
    })

    it('should reject non-numeric coordinates', () => {
      const invalidSeat = {
        id: 'seat-1',
        label: 'A1',
        status: 'available',
        x: '100',
        y: 200
      }
      
      const result = seatSchema.safeParse(invalidSeat)
      expect(result.success).toBe(false)
    })
  })

  describe('Row Schema', () => {
    it('should validate a complete row object', () => {
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

    it('should validate empty seats array', () => {
      const emptyRow: Row = {
        id: 'row-1',
        label: 'Fila 1',
        seats: []
      }
      
      const result = rowSchema.safeParse(emptyRow)
      expect(result.success).toBe(true)
    })

    it('should accept optional selected field', () => {
      const rowWithSelected: Row = {
        id: 'row-1',
        label: 'Fila 1',
        seats: [],
        selected: true
      }
      
      const result = rowSchema.safeParse(rowWithSelected)
      expect(result.success).toBe(true)
    })

    it('should reject invalid seat in seats array', () => {
      const invalidRow = {
        id: 'row-1',
        label: 'Fila 1',
        seats: [
          {
            id: 'seat-1',
            label: 'A1',
            status: 'invalid-status',
            x: 100,
            y: 200
          }
        ]
      }
      
      const result = rowSchema.safeParse(invalidRow)
      expect(result.success).toBe(false)
    })
  })

  describe('Platea Schema', () => {
    it('should validate a complete platea object', () => {
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

    it('should use default values for optional fields', () => {
      const minimalPlatea = {
        id: 'platea-1',
        label: 'Platea A',
        rows: []
      }
      
      const result = plateaSchema.safeParse(minimalPlatea)
      expect(result.success).toBe(true)
      
      if (result.success) {
        expect(result.data.x).toBe(0)
        expect(result.data.y).toBe(0)
        expect(result.data.width).toBe(200)
        expect(result.data.height).toBe(150)
      }
    })

    it('should accept optional selected field', () => {
      const plateaWithSelected: Platea = {
        id: 'platea-1',
        label: 'Platea A',
        x: 100,
        y: 200,
        width: 300,
        height: 200,
        rows: [],
        selected: true
      }
      
      const result = plateaSchema.safeParse(plateaWithSelected)
      expect(result.success).toBe(true)
    })

    it('should validate rows array', () => {
      const plateaWithRows: Platea = {
        id: 'platea-1',
        label: 'Platea A',
        x: 100,
        y: 200,
        width: 300,
        height: 200,
        rows: [
          {
            id: 'row-1',
            label: 'Fila 1',
            seats: [
              {
                id: 'seat-1',
                label: 'A1',
                status: 'available',
                x: 120,
                y: 220
              }
            ]
          }
        ]
      }
      
      const result = plateaSchema.safeParse(plateaWithRows)
      expect(result.success).toBe(true)
    })
  })

  describe('SeatMap Schema', () => {
    it('should validate a complete seatmap object', () => {
      const validSeatMap: SeatMap = {
        name: 'Teatro Principal',
        plateas: [
          {
            id: 'platea-1',
            label: 'Platea A',
            x: 100,
            y: 200,
            width: 300,
            height: 200,
            rows: []
          }
        ]
      }
      
      const result = seatMapSchema.safeParse(validSeatMap)
      expect(result.success).toBe(true)
    })

    it('should validate empty plateas array', () => {
      const emptySeatMap: SeatMap = {
        name: 'Empty Theater',
        plateas: []
      }
      
      const result = seatMapSchema.safeParse(emptySeatMap)
      expect(result.success).toBe(true)
    })

    it('should accept optional fields', () => {
      const seatMapWithOptional: SeatMap = {
        name: 'Teatro Principal',
        plateas: [],
        createdAt: '2025-01-27T19:00:00Z',
        version: '1.0.0',
        metadata: {
          totalPlateas: 2,
          totalRows: 5,
          totalSeats: 100,
          exportedBy: 'SeatMapBuilder'
        }
      }
      
      const result = seatMapSchema.safeParse(seatMapWithOptional)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidSeatMap = {
        name: '',
        plateas: []
      }
      
      const result = seatMapSchema.safeParse(invalidSeatMap)
      expect(result.success).toBe(false)
    })

    it('should validate metadata structure', () => {
      const seatMapWithInvalidMetadata = {
        name: 'Test Theater',
        plateas: [],
        metadata: {
          totalPlateas: 'invalid',
          totalRows: 5,
          totalSeats: 100,
          exportedBy: 'SeatMapBuilder'
        }
      }
      
      const result = seatMapSchema.safeParse(seatMapWithInvalidMetadata)
      expect(result.success).toBe(false)
    })
  })

  describe('Type Safety Tests', () => {
    it('should maintain type safety for Seat type', () => {
      const seat: Seat = {
        id: 'seat-1',
        label: 'A1',
        status: 'available',
        x: 100,
        y: 200
      }
      
      // TypeScript should compile this without errors
      expect(typeof seat.id).toBe('string')
      expect(typeof seat.status).toBe('string')
      expect(typeof seat.x).toBe('number')
    })

    it('should maintain type safety for Row type', () => {
      const row: Row = {
        id: 'row-1',
        label: 'Fila 1',
        seats: []
      }
      
      expect(Array.isArray(row.seats)).toBe(true)
    })

    it('should maintain type safety for Platea type', () => {
      const platea: Platea = {
        id: 'platea-1',
        label: 'Platea A',
        x: 0,
        y: 0,
        width: 200,
        height: 150,
        rows: []
      }
      
      expect(typeof platea.width).toBe('number')
      expect(Array.isArray(platea.rows)).toBe(true)
    })

    it('should maintain type safety for SeatMap type', () => {
      const seatMap: SeatMap = {
        name: 'Test Theater',
        plateas: []
      }
      
      expect(typeof seatMap.name).toBe('string')
      expect(Array.isArray(seatMap.plateas)).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative coordinates', () => {
      const seat: Seat = {
        id: 'seat-1',
        label: 'A1',
        status: 'available',
        x: -100,
        y: -200
      }
      
      const result = seatSchema.safeParse(seat)
      expect(result.success).toBe(true)
    })

    it('should handle zero dimensions', () => {
      const platea: Platea = {
        id: 'platea-1',
        label: 'Platea A',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rows: []
      }
      
      const result = plateaSchema.safeParse(platea)
      expect(result.success).toBe(true)
    })

    it('should handle very long strings', () => {
      const longString = 'A'.repeat(1000)
      const seat: Seat = {
        id: longString,
        label: longString,
        status: 'available',
        x: 100,
        y: 200
      }
      
      const result = seatSchema.safeParse(seat)
      expect(result.success).toBe(true)
    })
  })
})
