'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, X, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { searchHousesWithScore, highlightMatch, DEMO_HOUSES, type House } from '@/lib/houses'
import { cn } from '@/lib/utils'

type AddressAutocompleteProps = {
  houses?: House[]
  value: string
  onChange: (value: string) => void
  onSelect: (house: House) => void
  onOpen: (house: House) => void
  selectedSlug?: string | null
}

export function AddressAutocomplete({
  houses = DEMO_HOUSES,
  value,
  onChange,
  onSelect,
  onOpen,
  selectedSlug,
}: AddressAutocompleteProps) {
  const t = useTranslations('map')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [debouncedQuery, setDebouncedQuery] = useState(value)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(value), 120)
    return () => clearTimeout(timer)
  }, [value])

  const suggestions = searchHousesWithScore(debouncedQuery, houses, 8)
  const showDropdown = isOpen && suggestions.length > 0
  const isShowingFeatured = !debouncedQuery.trim()

  useEffect(() => {
    setActiveIndex(0)
  }, [debouncedQuery])

  useEffect(() => {
    if (!showDropdown || !listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, showDropdown])

  const pickSuggestion = useCallback(
    (house: House, open = false) => {
      onChange(house.address)
      onSelect(house)
      setIsOpen(false)
      if (open) onOpen(house)
    },
    [onChange, onSelect, onOpen]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions[activeIndex]) {
          pickSuggestion(suggestions[activeIndex], true)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  return (
    <div ref={wrapperRef} className="address-autocomplete">
      <div className={cn('map-search-bar', isOpen && 'map-search-bar--focused')}>
        <Search className="h-5 w-5 text-accent shrink-0" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="address-suggestions"
          className="map-search-input"
          placeholder={t('searchPlaceholder')}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 180)}
          onKeyDown={handleKeyDown}
          enterKeyHint="search"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              setIsOpen(true)
              inputRef.current?.focus()
            }}
            className="map-search-clear"
            aria-label={t('clear')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="address-suggestions"
          ref={listRef}
          role="listbox"
          className="address-autocomplete-dropdown"
        >
          {isShowingFeatured && (
            <div className="address-autocomplete-label">
              <Sparkles className="h-3 w-3" />
              {t('featuredHouses')}
            </div>
          )}

          {suggestions.map((house, index) => {
            const parts = highlightMatch(`${house.street} ${house.houseNumber}`, debouncedQuery)
            const isActive = index === activeIndex
            const isSelected = selectedSlug === house.slug

            return (
              <button
                key={house.slug}
                type="button"
                role="option"
                aria-selected={isActive}
                data-active={isActive}
                className={cn(
                  'address-autocomplete-item',
                  isActive && 'address-autocomplete-item--active',
                  isSelected && 'address-autocomplete-item--selected'
                )}
                onMouseDown={() => pickSuggestion(house, true)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div
                  className={cn(
                    'address-autocomplete-number',
                    house.featured && 'address-autocomplete-number--featured'
                  )}
                >
                  {house.houseNumber}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="font-medium text-sm truncate">
                    {parts.map((part, i) =>
                      part.match ? (
                        <mark key={i} className="address-autocomplete-highlight">
                          {part.text}
                        </mark>
                      ) : (
                        <span key={i}>{part.text}</span>
                      )
                    )}
                  </div>
                  <div className="text-xs text-muted">
                    {house.district} · {house.apartmentCount} {t('apartments')}
                  </div>
                </div>
                <MapPin className="h-4 w-4 text-accent shrink-0 opacity-60" />
              </button>
            )
          })}

          <div className="address-autocomplete-footer">
            <kbd>↑↓</kbd> {t('navigate')} · <kbd>Enter</kbd> {t('select')}
          </div>
        </div>
      )}
    </div>
  )
}