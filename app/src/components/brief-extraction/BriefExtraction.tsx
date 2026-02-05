'use client'

import { useRef, useEffect } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { MessageItem } from './MessageItem'
import { SuggestionChips } from './SuggestionChips'
import { ChatInput } from './ChatInput'
import type { BriefExtractionProps } from './types'

export function BriefExtraction({
  projectContext,
  messages,
  suggestionChips,
  isProcessing = false,
  onSendMessage,
  onChipClick,
  onCopyMessage,
}: BriefExtractionProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages])

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
              <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
                Brief Extraction
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
                {projectContext.caseTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1">
              <div
                className={`h-2 w-2 rounded-full ${
                  projectContext.completeness >= 90
                    ? 'bg-lime-500'
                    : projectContext.completeness >= 70
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 font-['DM_Sans']">
                {projectContext.completeness}% complete
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-900/30 mb-4">
              <FileText className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans'] mb-2">
              Paste your brief to get started
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-['DM_Sans'] max-w-sm">
              Copy and paste the client email or brief document below. I&apos;ll extract the key details
              and help identify any missing information.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onCopy={() => onCopyMessage?.(message.id)}
              />
            ))}
            {isProcessing && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
                  <Loader2 className="h-4 w-4 text-sky-600 dark:text-sky-400 animate-spin" />
                </div>
                <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
                      Analyzing brief...
                    </span>
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      {suggestionChips.length > 0 && !isProcessing && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4">
          <SuggestionChips chips={suggestionChips} onChipClick={onChipClick} />
        </div>
      )}

      {/* Input */}
      <ChatInput
        placeholder="Paste a brief or ask a question..."
        disabled={isProcessing}
        onSubmit={onSendMessage}
      />
    </div>
  )
}
