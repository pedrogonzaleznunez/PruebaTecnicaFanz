"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

interface AccordionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  disabled?: boolean
  className?: string
}

export function Accordion({ 
  title, 
  children, 
  defaultOpen = true, 
  disabled = false,
  className 
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={cn("border border-gray-200 rounded-2xl", className)}>
      <button
        onClick={toggle}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-colors",
          disabled 
            ? "text-gray-400 cursor-not-allowed" 
            : "text-gray-800 hover:bg-gray-50 cursor-pointer"
        )}
      >
        <span className="text-sm font-semibold">{title}</span>
        {!disabled && (
          isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )
        )}
      </button>
      
      {isOpen && !disabled && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
      
      {disabled && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400 italic">
            {title === "Filas" ? "Selecciona una platea primero" :
             title === "Asientos" ? "Selecciona filas primero" :
             "No disponible"}
          </p>
        </div>
      )}
    </div>
  )
}
