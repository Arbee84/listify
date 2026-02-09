'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ListItemInputProps {
  rank: number
  value: string
  onChange: (value: string) => void
  onClear: () => void
  categoryId: number | null
  existingItems: string[]
  disabled?: boolean
}

const colors = [
  { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30' },
  { bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-100 dark:bg-green-900/30' },
  { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30' },
  { bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-100 dark:bg-red-900/30' },
  { bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30' },
]

export function ListItemInput({
  rank,
  value,
  onChange,
  onClear,
  categoryId,
  existingItems,
  disabled,
}: ListItemInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const color = colors[rank - 1]

  useEffect(() => {
    // Only fetch suggestions if value is 3+ characters and category is selected
    if (value.length < 3 || !categoryId) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    const timeoutId = setTimeout(() => {
      fetch(`/api/suggestions?query=${encodeURIComponent(value)}&category_id=${categoryId}`)
        .then(res => res.json())
        .then(data => {
          // Filter out items already in the list (case-insensitive)
          const filtered = data.filter(
            (suggestion: string) => !existingItems.some(
              existing => existing.toLowerCase() === suggestion.toLowerCase()
            )
          )
          setSuggestions(filtered)
          setShowSuggestions(filtered.length > 0)
        })
        .catch(error => console.error('Error fetching suggestions:', error))
        .finally(() => setIsLoading(false))
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [value, categoryId, existingItems])

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    if (newValue.length >= 3) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Rank badge */}
        <div className={`flex-shrink-0 w-10 h-10 ${color.bg} rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">{rank}</span>
        </div>

        {/* Input with suggestions */}
        <div className="flex-1 relative">
          <div className={`${color.light} rounded-lg border-2 ${value ? color.text + ' border-current' : 'border-transparent'}`}>
            <Input
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => value.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={`Enter item #${rank}`}
              disabled={disabled}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-center font-medium"
            />
          </div>

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50">
              <Command className="rounded-lg border shadow-md">
                <CommandList>
                  {isLoading ? (
                    <CommandEmpty>Loading...</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {suggestions.map((suggestion, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => handleSelectSuggestion(suggestion)}
                          className="cursor-pointer"
                        >
                          {suggestion}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>
          )}
        </div>

        {/* Clear button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClear}
          disabled={disabled || !value}
          className="flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
