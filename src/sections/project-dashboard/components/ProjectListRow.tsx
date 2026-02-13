'use client'

import { Calendar, User, ChevronRight } from 'lucide-react'
import type { Project, ProjectStatus, ProjectType } from '@/../product/sections/project-dashboard/types'
import { parseFlexibleDate } from '@/lib/utils'

interface ProjectListRowProps {
  project: Project
  onClick?: () => void
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  },
  active: {
    label: 'Active',
    className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  },
  on_hold: {
    label: 'On Hold',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
}

const typeConfig: Record<ProjectType, { className: string }> = {
  A: { className: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20' },
  B: { className: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20' },
  C: { className: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' },
  D: { className: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800' },
  E: { className: 'text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50' },
  Production: { className: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
}

function getCompletenessColor(completeness: number): string {
  if (completeness >= 80) return 'bg-lime-500'
  if (completeness >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  const date = parseFlexibleDate(dateString)
  if (!date) return dateString
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ProjectListRow({ project, onClick }: ProjectListRowProps) {
  const status = statusConfig[project.status]
  const type = project.projectType ? typeConfig[project.projectType] : null

  return (
    <button
      onClick={onClick}
      className="group w-full text-left flex items-center gap-4 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 focus:outline-none focus:bg-sky-50 dark:focus:bg-sky-900/20"
    >
      {/* Type Badge */}
      <div className="w-10 shrink-0">
        {type ? (
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${type.className}`}>
            {project.projectType}
          </span>
        ) : (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            —
          </span>
        )}
      </div>

      {/* Project Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-sky-600 dark:text-sky-400 font-['IBM_Plex_Mono']">
            {project.caseId}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>
        <p className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100 truncate font-['DM_Sans'] group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
          {project.title}
        </p>
      </div>

      {/* Client */}
      <div className="hidden sm:block w-32 shrink-0">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate font-['DM_Sans']">
          {project.client}
        </p>
      </div>

      {/* Completeness */}
      <div className="hidden md:flex items-center gap-2 w-24 shrink-0">
        <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${getCompletenessColor(project.completeness)}`}
            style={{ width: `${project.completeness}%` }}
          />
        </div>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 w-8 text-right font-['DM_Sans']">
          {project.completeness}%
        </span>
      </div>

      {/* Deadline */}
      <div className="hidden lg:flex items-center gap-1.5 w-28 shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
        <Calendar className="h-3.5 w-3.5" />
        <span className="font-['DM_Sans']">{formatDate(project.deadline)}</span>
      </div>

      {/* Team Lead */}
      <div className="hidden xl:flex items-center gap-1.5 w-28 shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
        <User className="h-3.5 w-3.5" />
        <span className="truncate font-['DM_Sans']">{project.teamLead || '—'}</span>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors shrink-0" />
    </button>
  )
}
