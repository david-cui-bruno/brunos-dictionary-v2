'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BROWN_CONCENTRATIONS } from '@/lib/concentrations'

interface ConcentrationSelectorProps {
  value: string[]
  onChange: (concentrations: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function ConcentrationSelector({
  value = [],
  onChange,
  placeholder = "Add concentration(s)",
  disabled = false,
  className
}: ConcentrationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isShaking, setIsShaking] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<(HTMLDivElement | null)[]>([])

  // Filter concentrations based on search term, treating each concentration as a single unit
  const filteredConcentrations = BROWN_CONCENTRATIONS.filter(concentration =>
    concentration.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Highlight matching text in search results
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <strong key={index} className="font-semibold">{part}</strong>
      ) : (
        part
      )
    )
  }

  // Handle concentration selection - ensure we're treating each concentration as a single unit
  const handleSelect = useCallback((concentration: string) => {
    if (value.length >= 2) return
    
    // Add the entire concentration string as one unit
    if (!value.includes(concentration)) {
      onChange([...value, concentration])
    }
    
    setSearchTerm('')
    setHighlightedIndex(-1)
    
    if (value.length + 1 >= 2) {
      setIsOpen(false)
    }
  }, [value, onChange])

  // Handle concentration removal
  const handleRemove = useCallback((index: number) => {
    const newValue = value.filter((_, i) => i !== index)
    onChange(newValue)
    
    // Re-enable dropdown if we're under the limit
    if (newValue.length < 2) {
      setIsOpen(true)
      searchInputRef.current?.focus()
    }
  }, [value, onChange])

  // Handle clear all concentrations
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
    setSearchTerm('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [onChange])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setHighlightedIndex(0)
        } else {
          setHighlightedIndex(prev => 
            prev < filteredConcentrations.length - 1 ? prev + 1 : prev
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
          handleSelect(filteredConcentrations[highlightedIndex])
        } else if (value.length >= 2) {
          // Shake animation when trying to add more than 2
          setIsShaking(true)
          setTimeout(() => setIsShaking(false), 500)
        }
        break
        
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        setSearchTerm('')
        break
        
      case 'Backspace':
        if (!searchTerm && value.length > 0) {
          e.preventDefault()
          // Focus last chip for removal
          const lastChipRef = chipRefs.current[value.length - 1]
          lastChipRef?.focus()
        }
        break
    }
  }, [isOpen, highlightedIndex, filteredConcentrations, handleSelect, value, searchTerm, disabled])

  // Handle chip keydown
  const handleChipKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      handleRemove(index)
    }
  }, [handleRemove])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

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
          "flex flex-wrap items-center gap-2 cursor-text",
          "focus-within:ring-2 focus-within:ring-brown-primary focus-within:border-brown-primary",
          disabled && "opacity-50 cursor-not-allowed",
          isShaking && "animate-pulse"
        )}
        onClick={() => !disabled && value.length < 2 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-labelledby="concentration-label"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Selected Chips */}
        {value.map((concentration, index) => (
          <div
            key={concentration}
            ref={(el) => {
              chipRefs.current[index] = el
            }}
            className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-brown-primary text-white text-sm rounded-full min-h-[24px]"
            tabIndex={0}
            onKeyDown={(e) => handleChipKeyDown(e, index)}
          >
            <span className="leading-none">{concentration}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(index)
              }}
              className="ml-1 hover:bg-brown-dark rounded-full p-0.5 flex items-center justify-center"
              aria-label={`Remove ${concentration}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Search Input */}
        {value.length < 2 && (
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={value.length === 0 ? placeholder : "Search concentrations..."}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm"
            disabled={disabled}
          />
        )}

        {/* Clear Button and Caret */}
        <div className="ml-auto flex items-center gap-1">
          {/* Clear Button - only show when there are concentrations */}
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear all concentrations"
            >
              Clear
            </button>
          )}
          
          {/* Caret */}
          {value.length < 2 ? (
            isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && value.length < 2 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {/* Search Bar */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concentrations..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brown-primary"
              autoFocus
            />
          </div>

          {/* Results List */}
          <div className="py-1">
            {filteredConcentrations.length > 0 ? (
              filteredConcentrations.map((concentration, index) => (
                <div
                  key={concentration}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
                    highlightedIndex === index && "bg-brown-primary text-white hover:bg-brown-dark"
                  )}
                  onClick={() => handleSelect(concentration)}
                  role="option"
                  aria-selected={highlightedIndex === index}
                >
                  {highlightText(concentration, searchTerm)}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No concentration found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 