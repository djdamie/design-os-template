'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AppShell, type NavItem, type ProjectContext, type ChatMessage } from '@/components/shell'
import { useAuth } from './AuthProvider'

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

  // Real user from auth context
  const { user: authUser, tfUser, signOut, loading: authLoading } = useAuth()

  // Use tfUser when available, fall back to auth user metadata, or undefined (hides UserMenu)
  const user = tfUser
    ? {
        name: tfUser.name,
        email: tfUser.email,
        role: tfUser.role,
        avatarUrl: tfUser.avatar_url || undefined,
      }
    : authUser
      ? {
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: '',
        }
      : undefined

  // Skip shell on auth pages (login, password reset)
  const isAuthPage = pathname === '/login' || pathname.startsWith('/auth/reset-password')
  if (isAuthPage) {
    return <>{children}</>
  }

  // Navigation handlers
  const handleNavigate = (href: string) => {
    router.push(href)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
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
