import { useCallback, useMemo, useState } from 'react';
import { seatMapSchema, type SeatMap, type Row, type Seat } from '../lib/schema';

type Selection = {
  selectedRowIds: Set<string>;
  selectedSeatIdsByRow: Map<string, Set<string>>;
};

function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyMap(): SeatMap {
  return { id: generateId('map'), name: 'Sin nombre', rows: [] };
}

export function useSeatMap() {
  const [map, setMap] = useState<SeatMap>(() => createEmptyMap());
  const [selection, setSelection] = useState<Selection>(() => ({
    selectedRowIds: new Set(),
    selectedSeatIdsByRow: new Map(),
  }));

  const reset = useCallback(() => {
    setMap(createEmptyMap());
    setSelection({ selectedRowIds: new Set(), selectedSeatIdsByRow: new Map() });
  }, []);

  const setName = useCallback((name: string) => {
    setMap(prev => ({ ...prev, name }));
  }, []);

  const addRows = useCallback((count: number, labelPattern?: { prefix: string; start: number }): void => {
    setMap(prev => {
      const rows: Row[] = [...prev.rows];
      for (let i = 0; i < count; i++) {
        const label = labelPattern
          ? `${labelPattern.prefix} ${labelPattern.start + i}`
          : `Fila ${rows.length + 1}`;
        rows.push({ id: generateId('row'), label, seats: [] });
      }
      return { ...prev, rows };
    });
  }, []);

  const addSeatsToRow = useCallback((rowId: string, count: number, labelPattern?: { prefix: string; start: number }) => {
    setMap(prev => {
      const rows = prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const seats: Seat[] = [...r.seats];
        const existing = seats.length;
        for (let i = 0; i < count; i++) {
          const seq = labelPattern ? labelPattern.start + i : existing + i + 1;
          const label = labelPattern ? `${labelPattern.prefix}${seq}` : `A${seq}`;
          seats.push({ id: generateId('seat'), label });
        }
        return { ...r, seats };
      });
      return { ...prev, rows };
    });
  }, []);

  const setRowLabels = useCallback((rowIds: string[], labels: string[]) => {
    setMap(prev => {
      const labelById = new Map<string, string>();
      for (let i = 0; i < rowIds.length && i < labels.length; i++) {
        labelById.set(rowIds[i], labels[i]);
      }
      const rows = prev.rows.map(r => (labelById.has(r.id) ? { ...r, label: labelById.get(r.id)! } : r));
      return { ...prev, rows };
    });
  }, []);

  const setSeatLabels = useCallback((rowId: string, seatIds: string[], labels: string[]) => {
    setMap(prev => {
      const rows = prev.rows.map(r => {
        if (r.id !== rowId) return r;
        const labelById = new Map<string, string>();
        for (let i = 0; i < seatIds.length && i < labels.length; i++) {
          labelById.set(seatIds[i], labels[i]);
        }
        const seats = r.seats.map(s => (labelById.has(s.id) ? { ...s, label: labelById.get(s.id)! } : s));
        return { ...r, seats };
      });
      return { ...prev, rows };
    });
  }, []);

  const deleteRows = useCallback((rowIds: string[]) => {
    setMap(prev => ({ ...prev, rows: prev.rows.filter(r => !rowIds.includes(r.id)) }));
    setSelection(sel => {
      const next = new Set(sel.selectedRowIds);
      rowIds.forEach(id => next.delete(id));
      const seatSel = new Map(sel.selectedSeatIdsByRow);
      rowIds.forEach(id => seatSel.delete(id));
      return { selectedRowIds: next, selectedSeatIdsByRow: seatSel };
    });
  }, []);

  const deleteSeats = useCallback((rowId: string, seatIds: string[]) => {
    setMap(prev => {
      const rows = prev.rows.map(r => (r.id === rowId ? { ...r, seats: r.seats.filter(s => !seatIds.includes(s.id)) } : r));
      return { ...prev, rows };
    });
    setSelection(sel => {
      const seatSel = new Map(sel.selectedSeatIdsByRow);
      const set = new Set(seatSel.get(rowId) ?? []);
      seatIds.forEach(id => set.delete(id));
      seatSel.set(rowId, set);
      return { selectedRowIds: new Set(sel.selectedRowIds), selectedSeatIdsByRow: seatSel };
    });
  }, []);

  const selectRows = useCallback((rowIds: string[], additive: boolean) => {
    setSelection(prev => {
      const next = additive ? new Set(prev.selectedRowIds) : new Set<string>();
      rowIds.forEach(id => next.add(id));
      return { selectedRowIds: next, selectedSeatIdsByRow: new Map(prev.selectedSeatIdsByRow) };
    });
  }, []);

  const selectSeats = useCallback((rowId: string, seatIds: string[], additive: boolean) => {
    setSelection(prev => {
      const seatSel = new Map(prev.selectedSeatIdsByRow);
      const current = additive ? new Set(seatSel.get(rowId) ?? []) : new Set<string>();
      seatIds.forEach(id => current.add(id));
      seatSel.set(rowId, current);
      return { selectedRowIds: new Set(prev.selectedRowIds), selectedSeatIdsByRow: seatSel };
    });
  }, []);

  const exportJson = useCallback((name: string): string => {
    const toExport: SeatMap = { ...map, name };
    const parsed = seatMapSchema.safeParse(toExport);
    if (!parsed.success) throw new Error('Datos inválidos para exportar');
    return JSON.stringify(parsed.data, null, 2);
  }, [map]);

  const importJson = useCallback((json: string) => {
    const parsed = seatMapSchema.parse(JSON.parse(json));
    setMap(parsed);
    setSelection({ selectedRowIds: new Set(), selectedSeatIdsByRow: new Map() });
  }, []);

  return useMemo(() => ({
    map,
    selection,
    reset,
    setName,
    addRows,
    addSeatsToRow,
    setRowLabels,
    setSeatLabels,
    deleteRows,
    deleteSeats,
    selectRows,
    selectSeats,
    exportJson,
    importJson,
  }), [map, selection, reset, setName, addRows, addSeatsToRow, setRowLabels, setSeatLabels, deleteRows, deleteSeats, selectRows, selectSeats, exportJson, importJson]);
}


