'use client'

import { Music, Plus, Sparkles } from 'lucide-react'

interface EmptyStateProps {
  onCreateProject?: () => void
  onCreateWithAI?: () => void
}

export function EmptyState({ onCreateProject, onCreateWithAI }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse">
          <div className="h-32 w-32 rounded-full bg-sky-100 dark:bg-sky-900/20 blur-2xl" />
        </div>
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-900/30 dark:to-sky-900/10 ring-1 ring-sky-200 dark:ring-sky-800">
          <Music className="h-12 w-12 text-sky-500" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-lime-400 text-lime-900 ring-4 ring-white dark:ring-zinc-950">
          <Plus className="h-4 w-4" strokeWidth={3} />
        </div>
      </div>

      {/* Text */}
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 font-['DM_Sans']">
        No projects yet
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400 max-w-sm mb-8 font-['DM_Sans']">
        Create your first project to start managing music licensing briefs with AI-powered extraction.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onCreateWithAI}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/30 transition-all font-['DM_Sans']"
        >
          <Sparkles className="h-4 w-4" />
          Start with AI Brief
        </button>
        <button
          onClick={onCreateProject}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-['DM_Sans']"
        >
          <Plus className="h-4 w-4" />
          Quick Setup
        </button>
      </div>
    </div>
  )
}
