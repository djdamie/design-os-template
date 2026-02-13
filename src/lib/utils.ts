import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string in any common format and return a valid Date, or null if unparseable.
 * Handles: YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY, MM/DD/YYYY (with European preference),
 * and natural language formats like "March 15, 2025".
 */
export function parseFlexibleDate(input: string): Date | null {
  if (!input || typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null

  // DD.MM.YYYY or DD.MM.YY (European dot format)
  const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)
  if (dotMatch) {
    const [, d, m, y] = dotMatch
    const year = y.length === 2 ? 2000 + Number(y) : Number(y)
    const date = new Date(year, Number(m) - 1, Number(d))
    if (isValidParsedDate(date, Number(d), Number(m), year)) return date
  }

  // DD/MM/YYYY or DD/MM/YY — prefer European day-first interpretation
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (slashMatch) {
    const [, a, b, y] = slashMatch
    const year = y.length === 2 ? 2000 + Number(y) : Number(y)
    const numA = Number(a)
    const numB = Number(b)

    // If first number > 12, it must be a day (DD/MM/YYYY)
    if (numA > 12) {
      const date = new Date(year, numB - 1, numA)
      if (isValidParsedDate(date, numA, numB, year)) return date
    }
    // If second number > 12, it must be a day (MM/DD/YYYY)
    if (numB > 12) {
      const date = new Date(year, numA - 1, numB)
      if (isValidParsedDate(date, numB, numA, year)) return date
    }
    // Ambiguous — prefer European DD/MM/YYYY
    const date = new Date(year, numB - 1, numA)
    if (isValidParsedDate(date, numA, numB, year)) return date
  }

  // DD-MM-YYYY (day-first with dashes, but NOT YYYY-MM-DD)
  const dashDayFirst = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dashDayFirst) {
    const [, d, m, y] = dashDayFirst
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    if (isValidParsedDate(date, Number(d), Number(m), Number(y))) return date
  }

  // Fall back to native Date parsing (handles ISO YYYY-MM-DD, long formats, etc.)
  const native = new Date(trimmed)
  if (!isNaN(native.getTime())) return native

  return null
}

function isValidParsedDate(date: Date, day: number, month: number, year: number): boolean {
  return (
    !isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

/**
 * Normalize any date string to YYYY-MM-DD format for storage and HTML date inputs.
 * Returns the original string if it can't be parsed.
 */
export function normalizeDateToISO(input: string): string {
  const date = parseFlexibleDate(input)
  if (!date) return input
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
