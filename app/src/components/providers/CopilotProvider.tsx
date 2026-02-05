'use client'

import { CopilotKit } from '@copilotkit/react-core'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

interface CopilotProviderProps {
  children: React.ReactNode
}

export function CopilotProvider({ children }: CopilotProviderProps) {
  const pathname = usePathname()

  // Keep a stable thread per project so chat/agent state persists across refresh
  // and navigation within the same project workspace.
  const threadId = useMemo(() => {
    const match = pathname.match(/^\/projects\/([^/]+)/)
    if (!match || match[1] === 'new') {
      return undefined
    }
    return `project:${match[1]}`
  }, [pathname])

  // NOTE: No key prop! The threadId prop handles per-project isolation.
  // Using a key prop causes full CopilotKit tree remounts on navigation,
  // which blocks the main thread and freezes the UI.
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="brief_analyzer"
      threadId={threadId}
    >
      {children}
    </CopilotKit>
  )
}
