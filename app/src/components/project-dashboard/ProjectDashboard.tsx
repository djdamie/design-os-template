'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  X,
} from 'lucide-react'
import type {
  ProjectDashboardProps,
  ProjectFilters,
  SortState,
  ViewMode,
  ProjectStatus,
  ProjectType,
  SortField,
} from './types'
import { ProjectCard } from './ProjectCard'
import { ProjectListRow } from './ProjectListRow'
import { EmptyState } from './EmptyState'
import { CreateProjectModal } from './CreateProjectModal'

const defaultFilters: ProjectFilters = {
  search: '',
  status: null,
  projectType: null,
  dateRange: { start: null, end: null },
}

const defaultSort: SortState = {
  field: 'updatedAt',
  direction: 'desc',
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'title', label: 'Name' },
  { value: 'completeness', label: 'Completeness' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'status', label: 'Status' },
]

const statusLabels: Record<ProjectStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function ProjectDashboard({
  projects,
  filterOptions,
  filters: controlledFilters,
  sort: controlledSort,
  viewMode: controlledViewMode,
  onFilterChange,
  onSortChange,
  onViewModeChange,
  onProjectClick,
  onCreateProject,
  onCreateWithAI,
}: ProjectDashboardProps) {
  // Internal state for uncontrolled mode
  const [internalFilters, setInternalFilters] = useState<ProjectFilters>(defaultFilters)
  const [internalSort, setInternalSort] = useState<SortState>(defaultSort)
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('grid')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Use controlled or internal state
  const filters = controlledFilters ?? internalFilters
  const sort = controlledSort ?? internalSort
  const viewMode = controlledViewMode ?? internalViewMode

  const handleFilterChange = (newFilters: ProjectFilters) => {
    if (onFilterChange) {
      onFilterChange(newFilters)
    } else {
      setInternalFilters(newFilters)
    }
  }

  const handleSortChange = (newSort: SortState) => {
    if (onSortChange) {
      onSortChange(newSort)
    } else {
      setInternalSort(newSort)
    }
  }

  const handleViewModeChange = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode)
    } else {
      setInternalViewMode(mode)
    }
  }

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.caseId.toLowerCase().includes(searchLower) ||
          p.title.toLowerCase().includes(searchLower) ||
          p.client.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status) {
      result = result.filter((p) => p.status === filters.status)
    }

    // Type filter
    if (filters.projectType) {
      result = result.filter((p) => p.projectType === filters.projectType)
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter((p) => {
        if (!p.deadline) return false
        const deadline = new Date(p.deadline)
        if (filters.dateRange.start && deadline < new Date(filters.dateRange.start)) return false
        if (filters.dateRange.end && deadline > new Date(filters.dateRange.end)) return false
        return true
      })
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sort.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'completeness':
          comparison = a.completeness - b.completeness
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'deadline':
          if (!a.deadline && !b.deadline) comparison = 0
          else if (!a.deadline) comparison = 1
          else if (!b.deadline) comparison = -1
          else comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }
      return sort.direction === 'asc' ? comparison : -comparison
    })

    return result
  }, [projects, filters, sort])

  const activeFilterCount = [
    filters.status,
    filters.projectType,
    filters.dateRange.start || filters.dateRange.end,
  ].filter(Boolean).length

  const clearFilters = () => {
    handleFilterChange(defaultFilters)
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-['DM_Sans']">
              Projects
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
              {projects.length} total projects
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/30 transition-all font-['DM_Sans']"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            onCreateProject={() => setIsModalOpen(true)}
            onCreateWithAI={onCreateWithAI}
          />
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by case ID, title, or client..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-['DM_Sans']"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors font-['DM_Sans'] ${
                    showFilters || activeFilterCount > 0
                      ? 'border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort.field}
                    onChange={(e) =>
                      handleSortChange({ ...sort, field: e.target.value as SortField })
                    }
                    className="appearance-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-3 pr-8 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-['DM_Sans']"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`rounded-md p-1.5 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`rounded-md p-1.5 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                    }`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={filters.status || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        status: e.target.value ? (e.target.value as ProjectStatus) : null,
                      })
                    }
                    className="appearance-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-3 pr-8 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:border-sky-500 focus:outline-none font-['DM_Sans']"
                  >
                    <option value="">All Statuses</option>
                    {filterOptions.statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <select
                    value={filters.projectType || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        projectType: e.target.value ? (e.target.value as ProjectType) : null,
                      })
                    }
                    className="appearance-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-3 pr-8 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:border-sky-500 focus:outline-none font-['DM_Sans']"
                  >
                    <option value="">All Types</option>
                    {filterOptions.projectTypes.map((type) => (
                      <option key={type} value={type}>
                        Type {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, start: e.target.value || null },
                      })
                    }
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:border-sky-500 focus:outline-none font-['DM_Sans']"
                    placeholder="Start date"
                  />
                  <span className="text-zinc-400">to</span>
                  <input
                    type="date"
                    value={filters.dateRange.end || ''}
                    onChange={(e) =>
                      handleFilterChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, end: e.target.value || null },
                      })
                    }
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 focus:border-sky-500 focus:outline-none font-['DM_Sans']"
                    placeholder="End date"
                  />
                </div>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-['DM_Sans']"
                  >
                    <X className="h-4 w-4" />
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* Results Count */}
            {filters.search || activeFilterCount > 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 font-['DM_Sans']">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            ) : null}

            {/* Projects Grid/List */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-500 dark:text-zinc-400 font-['DM_Sans']">
                  No projects match your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-sky-600 dark:text-sky-400 hover:underline font-['DM_Sans']"
                >
                  Clear filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => onProjectClick?.(project.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                {filteredProjects.map((project) => (
                  <ProjectListRow
                    key={project.id}
                    project={project}
                    onClick={() => onProjectClick?.(project.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          console.log('Create project:', data)
          onCreateProject?.()
          setIsModalOpen(false)
        }}
        onStartWithAI={() => {
          onCreateWithAI?.()
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
