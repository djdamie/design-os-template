'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { ProjectDashboard, EmptyState } from '@/components/project-dashboard'
import type { Project, FilterOptions, ProjectStatus, ProjectType } from '@/components/project-dashboard'
import type { TFProjectWithBrief } from '@/lib/supabase/types'

// Transform Supabase data to dashboard Project format
function transformProject(data: TFProjectWithBrief): Project {
  // Supabase returns arrays for relationships, get first item
  const brief = Array.isArray(data.tf_briefs) ? data.tf_briefs[0] : data.tf_briefs
  return {
    id: data.id,
    caseId: data.catchy_case_id || data.case_number || data.id,
    caseNumber: parseInt(data.case_number?.replace('TF-', '') || '0', 36) || 0,
    title: data.project_title || brief?.project_title || `${brief?.client || 'Untitled'} Project`,
    client: brief?.client || 'Unknown Client',
    agency: brief?.agency || null,
    status: data.status as ProjectStatus,
    projectType: (data.project_type as ProjectType) || null,
    completeness: brief?.completion_rate || 0,
    budget: brief?.budget_min || null,
    deadline: brief?.submission_deadline || null,
    teamLead: null, // TODO: Add team assignments
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

// Generate filter options from projects
function generateFilterOptions(projects: Project[]): FilterOptions {
  const statuses = [...new Set(projects.map(p => p.status))] as ProjectStatus[]
  const projectTypes = [...new Set(projects.map(p => p.projectType).filter(Boolean))] as ProjectType[]
  const teamLeads = [...new Set(projects.map(p => p.teamLead).filter(Boolean))] as string[]
  
  return {
    statuses: statuses.length > 0 ? statuses : ['draft', 'active', 'completed'],
    projectTypes: projectTypes.length > 0 ? projectTypes : ['A', 'B', 'C', 'D', 'E'],
    teamLeads,
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }
        
        const data: TFProjectWithBrief[] = await response.json()
        const transformed = data.map(transformProject)
        setProjects(transformed)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filterOptions = useMemo(() => generateFilterOptions(projects), [projects])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4" />
          <p className="text-stone-400">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-950">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-stone-100 mb-2">Error Loading Projects</h2>
          <p className="text-stone-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProjectDashboard
      projects={projects}
      filterOptions={filterOptions}
      onProjectClick={(id) => router.push(`/projects/${id}`)}
      onCreateProject={() => router.push('/projects/new')}
      onCreateWithAI={() => router.push('/projects/new')}
    />
  )
}
