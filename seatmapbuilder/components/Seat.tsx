"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

type SeatStatus = "available" | "occupied" | "selected" | "unlabeled"

interface SeatProps {
  id: string
  label: string
  status: SeatStatus
  x: number
  y: number
  onSelect?: () => void
  onStatusChange?: () => void
  isDragging?: boolean
  className?: string
}

export function Seat({ 
  label, 
  status, 
  x, 
  y, 
  onSelect, 
  onStatusChange, 
  isDragging = false,
  className = "" 
}: SeatProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStatusConfig = () => {
    switch (status) {
      case "available":
        return {
          bg: "bg-gray-200",
          hover: "hover:bg-gray-300",
          text: "text-gray-700",
          border: "border-gray-300",
          shadow: "shadow-sm"
        }
      case "occupied":
        return {
          bg: "bg-blue-900",
          hover: "hover:bg-blue-800",
          text: "text-white",
          border: "border-blue-900",
          shadow: "shadow-sm"
        }
      case "selected":
        return {
          bg: "bg-blue-600",
          hover: "hover:bg-blue-700",
          text: "text-white",
          border: "border-blue-600",
          shadow: "shadow-md"
        }
      case "unlabeled":
        return {
          bg: "bg-red-300",
          hover: "hover:bg-red-400",
          text: "text-white",
          border: "border-red-300",
          shadow: "shadow-sm"
        }
      default:
        return {
          bg: "bg-gray-200",
          hover: "hover:bg-gray-300",
          text: "text-gray-700",
          border: "border-gray-300",
          shadow: "shadow-sm"
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className="relative">
      <motion.div
        style={{ left: x, top: y }}
        className={`absolute w-11 h-11 ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isDragging ? { scale: 1.15, zIndex: 50 } : { scale: 1, zIndex: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div
          className={`
            w-full h-full rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center
            ${config.bg} ${config.hover} ${config.text} ${config.shadow}
            border-2 ${isHovered ? 'border-blue-500' : config.border}
            ${isDragging ? 'ring-4 ring-blue-200' : ''}
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onSelect}
          onContextMenu={(e) => {
            e.preventDefault()
            onStatusChange?.()
          }}
        >
          {status === "selected" ? (
            <Check className="w-5 h-5" strokeWidth={3} />
          ) : (
            <span className="text-xs font-bold select-none">
              {label.length > 2 ? label.slice(-2) : label}
            </span>
          )}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && !isDragging && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute -top-14 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-white text-gray-800 text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap">
                <div className="font-semibold">{label}</div>
                <div className="text-gray-500 capitalize">
                  {status === "available" ? "Libre" : 
                   status === "occupied" ? "Ocupado" : 
                   status === "selected" ? "Seleccionado" : "Sin etiqueta"}
                </div>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-200 rotate-45"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
