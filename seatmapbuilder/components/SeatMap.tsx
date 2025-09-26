import { useState } from 'react';
import type { Row } from '../lib/schema';

type Props = {
  rows: Row[];
  selectedRowIds: Set<string>;
  selectedSeatIdsByRow: Map<string, Set<string>>;
  onToggleRow: (rowId: string, additive: boolean) => void;
  onToggleSeat: (rowId: string, seatId: string, additive: boolean) => void;
};

export default function SeatMap({ rows, selectedRowIds, selectedSeatIdsByRow, onToggleRow, onToggleSeat }: Props) {
  // Estado local para asientos ocupados (solo frontend)
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set());

  const toggleSeatOccupied = (seatId: string) => {
    setOccupiedSeats(prev => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }
      return next;
    });
  };

  return (
    <div className="mt-6 space-y-6">
      {rows.map(row => {
        const isRowSelected = selectedRowIds.has(row.id);
        const seatSel = selectedSeatIdsByRow.get(row.id) ?? new Set<string>();
        
        return (
          <div key={row.id} className="space-y-3">
            {/* Header de la fila */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-semibold ${isRowSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                  {row.label || 'Sin etiqueta'}
                </h3>
                {(!row.label || row.label.trim() === '') && (
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                    ⚠️ Sin etiqueta
                  </span>
                )}
              </div>
              <button
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isRowSelected 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={(e) => onToggleRow(row.id, e.shiftKey || e.metaKey)}
                title="Seleccionar fila (Shift/Cmd para múltiple)"
              >
                {isRowSelected ? 'Seleccionada' : 'Seleccionar'}
              </button>
            </div>

            {/* Grid de asientos */}
            <div className="grid grid-cols-10 gap-2 p-4 bg-gray-50 rounded-lg">
              {row.seats.map(seat => {
                const selected = seatSel.has(seat.id);
                const occupied = occupiedSeats.has(seat.id);
                
                return (
                  <button
                    key={seat.id}
                    className={`
                      w-8 h-8 rounded-full text-xs font-medium transition-all duration-200
                      flex items-center justify-center relative
                      ${selected 
                        ? 'ring-2 ring-emerald-500 ring-offset-2 bg-emerald-100 text-emerald-800' 
                        : occupied
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                      ${(!seat.label || seat.label.trim() === '') ? 'ring-1 ring-amber-400' : ''}
                    `}
                    onClick={(e) => {
                      if (e.doubleClick) {
                        // Doble click para cambiar estado ocupado/libre
                        toggleSeatOccupied(seat.id);
                      } else {
                        // Click simple para seleccionar
                        onToggleSeat(row.id, seat.id, e.shiftKey || e.metaKey);
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      toggleSeatOccupied(seat.id);
                    }}
                    title={`${seat.label || 'Sin etiqueta'} - Click: seleccionar, Doble click: ${occupied ? 'liberar' : 'ocupar'}`}
                  >
                    {seat.label || '?'}
                    {(!seat.label || seat.label.trim() === '') && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      
      {/* Leyenda */}
      <div className="mt-6 p-4 bg-white rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Leyenda:</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-600"></div>
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 ring-2 ring-emerald-500"></div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-200 ring-1 ring-amber-400 relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"></div>
            </div>
            <span>Sin etiqueta</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Click: seleccionar • Doble click: ocupar/liberar
        </p>
      </div>
    </div>
  );
}


