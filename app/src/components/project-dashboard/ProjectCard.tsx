'use client'

import { Calendar, User, TrendingUp } from 'lucide-react'
import type { Project, ProjectStatus, ProjectType } from './types'

interface ProjectCardProps {
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
  A: { className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 ring-1 ring-violet-200 dark:ring-violet-800' },
  B: { className: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 ring-1 ring-sky-200 dark:ring-sky-800' },
  C: { className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-800' },
  D: { className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700' },
  E: { className: 'bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-500 ring-1 ring-zinc-200 dark:ring-zinc-700' },
  Production: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800' },
}

function getCompletenessColor(completeness: number): string {
  if (completeness >= 80) return 'bg-lime-500'
  if (completeness >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status]
  const type = project.projectType ? typeConfig[project.projectType] : null

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-all duration-200 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-lg hover:shadow-sky-100/50 dark:hover:shadow-sky-900/20 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-semibold text-sky-600 dark:text-sky-400 truncate font-['IBM_Plex_Mono']">
            {project.caseId}
          </p>
          <h3 className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100 truncate font-['DM_Sans'] group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
            {project.title}
          </h3>
        </div>
        {type && (
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${type.className}`}>
            {project.projectType}
          </span>
        )}
      </div>

      {/* Client */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 font-['DM_Sans']">
        {project.client}
        {project.agency && (
          <span className="text-zinc-400 dark:text-zinc-500"> via {project.agency}</span>
        )}
      </p>

      {/* Completeness Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-zinc-500 dark:text-zinc-400 font-['DM_Sans'] flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Completeness
          </span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-['DM_Sans']">
            {project.completeness}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getCompletenessColor(project.completeness)}`}
            style={{ width: `${project.completeness}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>

        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {project.deadline && (
            <span className="flex items-center gap-1 font-['DM_Sans']">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(project.deadline)}
            </span>
          )}
          {project.teamLead && (
            <span className="flex items-center gap-1 font-['DM_Sans']">
              <User className="h-3.5 w-3.5" />
              {project.teamLead.split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
