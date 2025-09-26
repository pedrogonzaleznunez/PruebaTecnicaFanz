"use client"

import React from "react"
import { Button } from "./button"
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "warning" | "danger" | "success" | "info"
  details?: string[]
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "info",
  details = []
}: ConfirmationDialogProps) {
  if (!open) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getIcon = () => {
    switch (variant) {
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-600" />
      case "danger":
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      default:
        return <Info className="h-6 w-6 text-blue-600" />
    }
  }

  const getHeaderColor = () => {
    switch (variant) {
      case "warning":
        return "text-amber-900"
      case "danger":
        return "text-red-900"
      case "success":
        return "text-green-900"
      default:
        return "text-blue-900"
    }
  }

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {getIcon()}
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${getHeaderColor()}`}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="text-base text-gray-800 leading-relaxed">
            {message}
          </p>
          
          {details.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <ul className="text-sm text-gray-700 space-y-2">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-slate-400 mt-1 font-bold">•</span>
                    <span className="text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          {cancelText && (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-2 border-2 border-slate-300 text-gray-700 hover:bg-slate-50 hover:border-slate-400 rounded-xl transition-all duration-200"
            >
              {cancelText}
            </Button>
          )}
          <Button 
            variant={getConfirmButtonVariant()} 
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
              variant === "danger" 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg" 
                : variant === "success"
                ? "text-white shadow-md hover:shadow-lg"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
            }`}
            style={variant === "success" ? { backgroundColor: '#22C55E' } : {}}
            onMouseEnter={variant === "success" ? (e) => e.currentTarget.style.backgroundColor = '#16A34A' : undefined}
            onMouseLeave={variant === "success" ? (e) => e.currentTarget.style.backgroundColor = '#22C55E' : undefined}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
