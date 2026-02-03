'use client'

import { EditableField } from './EditableField'
import type { FieldGroupProps, TeamMemberOption, ProjectType } from './types'

interface FieldGroupComponentProps extends FieldGroupProps {
  teamMembers?: TeamMemberOption[]
}

export function FieldGroup({
  group,
  projectType,
  teamMembers = [],
  onFieldUpdate,
}: FieldGroupComponentProps) {
  // Filter fields based on showFor (if specified)
  const visibleFields = group.fields.filter((field) => {
    if (!field.showFor) return true
    return field.showFor.includes(projectType)
  })

  if (visibleFields.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 font-['DM_Sans']">
        {group.label}
      </h3>
      <div className="space-y-2">
        {visibleFields.map((field) => (
          <EditableField
            key={field.id}
            field={field}
            teamMembers={teamMembers}
            onUpdate={(value) => onFieldUpdate?.(field.id, value)}
          />
        ))}
      </div>
    </div>
  )
}
