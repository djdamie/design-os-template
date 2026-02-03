'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AppShell, type NavItem, type ProjectContext, type ChatMessage } from '@/components/shell'

interface ShellProviderProps {
  children: React.ReactNode
}

export function ShellProvider({ children }: ShellProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Detect if we're in a project context from the path
  const projectContext = useMemo<ProjectContext | undefined>(() => {
    const match = pathname.match(/^\/projects\/([^/]+)/)
    if (match && match[1] !== 'new') {
      const projectId = match[1]
      // In a real app, we'd fetch the project details
      // For now, use a placeholder
      return {
        caseId: projectId,
        caseTitle: 'Project Title', // Will be fetched from API
      }
    }
    return undefined
  }, [pathname])

  // Check if we're on the new project (brief extraction) page
  const isNewProject = pathname === '/projects/new'

  // Check if we're on a project detail page (has its own integrated chat)
  const isProjectDetailPage = projectContext && !pathname.includes('/canvas') && !pathname.includes('/workflow')

  // Determine current view name for chat context
  const currentViewName = useMemo(() => {
    if (isNewProject) return 'Brief Extraction'
    if (pathname.includes('/canvas')) return 'Project Canvas'
    if (pathname.includes('/workflow')) return 'Workflow Tracker'
    if (projectContext) return 'Brief Workspace'
    return undefined
  }, [pathname, projectContext, isNewProject])

  // Hide shell chat on pages that have their own integrated CopilotKit chat
  // (Brief Workspace and New Project pages have their own chat panels)
  const hideShellChat = isNewProject || isProjectDetailPage

  // Navigation items based on context
  const navigationItems = useMemo<NavItem[]>(() => {
    if (projectContext) {
      // Project-specific navigation
      const projectId = projectContext.caseId
      return [
        {
          label: 'Project Canvas',
          href: `/projects/${projectId}/canvas`,
          isActive: pathname === `/projects/${projectId}/canvas`,
        },
        {
          label: 'Workflow',
          href: `/projects/${projectId}/workflow`,
          isActive: pathname === `/projects/${projectId}/workflow`,
        },
      ]
    }

    // Global navigation
    return [
      {
        label: 'Projects',
        href: '/projects',
        isActive: pathname === '/projects',
      },
      {
        label: 'Integrations',
        href: '/integrations',
        isActive: pathname === '/integrations',
      },
    ]
  }, [pathname, projectContext])

  // Mock user (will be replaced with Supabase auth)
  const user = {
    name: 'Music Supervisor',
    email: 'ms@trackfinder.io',
    role: 'Music Supervisor',
  }

  // Navigation handlers
  const handleNavigate = (href: string) => {
    router.push(href)
  }

  const handleLogout = () => {
    // Will be implemented with Supabase auth
    console.log('Logout clicked')
  }

  const handleNewProject = () => {
    router.push('/projects/new')
  }

  const handleBackToProjects = () => {
    router.push('/projects')
  }

  // Chat handlers (placeholder for CopilotKit integration)
  const handleSendChatMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, userMessage])

    // Simulate AI response (will be replaced with CopilotKit)
    setIsChatLoading(true)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I received your message: "${message}". CopilotKit integration will be added in a future milestone.`,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, assistantMessage])
      setIsChatLoading(false)
    }, 1000)
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      projectContext={projectContext}
      user={user}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onNewProject={handleNewProject}
      onBackToProjects={handleBackToProjects}
      chatMessages={chatMessages}
      onSendChatMessage={handleSendChatMessage}
      isChatLoading={isChatLoading}
      currentViewName={currentViewName}
      hideChat={hideShellChat}
    >
      {children}
    </AppShell>
  )
}
