'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { MainNav, type NavItem, type ProjectContext } from './MainNav'
import { UserMenu, type User } from './UserMenu'
import { ChatPanel, type ChatMessage } from './ChatPanel'

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavItem[]
  projectContext?: ProjectContext
  user?: User
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onNewProject?: () => void
  onBackToProjects?: () => void
  // Chat panel props
  chatMessages?: ChatMessage[]
  onSendChatMessage?: (message: string) => void
  isChatLoading?: boolean
  currentViewName?: string // e.g., "Project Canvas", "Workflow Tracker"
  hideChat?: boolean // Hide shell chat when page has its own integrated chat
}

export function AppShell({
  children,
  navigationItems,
  projectContext,
  user,
  onNavigate,
  onLogout,
  onNewProject,
  onBackToProjects,
  chatMessages = [],
  onSendChatMessage,
  isChatLoading = false,
  currentViewName,
  hideChat = false,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  // Chat is only available when in project context and not hidden
  // (hidden when page has its own integrated CopilotKit chat)
  const showChat = !!projectContext && !hideChat

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-zinc-100 dark:bg-zinc-900
          transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Header */}
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <button
            onClick={() => onNavigate?.('/')}
            className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white text-sm font-bold">
              TF
            </div>
            <span className="font-['DM_Sans']">Project Builder</span>
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <MainNav
            items={navigationItems}
            projectContext={projectContext}
            onNavigate={(href) => {
              onNavigate?.(href)
              setSidebarOpen(false)
            }}
            onNewProject={onNewProject}
            onBackToProjects={onBackToProjects}
          />
        </div>

        {/* User Menu */}
        {user && (
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="ml-3 font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
              {projectContext?.caseId || 'TF Project Builder'}
            </span>
          </div>
        </header>

        {/* Page content - adjusts width when chat is open on desktop */}
        <main
          className={`
            flex-1 overflow-auto bg-white dark:bg-zinc-950
            transition-all duration-300 ease-in-out
            ${showChat && chatOpen ? 'sm:mr-[400px]' : ''}
          `}
        >
          {children}
        </main>
      </div>

      {/* Chat Panel (only when in project context) */}
      {showChat && (
        <ChatPanel
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
          messages={chatMessages}
          onSendMessage={onSendChatMessage || (() => {})}
          isLoading={isChatLoading}
          currentContext={currentViewName}
          projectCaseId={projectContext?.caseId}
        />
      )}
    </div>
  )
}
