"use client";
import SeatMap from "../components/SeatMap";
import { useSeatMap } from "../hooks/useSeatMap";

export default function Page() {
  const {
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
  } = useSeatMap();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">SeatMapBuilder (Fanz)</h1>
        <div className="flex items-center gap-2">
          <button className="rounded bg-neutral-200 px-3 py-1 text-sm" onClick={() => reset()}>Nuevo mapa</button>
          <button
            className="rounded bg-neutral-200 px-3 py-1 text-sm"
            onClick={() => {
              // Validar etiquetado obligatorio antes de exportar
              const unlabeledRows = map.rows.filter(row => !row.label || row.label.trim() === '');
              const unlabeledSeats = map.rows.reduce((acc, row) => 
                acc + row.seats.filter(seat => !seat.label || seat.label.trim() === '').length, 0);
              
              if (unlabeledRows.length > 0 || unlabeledSeats > 0) {
                const proceed = confirm(
                  `⚠️ Hay ${unlabeledRows.length} fila(s) y ${unlabeledSeats} asiento(s) sin etiqueta.\n\n` +
                  '¿Deseas exportar de todas formas?'
                );
                if (!proceed) return;
              }
              
              const name = prompt("Nombre del mapa:", map.name || "Mapa");
              if (!name) return;
              try {
                const json = exportJson(name);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${name}.json`;
                a.click();
                URL.revokeObjectURL(url);
              } catch (e) {
                alert('Error al exportar: ' + (e as Error).message);
              }
            }}
          >
            Exportar JSON
          </button>
          <label className="cursor-pointer rounded bg-neutral-200 px-3 py-1 text-sm">
            Importar JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  importJson(text);
                } catch (err) {
                  alert('JSON inválido');
                } finally {
                  e.currentTarget.value = '';
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded border border-neutral-200 p-3">
          <h2 className="mb-2 font-medium">Acciones</h2>
          <div className="flex flex-wrap gap-2">
            <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => addRows(1, { prefix: 'Platea', start: map.rows.length + 1 })}>Agregar fila</button>
            <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white" onClick={() => addRows(5, { prefix: 'Platea', start: map.rows.length + 1 })}>Agregar 5 filas</button>
            <button
              className="rounded bg-emerald-600 px-3 py-1 text-sm text-white"
              onClick={() => {
                const targetRows = Array.from(selection.selectedRowIds);
                if (targetRows.length === 0) return alert('Selecciona al menos una fila');
                targetRows.forEach((rowId) => addSeatsToRow(rowId, 10, { prefix: 'A', start: 1 }));
              }}
            >
              Agregar 10 asientos a filas seleccionadas
            </button>
            <button
              className="rounded bg-red-600 px-3 py-1 text-sm text-white"
              onClick={() => {
                const rowIds = Array.from(selection.selectedRowIds);
                if (rowIds.length === 0) return;
                if (confirm(`Borrar ${rowIds.length} fila(s)?`)) deleteRows(rowIds);
              }}
            >
              Borrar filas seleccionadas
            </button>
          </div>

          <div className="mt-3">
            <h3 className="text-sm font-medium">Etiquetado rápido</h3>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <button
                className="rounded bg-neutral-200 px-3 py-1 text-sm"
                onClick={() => {
                  const rowIds = Array.from(selection.selectedRowIds);
                  if (rowIds.length === 0) return alert('Selecciona filas');
                  const prefix = prompt('Prefijo de filas:', 'Platea') || 'Platea';
                  const start = Number(prompt('Inicio:', '1') || '1');
                  const labels = rowIds.map((_, i) => `${prefix} ${start + i}`);
                  setRowLabels(rowIds, labels);
                }}
              >
                Etiquetar filas (prefijo + 1..N)
              </button>
              <button
                className="rounded bg-neutral-200 px-3 py-1 text-sm"
                onClick={() => {
                  const rowIds = Array.from(selection.selectedRowIds);
                  if (rowIds.length === 0) return alert('Selecciona filas');
                  const prefix = prompt('Prefijo de asientos:', 'A') || 'A';
                  const start = Number(prompt('Inicio:', '1') || '1');
                  const count = Number(prompt('Cantidad de asientos por fila:', '10') || '10');
                  
                  rowIds.forEach(rowId => {
                    const labels = Array.from({ length: count }, (_, i) => `${prefix}${start + i}`);
                    const seatIds = map.rows.find(r => r.id === rowId)?.seats.slice(0, count).map(s => s.id) || [];
                    if (seatIds.length > 0) {
                      setSeatLabels(rowId, seatIds, labels);
                    }
                  });
                }}
              >
                Etiquetar asientos (prefijo + 1..N)
              </button>
            </div>
          </div>
        </div>

        <div className="rounded border border-neutral-200 p-3">
          <h2 className="mb-2 font-medium">Estado</h2>
          <div className="text-sm text-neutral-700 space-y-1">
            <div>{map.rows.length} fila(s)</div>
            <div>{map.rows.reduce((acc, row) => acc + row.seats.length, 0)} asiento(s)</div>
            {(() => {
              const unlabeledRows = map.rows.filter(row => !row.label || row.label.trim() === '');
              const unlabeledSeats = map.rows.reduce((acc, row) => 
                acc + row.seats.filter(seat => !seat.label || seat.label.trim() === '').length, 0);
              
              if (unlabeledRows.length > 0 || unlabeledSeats > 0) {
                return (
                  <div className="text-amber-600 text-xs">
                    ⚠️ {unlabeledRows.length} fila(s) sin etiqueta, {unlabeledSeats} asiento(s) sin etiqueta
                  </div>
                );
              }
              return <div className="text-green-600 text-xs">✅ Todas las filas y asientos etiquetados</div>;
            })()}
          </div>
        </div>
      </div>

      <SeatMap
        rows={map.rows}
        selectedRowIds={selection.selectedRowIds}
        selectedSeatIdsByRow={selection.selectedSeatIdsByRow}
        onToggleRow={(rowId, additive) => {
          const already = selection.selectedRowIds.has(rowId);
          const next = new Set(additive ? selection.selectedRowIds : new Set<string>());
          if (already) next.delete(rowId); else next.add(rowId);
          // use hook api for consistency
          const ids = Array.from(next);
          // emulate selectRows semantics
          // first clear then add ids
          // since we don't expose direct setter, call selectRows
          // in two steps: not ideal but sufficient for MVP batch action
          selectRows([], false);
          if (ids.length) selectRows(ids, true);
        }}
        onToggleSeat={(rowId, seatId, additive) => {
          const current = new Set(additive ? (selection.selectedSeatIdsByRow.get(rowId) ?? new Set<string>()) : new Set<string>());
          if (current.has(seatId)) current.delete(seatId); else current.add(seatId);
          selectSeats(rowId, Array.from(current), false);
        }}
      />

      {/* Preview externo deshabilitado para MVP sin dependencias */}
    </main>
  );
}


