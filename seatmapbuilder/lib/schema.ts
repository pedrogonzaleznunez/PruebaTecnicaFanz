import { z } from 'zod';

export const seatSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  status: z.enum(['available', 'occupied', 'selected', 'unlabeled']),
  x: z.number(),
  y: z.number(),
  meta: z.record(z.unknown()).optional(),
});

export const rowSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  seats: z.array(seatSchema),
  selected: z.boolean().optional(),
});

export const plateaSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(200),
  height: z.number().default(150),
  rows: z.array(rowSchema),
  selected: z.boolean().optional(),
});

export const seatMapSchema = z.object({
  name: z.string().min(1),
  plateas: z.array(plateaSchema),
  createdAt: z.string().optional(),
  version: z.string().optional(),
  metadata: z.object({
    totalPlateas: z.number(),
    totalRows: z.number(),
    totalSeats: z.number(),
    exportedBy: z.string(),
  }).optional(),
});

export type Seat = z.infer<typeof seatSchema>;
export type Row = z.infer<typeof rowSchema>;
export type Platea = z.infer<typeof plateaSchema>;
export type Section = Platea; // Alias for compatibility
export type SeatMap = z.infer<typeof seatMapSchema>;


