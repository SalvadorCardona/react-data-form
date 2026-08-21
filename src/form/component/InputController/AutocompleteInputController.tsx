import { Input } from "@/ui/input"
import { InputControllerInterface } from "@/form/InputControllerInterface"
import { FormInputInterface } from "@/form/FormInputInterface"
import React, { useRef, useState } from "react"
import { cn } from "@/ui/cn"
import { ValueOptionInterface } from "@/form/utils/valueOption"
import { Trans } from "@/i18n/components/Trans"

export const AutocompleteInputController = ({
  formInput,
  onChange,
}: InputControllerInterface<FormInputInterface<string>>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localSuggestions, setLocalSuggestions] = useState<ValueOptionInterface[]>(
    []
  )
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const localChange = (value: string) => {
    onChange({ ...formInput, value })
  }

  const handleSelect = (suggestion: ValueOptionInterface) => {
    localChange(suggestion.value as string)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleInputChange = async (value: string) => {
    localChange(value)
    setHighlightedIndex(-1)
    if (value) {
      setIsOpen(true)
      if (formInput?.onSearch) {
        const results = await formInput.onSearch(value)
        setLocalSuggestions(results)
      }
    } else {
      setIsOpen(false)
      setLocalSuggestions([])
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[highlightedIndex])
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const inputValue = formInput.value ?? ""
  const suggestions =
    localSuggestions.length > 0 ? localSuggestions : (formInput.valueOptions ?? [])
  const showDropdown = isOpen && suggestions.length > 0

  return (
    <div ref={containerRef} className="relative w-full" onBlur={handleBlur}>
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (inputValue && suggestions.length > 0) setIsOpen(true)
        }}
        onKeyDown={handleKeyDown}
        placeholder={formInput.placeholder}
        className={cn("w-full", formInput.className)}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-activedescendant={
          highlightedIndex >= 0
            ? `autocomplete-option-${highlightedIndex}`
            : undefined
        }
      />
      {showDropdown && (
        <ul
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          {suggestions.map((option, index) => (
            <li
              key={`auto-complete-${option.value}-${option.label}`}
              id={`autocomplete-option-${index}`}
              role="option"
              aria-selected={option.value === inputValue}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option)}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                index === highlightedIndex && "bg-accent text-accent-foreground",
                option.value === inputValue && "font-medium"
              )}
            >
              <Trans>{option.label as string}</Trans>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
