'use client'

import { Users } from 'lucide-react'
import type { TeamPanelProps } from './types'
import { roleColors } from './types'

export function TeamPanel({ assignments }: TeamPanelProps) {
  // Sort: primary first, then by role
  const sortedAssignments = [...assignments].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
    return a.role.localeCompare(b.role)
  })

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50">
        <Users className="w-4 h-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Team</span>
        <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
          {assignments.length} members
        </span>
      </div>

      {/* Team list */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {sortedAssignments.map((assignment) => {
          const roleStyle = roleColors[assignment.role] || roleColors.MGMT

          return (
            <div key={assignment.id} className="px-4 py-3 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  {assignment.userAvatar ? (
                    <img
                      src={assignment.userAvatar}
                      alt={assignment.userName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
                      {getInitials(assignment.userName)}
                    </div>
                  )}
                  {assignment.isPrimary && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-sky-500 border-2 border-white dark:border-zinc-900" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {assignment.userName}
                    </span>
                    {assignment.isPrimary && (
                      <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400">
                        Lead
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${roleStyle.bg} ${roleStyle.text}`}>
                      {assignment.role}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {assignment.roleLabel}
                    </span>
                  </div>
                </div>

                {/* Step count */}
                {assignment.stepsOwned.length > 0 && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {assignment.stepsOwned.length} steps
                  </span>
                )}
              </div>

              {/* Notes */}
              {assignment.notes && (
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 italic">
                  {assignment.notes}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
