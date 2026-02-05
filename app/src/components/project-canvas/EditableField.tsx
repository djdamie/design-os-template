'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, X, Sparkles, ChevronDown, Plus, Calendar, ExternalLink, User } from 'lucide-react'
import type { EditableFieldProps, ReferenceTrack } from './types'

const priorityStyles = {
  critical: {
    empty: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10',
    label: 'text-red-600 dark:text-red-400',
  },
  important: {
    empty: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10',
    label: 'text-amber-600 dark:text-amber-400',
  },
  helpful: {
    empty: 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50',
    label: 'text-zinc-400 dark:text-zinc-500',
  },
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  if (Array.isArray(value)) {
    if (value.length === 0) return ''
    return value.join(', ')
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object' && 'name' in (value as object)) {
    return (value as { name: string }).name
  }
  return String(value)
}

export function EditableField({ field, teamMembers = [], onUpdate }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<unknown>(field.value)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isEmpty = field.status === 'empty' || !field.value || (Array.isArray(field.value) && field.value.length === 0)
  const isAiFilled = field.status === 'ai-filled'

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = () => {
    onUpdate?.(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(field.value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && field.type !== 'textarea') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const toggleArrayValue = (item: string) => {
    const currentArray = Array.isArray(editValue) ? editValue : []
    if (currentArray.includes(item)) {
      setEditValue(currentArray.filter((v) => v !== item))
    } else {
      setEditValue([...currentArray, item])
    }
  }

  const renderEditInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-sky-300 dark:border-sky-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none font-['DM_Sans']"
            placeholder={field.placeholder}
          />
        )

      case 'select':
        return (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm border border-sky-300 dark:border-sky-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <span className="font-['DM_Sans']">{String(editValue || field.placeholder || 'Select...')}</span>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </button>
            {showDropdown && field.options && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-auto">
                {field.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setEditValue(option)
                      setShowDropdown(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 font-['DM_Sans'] ${
                      editValue === option ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400' : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )

      case 'multi-select':
      case 'tags':
        return (
          <div ref={dropdownRef} className="relative">
            <div className="flex flex-wrap gap-1.5 p-2 border border-sky-300 dark:border-sky-600 rounded-lg bg-white dark:bg-zinc-800 min-h-[42px]">
              {Array.isArray(editValue) &&
                editValue.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-xs font-['DM_Sans']"
                  >
                    {item}
                    <button
                      onClick={() => toggleArrayValue(item)}
                      className="hover:text-sky-900 dark:hover:text-sky-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <Plus className="h-3 w-3" />
                <span className="font-['DM_Sans']">Add</span>
              </button>
            </div>
            {showDropdown && field.options && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-auto">
                {field.options
                  .filter((opt) => !Array.isArray(editValue) || !editValue.includes(opt))
                  .map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleArrayValue(option)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-['DM_Sans']"
                    >
                      {option}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )

      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditValue(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all font-['DM_Sans'] ${
                editValue === true
                  ? 'bg-sky-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setEditValue(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all font-['DM_Sans'] ${
                editValue === false
                  ? 'bg-sky-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
              }`}
            >
              No
            </button>
          </div>
        )

      case 'date':
        return (
          <div className="relative">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="date"
              value={String(editValue || '')}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 text-sm border border-sky-300 dark:border-sky-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-['DM_Sans']"
            />
          </div>
        )

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">€</span>
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="number"
              value={String(editValue || '')}
              onChange={(e) => setEditValue(Number(e.target.value))}
              onKeyDown={handleKeyDown}
              className="w-full pl-7 pr-3 py-2 text-sm border border-sky-300 dark:border-sky-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-['DM_Sans']"
              placeholder={field.placeholder}
            />
          </div>
        )

      case 'team-select':
        return (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm border border-sky-300 dark:border-sky-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <span className="flex items-center gap-2 font-['DM_Sans']">
                {editValue && typeof editValue === 'object' && 'name' in editValue ? (
                  <>
                    <User className="h-4 w-4 text-zinc-400" />
                    {(editValue as { name: string }).name}
                  </>
                ) : (
                  <span className="text-zinc-400">{field.placeholder || 'Select team member...'}</span>
                )}
              </span>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </button>
            {showDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-auto">
                <button
                  onClick={() => {
                    setEditValue(null)
                    setShowDropdown(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 font-['DM_Sans']"
                >
                  Unassigned
                </button>
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setEditValue({ id: member.id, name: member.name, avatar: member.avatar })
                      setShowDropdown(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="font-['DM_Sans']">{member.name}</p>
                        <p className="text-xs text-zinc-400 font-['DM_Sans']">{member.role}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )

      case 'url':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="url"
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 text-sm border border-sky-300 dark:border-sky-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-['DM_Sans']"
            placeholder={field.placeholder || 'https://...'}
          />
        )

      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={field.type === 'email' ? 'email' : 'text'}
            value={String(editValue || '')}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 text-sm border border-sky-300 dark:border-sky-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-['DM_Sans']"
            placeholder={field.placeholder}
          />
        )
    }
  }

  const renderDisplayValue = () => {
    if (isEmpty) {
      return (
        <span className={`text-sm italic ${priorityStyles[field.priority].label} font-['DM_Sans']`}>
          {field.priority === 'critical' ? 'Required' : field.placeholder || 'Not set'}
        </span>
      )
    }

    if (field.type === 'reference-list' && Array.isArray(field.value)) {
      return (
        <div className="space-y-1.5">
          {(field.value as ReferenceTrack[]).map((track, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="font-medium text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
                {track.artist}
              </span>
              {track.title && (
                <>
                  <span className="text-zinc-400">—</span>
                  <span className="text-zinc-600 dark:text-zinc-400 font-['DM_Sans']">{track.title}</span>
                </>
              )}
              {track.notes && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-['DM_Sans']">
                  ({track.notes})
                </span>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (field.type === 'url' && field.value) {
      return (
        <a
          href={String(field.value)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:underline font-['DM_Sans']"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {String(field.value).replace(/^https?:\/\//, '').slice(0, 30)}...
        </a>
      )
    }

    if ((field.type === 'multi-select' || field.type === 'tags') && Array.isArray(field.value)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {field.value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-['DM_Sans']"
            >
              {item}
            </span>
          ))}
        </div>
      )
    }

    if (field.type === 'team-select' && field.value && typeof field.value === 'object') {
      const member = field.value as { name: string }
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
          <User className="h-4 w-4 text-zinc-400" />
          {member.name}
        </span>
      )
    }

    if (field.type === 'date' && field.value) {
      const rawValue = String(field.value)
      const isoDateOnlyMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      const date = isoDateOnlyMatch
        ? new Date(
            Number(isoDateOnlyMatch[1]),
            Number(isoDateOnlyMatch[2]) - 1,
            Number(isoDateOnlyMatch[3])
          )
        : new Date(rawValue)
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
          <Calendar className="h-4 w-4 text-zinc-400" />
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    }

    if (field.type === 'currency' && field.value) {
      return (
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
          €{Number(field.value).toLocaleString()}
        </span>
      )
    }

    return (
      <span className="text-sm text-zinc-900 dark:text-zinc-100 font-['DM_Sans'] whitespace-pre-wrap">
        {formatValue(field.value)}
      </span>
    )
  }

  return (
    <div
      className={`
        group relative rounded-lg border p-3 transition-all duration-200
        ${isEmpty ? priorityStyles[field.priority].empty : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}
        ${isEditing ? 'ring-2 ring-sky-500 border-transparent' : ''}
      `}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
          {field.label}
        </span>
        <div className="flex items-center gap-2">
          {isAiFilled && !isEditing && (
            <span className="inline-flex items-center gap-1 text-[10px] text-sky-500 font-['DM_Sans']">
              <Sparkles className="h-3 w-3" />
              AI suggested
            </span>
          )}
          {isEmpty && field.priority === 'critical' && (
            <span className="text-[10px] font-medium text-red-500 font-['DM_Sans']">Required</span>
          )}
        </div>
      </div>

      {/* Value / Edit */}
      {isEditing ? (
        <div className="space-y-2">
          {renderEditInput()}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-['DM_Sans']"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white text-xs rounded-md hover:bg-sky-600 font-['DM_Sans']"
            >
              <Check className="h-3 w-3" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setEditValue(field.value)
            setIsEditing(true)
          }}
          className="w-full text-left min-h-[24px]"
        >
          {renderDisplayValue()}
        </button>
      )}
    </div>
  )
}
