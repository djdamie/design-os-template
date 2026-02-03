'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Sparkles, User } from 'lucide-react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export interface ChatPanelProps {
  isOpen: boolean
  onToggle: () => void
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
  currentContext?: string // e.g., "Project Canvas", "Workflow Tracker"
  projectCaseId?: string
}

export function ChatPanel({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  isLoading = false,
  currentContext,
  projectCaseId,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  // Keyboard shortcut handler (Cmd/Ctrl + /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        onToggle()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onToggle])

  return (
    <>
      {/* Toggle button (always visible when in project context) */}
      <button
        onClick={onToggle}
        className={`
          fixed right-4 top-1/2 -translate-y-1/2 z-30
          flex items-center gap-2 rounded-full px-3 py-2
          bg-sky-500 text-white shadow-lg
          hover:bg-sky-600 transition-all
          ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        aria-label="Open AI assistant"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-sm font-medium font-['DM_Sans'] hidden sm:inline">
          AI Assistant
        </span>
      </button>

      {/* Chat panel */}
      <div
        className={`
          fixed inset-y-0 right-0 z-40
          w-full sm:w-[400px]
          bg-white dark:bg-zinc-900
          border-l border-zinc-200 dark:border-zinc-800
          shadow-xl
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
              <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
                Brief Assistant
              </h2>
              {currentContext && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
                  Viewing: {currentContext}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Context banner */}
        {projectCaseId && (
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-['DM_Sans']">
              Working on{' '}
              <span className="font-mono font-semibold text-sky-600 dark:text-sky-400 font-['IBM_Plex_Mono']">
                {projectCaseId}
              </span>
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30 mb-3">
                <Sparkles className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 font-['DM_Sans']">
                How can I help?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
                Paste a brief, ask questions, or request changes to the project data.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30 shrink-0">
                <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-zinc-200 dark:border-zinc-800 p-4"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste a brief or ask a question..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-['DM_Sans'] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-400 font-['DM_Sans']">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-[10px]">⌘/</kbd> to toggle
          </p>
        </form>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}

interface ChatMessageBubbleProps {
  message: ChatMessage
}

function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
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

      {/* Message bubble */}
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isAssistant
            ? 'bg-zinc-100 dark:bg-zinc-800 border-l-2 border-sky-500'
            : 'bg-sky-50 dark:bg-sky-900/20'
        }`}
      >
        <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap font-['DM_Sans']">
          {message.content}
        </p>
      </div>
    </div>
  )
}
