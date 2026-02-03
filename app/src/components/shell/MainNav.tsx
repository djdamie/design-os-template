'use client'

import {
  LayoutDashboard,
  Plus,
  Plug,
  ArrowLeft,
  FileEdit,
  GitBranch,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon?: LucideIcon
  isActive?: boolean
}

export interface ProjectContext {
  caseId: string
  caseTitle: string
}

export interface MainNavProps {
  items: NavItem[]
  projectContext?: ProjectContext
  onNavigate?: (href: string) => void
  onNewProject?: () => void
  onBackToProjects?: () => void
}

const iconMap: Record<string, LucideIcon> = {
  projects: LayoutDashboard,
  integrations: Plug,
  canvas: FileEdit,
  workflow: GitBranch,
}

export function MainNav({
  items,
  projectContext,
  onNavigate,
  onNewProject,
  onBackToProjects,
}: MainNavProps) {
  return (
    <nav className="space-y-1 px-3">
      {/* Back to projects (when in project context) */}
      {projectContext && (
        <>
          <button
            onClick={onBackToProjects}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-['DM_Sans']">Back to Projects</span>
          </button>

          {/* Active project indicator */}
          <div className="my-3 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-900/20">
            <p className="text-xs font-medium text-sky-600 dark:text-sky-400 font-['DM_Sans']">
              Active Project
            </p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-['IBM_Plex_Mono']">
              {projectContext.caseId}
            </p>
            <p className="mt-0.5 truncate text-xs text-zinc-600 dark:text-zinc-400 font-['DM_Sans']">
              {projectContext.caseTitle}
            </p>
          </div>

          <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />
        </>
      )}

      {/* Global navigation items */}
      {!projectContext && (
        <>
          {items
            .filter((item) => ['projects', 'integrations'].includes(item.href.replace('/', '')))
            .map((item) => {
              const Icon = item.icon || iconMap[item.href.replace('/', '')] || LayoutDashboard
              return (
                <NavButton
                  key={item.href}
                  item={item}
                  Icon={Icon}
                  onNavigate={onNavigate}
                />
              )
            })}

          {/* New Project button */}
          <button
            onClick={onNewProject}
            className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-lime-400 hover:bg-lime-50 hover:text-lime-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-lime-500 dark:hover:bg-lime-900/20 dark:hover:text-lime-400"
          >
            <Plus className="h-5 w-5" />
            <span className="font-['DM_Sans']">New Project</span>
          </button>

          <div className="my-3 border-t border-zinc-200 dark:border-zinc-800" />

          {/* Integrations */}
          {items
            .filter((item) => item.href === '/integrations')
            .map((item) => (
              <NavButton
                key={item.href}
                item={item}
                Icon={Plug}
                onNavigate={onNavigate}
              />
            ))}
        </>
      )}

      {/* Project-specific navigation items (Brief Extraction is now the chat panel) */}
      {projectContext && (
        <>
          {items
            .filter((item) =>
              ['canvas', 'workflow'].some((key) =>
                item.href.toLowerCase().includes(key)
              )
            )
            .map((item) => {
              const key = ['canvas', 'workflow'].find((k) =>
                item.href.toLowerCase().includes(k)
              )
              const Icon = item.icon || (key ? iconMap[key] : LayoutDashboard)
              return (
                <NavButton
                  key={item.href}
                  item={item}
                  Icon={Icon}
                  onNavigate={onNavigate}
                />
              )
            })}
        </>
      )}
    </nav>
  )
}

interface NavButtonProps {
  item: NavItem
  Icon: LucideIcon
  onNavigate?: (href: string) => void
}

function NavButton({ item, Icon, onNavigate }: NavButtonProps) {
  const isActive = item.isActive

  return (
    <button
      onClick={() => onNavigate?.(item.href)}
      className={`
        flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
        ${
          isActive
            ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400 border-l-2 border-sky-500'
            : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }
      `}
    >
      <Icon
        className={`h-5 w-5 ${isActive ? 'text-sky-500' : 'text-zinc-500 dark:text-zinc-500'}`}
      />
      <span className="font-['DM_Sans']">{item.label}</span>
    </button>
  )
}
