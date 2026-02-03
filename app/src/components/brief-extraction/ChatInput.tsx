'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import type { ChatInputProps } from './types'

export function ChatInput({
  placeholder = 'Paste a brief or ask a question...',
  disabled = false,
  onSubmit,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea up to 4 lines
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const lineHeight = 24 // approximately 1.5rem
      const maxHeight = lineHeight * 4
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }, [value])

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit?.(value.trim())
      setValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="
              w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-700
              bg-zinc-50 dark:bg-zinc-800 px-4 py-3 pr-12
              text-sm text-zinc-900 dark:text-zinc-100
              placeholder:text-zinc-400 dark:placeholder:text-zinc-500
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              font-['DM_Sans']
            "
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="
            flex h-11 w-11 items-center justify-center rounded-xl
            bg-sky-500 text-white
            hover:bg-sky-600 active:bg-sky-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
          "
        >
          {disabled ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
      <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-['DM_Sans']">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
