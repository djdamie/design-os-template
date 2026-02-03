'use client'

import { useState } from 'react'
import { ChevronDown, TrendingUp, Info, X } from 'lucide-react'
import type {
  Project,
  ProjectType,
  MarginCalculation,
  CompletenessBreakdown,
  ClassificationReasoning,
} from './types'

interface CanvasHeaderProps {
  project: Project
  marginCalculation: MarginCalculation
  completenessBreakdown: CompletenessBreakdown
  classificationReasoning: ClassificationReasoning
  onShowMissingFields?: () => void
  onShowClassificationDetails?: () => void
  onTypeOverride?: (newType: ProjectType | null) => void
}

const typeColors: Record<ProjectType, string> = {
  A: 'bg-sky-500 text-white',
  B: 'bg-sky-400 text-white',
  C: 'bg-amber-500 text-white',
  D: 'bg-amber-400 text-zinc-900',
  E: 'bg-zinc-400 text-white',
  Production: 'bg-violet-500 text-white',
}

const typeLabels: Record<ProjectType, string> = {
  A: 'Type A — Premium',
  B: 'Type B — Standard',
  C: 'Type C — Mid-tier',
  D: 'Type D — Light',
  E: 'Type E — Blanket',
  Production: 'Production',
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getCompletenessGradient(score: number): string {
  if (score >= 90) return 'from-lime-500 to-lime-400'
  if (score >= 70) return 'from-amber-500 to-lime-500'
  if (score >= 50) return 'from-orange-500 to-amber-500'
  return 'from-red-500 to-orange-500'
}

export function CanvasHeader({
  project,
  marginCalculation,
  completenessBreakdown,
  classificationReasoning,
  onShowMissingFields,
  onShowClassificationDetails,
  onTypeOverride,
}: CanvasHeaderProps) {
  const [showClassificationPopover, setShowClassificationPopover] = useState(false)

  const effectiveType = project.projectTypeOverride || project.projectType

  const handleBadgeClick = () => {
    setShowClassificationPopover(!showClassificationPopover)
    onShowClassificationDetails?.()
  }

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3">
      {/* Top row: Project title and classification */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 font-['IBM_Plex_Mono']">
              {project.caseId}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-['DM_Sans']">
              Case #{project.caseNumber}
            </span>
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate font-['DM_Sans']">
            {project.caseTitle}
          </h1>
        </div>

        {/* Classification badge */}
        <div className="relative">
          <button
            onClick={handleBadgeClick}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm
              transition-all duration-150 hover:scale-105
              ${typeColors[effectiveType]}
              ${classificationReasoning.isOverridden ? 'ring-2 ring-offset-2 ring-violet-400 dark:ring-offset-zinc-900' : ''}
            `}
          >
            <span className="font-['DM_Sans']">Type {effectiveType}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {/* Classification popover */}
          {showClassificationPopover && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
                    Classification
                  </h3>
                  <button
                    onClick={() => setShowClassificationPopover(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-['DM_Sans']">
                  {classificationReasoning.reasoning}
                </p>
                {classificationReasoning.isOverridden && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400">
                    <Info className="h-3.5 w-3.5" />
                    <span className="font-['DM_Sans']">
                      Manually overridden from {classificationReasoning.calculatedType}
                    </span>
                  </div>
                )}
              </div>

              {/* Override section */}
              <div className="p-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-['DM_Sans']">
                  Override classification:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(['A', 'B', 'C', 'D', 'E', 'Production'] as ProjectType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        onTypeOverride?.(type === classificationReasoning.calculatedType ? null : type)
                        setShowClassificationPopover(false)
                      }}
                      className={`
                        px-2.5 py-1 rounded-md text-xs font-medium transition-all
                        ${
                          effectiveType === type
                            ? typeColors[type]
                            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                        }
                      `}
                    >
                      Type {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Margin info and completeness */}
      <div className="flex items-center gap-4">
        {/* Margin display */}
        <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <TrendingUp className="h-4 w-4 text-lime-500" />
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
              {formatCurrency(marginCalculation.budget, marginCalculation.budgetCurrency)}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">budget</span>
          </div>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-lime-600 dark:text-lime-400 font-['DM_Sans']">
              {marginCalculation.marginPercentage}%
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">margin</span>
          </div>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400 font-['DM_Sans']">
              {formatCurrency(marginCalculation.payoutAmount, marginCalculation.budgetCurrency)}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">payout</span>
          </div>
        </div>

        {/* Completeness bar */}
        <button
          onClick={onShowMissingFields}
          className="flex-1 group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
              Brief completeness
            </span>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-['DM_Sans']">
              {completenessBreakdown.score}%
            </span>
          </div>
          <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden group-hover:ring-2 ring-sky-300 dark:ring-sky-700 transition-all">
            <div
              className={`h-full bg-gradient-to-r ${getCompletenessGradient(completenessBreakdown.score)} transition-all duration-500`}
              style={{ width: `${completenessBreakdown.score}%` }}
            />
          </div>
          {completenessBreakdown.missingFields.length > 0 && (
            <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-['DM_Sans'] group-hover:text-sky-500 transition-colors">
              {completenessBreakdown.missingFields.length} fields missing • Click to view
            </p>
          )}
        </button>
      </div>
    </div>
  )
}
