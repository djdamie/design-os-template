'use client'

import { useState } from 'react'
import { X, Sparkles, FileEdit } from 'lucide-react'
import type { CreateProjectModalProps, CreateProjectFormData } from './types'

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  onStartWithAI,
}: CreateProjectModalProps) {
  const [mode, setMode] = useState<'choose' | 'manual'>('choose')
  const [formData, setFormData] = useState<CreateProjectFormData>({
    caseId: '',
    title: '',
    client: '',
    agency: '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
    setFormData({ caseId: '', title: '', client: '', agency: '' })
    setMode('choose')
  }

  const handleClose = () => {
    setMode('choose')
    setFormData({ caseId: '', title: '', client: '', agency: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
            {mode === 'choose' ? 'Create New Project' : 'Quick Setup'}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'choose' ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 font-['DM_Sans']">
                How would you like to start your new project?
              </p>

              {/* AI Option */}
              <button
                onClick={() => {
                  onStartWithAI?.()
                  handleClose()
                }}
                className="group w-full flex items-start gap-4 rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-4 text-left transition-all hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-lg hover:shadow-sky-100/50 dark:hover:shadow-sky-900/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans'] group-hover:text-sky-700 dark:group-hover:text-sky-300">
                    Start with AI Brief
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 font-['DM_Sans']">
                    Paste your client brief and let AI extract all the details automatically
                  </p>
                </div>
              </button>

              {/* Manual Option */}
              <button
                onClick={() => setMode('manual')}
                className="group w-full flex items-start gap-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 text-left transition-all hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 shrink-0">
                  <FileEdit className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
                    Quick Setup
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 font-['DM_Sans']">
                    Create a project with basic details and fill in the rest later
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-['DM_Sans']">
                  Case ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BMW-Summer-Drive"
                  value={formData.caseId}
                  onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-['IBM_Plex_Mono']"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-['DM_Sans']">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BMW Summer Campaign 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-['DM_Sans']"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-['DM_Sans']">
                  Client <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BMW"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-['DM_Sans']"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-['DM_Sans']">
                  Agency <span className="text-zinc-400">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Jung von Matt"
                  value={formData.agency}
                  onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-['DM_Sans']"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('choose')}
                  className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-['DM_Sans']"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors font-['DM_Sans']"
                >
                  Create Project
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
