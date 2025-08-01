'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface YearSelectorProps {
  value: string
  onChange: (year: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Generate years from current year + 4 down to 1950 (descending order)
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR + 4 - 1950 + 1 }, (_, i) => 
  (CURRENT_YEAR + 4 - i).toString()
)

export default function YearSelector({
  value = '',
  onChange,
  placeholder = "Select graduation year",
  disabled = false,
  className
}: YearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setHighlightedIndex(0)
        } else {
          setHighlightedIndex(prev => 
            prev < YEARS.length - 1 ? prev + 1 : prev
          )
        }
        break
        
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        }
        break
        
      case 'Enter':
        e.preventDefault()
        if (isOpen && highlightedIndex >= 0) {
          handleSelect(YEARS[highlightedIndex])
        }
        break
        
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Handle year selection
  const handleSelect = (year: string) => {
    onChange(year)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full",
        className
      )}
    >
      {/* Field Container */}
      <div
        className={cn(
          "min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md bg-white",
          "flex items-center cursor-pointer",
          "focus-within:ring-2 focus-within:ring-brown-primary focus-within:border-brown-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Selected Value or Placeholder */}
        <span className={cn(
          "flex-1 text-sm",
          value ? "text-gray-900" : "text-gray-500"
        )}>
          {value || placeholder}
        </span>

        {/* Caret */}
        <div className="ml-auto">
          {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {YEARS.map((year, index) => (
            <div
              key={year}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
                highlightedIndex === index && "bg-brown-primary text-white hover:bg-brown-dark",
                value === year && "font-medium"
              )}
              onClick={() => handleSelect(year)}
              role="option"
              aria-selected={highlightedIndex === index}
            >
              {year}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 