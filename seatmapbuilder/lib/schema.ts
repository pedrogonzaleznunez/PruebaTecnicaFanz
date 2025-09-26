import { z } from 'zod';

export const seatSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  meta: z.record(z.unknown()).optional(),
});

export const rowSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  seats: z.array(seatSchema),
});

export const seatMapSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rows: z.array(rowSchema),
});

export type Seat = z.infer<typeof seatSchema>;
export type Row = z.infer<typeof rowSchema>;
export type SeatMap = z.infer<typeof seatMapSchema>;


