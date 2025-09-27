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

export const sectionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  rows: z.array(rowSchema),
  selected: z.boolean().optional(),
});

export const seatMapSchema = z.object({
  name: z.string().min(1),
  sections: z.array(sectionSchema),
  createdAt: z.string().optional(),
  version: z.string().optional(),
  metadata: z.object({
    totalSections: z.number(),
    totalRows: z.number(),
    totalSeats: z.number(),
    exportedBy: z.string(),
  }).optional(),
});

export type Seat = z.infer<typeof seatSchema>;
export type Row = z.infer<typeof rowSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type SeatMap = z.infer<typeof seatMapSchema>;


