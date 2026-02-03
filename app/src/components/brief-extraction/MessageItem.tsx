'use client'

import { useState } from 'react'
import { Sparkles, User, Copy, Check } from 'lucide-react'
import type { ChatMessage, MessageItemProps } from './types'

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatFieldName(field: string): string {
  return field
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Simple markdown-ish rendering for tables and formatting
function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inTable = false
  let tableRows: string[][] = []
  let tableHeaders: string[] = []

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={elements.length} className="my-3 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {tableHeaders.map((header, i) => (
                  <th
                    key={i}
                    className="text-left px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 font-medium font-['DM_Sans']"
                  >
                    {header.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-['DM_Sans']"
                    >
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    tableHeaders = []
    tableRows = []
    inTable = false
  }

  lines.forEach((line, idx) => {
    // Table detection
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.slice(1, -1).split('|')
      if (line.includes('---')) {
        // Separator row
        return
      }
      if (!inTable) {
        inTable = true
        tableHeaders = cells
      } else {
        tableRows.push(cells)
      }
      return
    } else if (inTable) {
      flushTable()
    }

    // Headers
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={idx} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-4 mb-2 font-['DM_Sans']">
          {line.slice(3)}
        </h3>
      )
      return
    }

    // Bold text and inline formatting
    let formatted = line
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-100">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-sky-600 dark:text-sky-400 text-xs font-mono">$1</code>')

    // List items
    if (line.startsWith('- ')) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
          <span className="text-zinc-400 mt-1.5">•</span>
          <span
            className="text-zinc-700 dark:text-zinc-300 font-['DM_Sans']"
            dangerouslySetInnerHTML={{ __html: formatted.slice(2) }}
          />
        </div>
      )
      return
    }

    // Horizontal rule
    if (line === '---') {
      elements.push(<hr key={idx} className="my-4 border-zinc-200 dark:border-zinc-700" />)
      return
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={idx} className="h-2" />)
      return
    }

    // Regular paragraph
    elements.push(
      <p
        key={idx}
        className="text-zinc-700 dark:text-zinc-300 my-1 font-['DM_Sans']"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    )
  })

  // Flush any remaining table
  if (inTable) {
    flushTable()
  }

  return elements
}

export function MessageItem({ message, onCopy }: MessageItemProps) {
  const [copied, setCopied] = useState(false)
  const isAssistant = message.role === 'assistant'
  const hasFieldUpdates = message.fieldUpdates && message.fieldUpdates.length > 0

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    onCopy?.()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`group flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isAssistant
            ? 'bg-sky-100 dark:bg-sky-900/30'
            : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
      >
        {isAssistant ? (
          <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        ) : (
          <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-[85%] ${isAssistant ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`relative rounded-2xl px-4 py-3 ${
            isAssistant
              ? 'bg-zinc-100 dark:bg-zinc-800 border-l-2 border-sky-500'
              : 'bg-sky-500 text-white'
          }`}
        >
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${
              isAssistant
                ? 'hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                : 'hover:bg-sky-400 text-sky-100'
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {/* Message text */}
          <div className={`text-sm pr-8 ${isAssistant ? '' : 'whitespace-pre-wrap font-["DM_Sans"]'}`}>
            {isAssistant ? renderContent(message.content) : message.content}
          </div>
        </div>

        {/* Field updates badge */}
        {hasFieldUpdates && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-['DM_Sans'] mr-1">
              Updated:
            </span>
            {message.fieldUpdates!.slice(0, 5).map((field) => (
              <span
                key={field}
                className="inline-flex items-center rounded-full bg-lime-100 dark:bg-lime-900/30 px-2 py-0.5 text-[10px] font-medium text-lime-700 dark:text-lime-400 font-['DM_Sans'] animate-pulse"
              >
                {formatFieldName(field)}
              </span>
            ))}
            {message.fieldUpdates!.length > 5 && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-['DM_Sans']">
                +{message.fieldUpdates!.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className={`mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-['DM_Sans'] ${isAssistant ? '' : 'text-right'}`}>
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
