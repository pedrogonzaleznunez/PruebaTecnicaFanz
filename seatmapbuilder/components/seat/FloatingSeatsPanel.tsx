"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

import { Button } from "@components/ui/button"

interface FloatingSeatsPanelProps {
  selectedSeats: number
  onMarkAsAvailable: () => void
  onMarkAsOccupied: () => void
  onClose: () => void
}

export function FloatingSeatsPanel({ 
  selectedSeats, 
  onMarkAsAvailable, 
  onMarkAsOccupied, 
  onClose 
}: FloatingSeatsPanelProps) {
  if (selectedSeats === 0) return null

  return (
    <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-50 min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Asientos Seleccionados ({selectedSeats})
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button 
          onClick={onMarkAsAvailable} 
          variant="outline" 
          size="sm"
          className="w-full justify-start border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-xl text-sm"
        >
          <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
          Marcar como Libres
        </Button>
        <Button 
          onClick={onMarkAsOccupied} 
          variant="outline" 
          size="sm"
          className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 rounded-xl text-sm"
        >
          <div className="w-3 h-3 rounded-full bg-blue-900 mr-2"></div>
          Marcar como Ocupados
        </Button>
      </div>
    </div>
  )
}
