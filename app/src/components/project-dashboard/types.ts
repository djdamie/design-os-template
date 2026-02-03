// =============================================================================
// Data Types
// =============================================================================

export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'

export type ProjectType = 'A' | 'B' | 'C' | 'D' | 'E' | 'Production'

export interface Project {
  id: string
  caseId: string
  caseNumber: number
  title: string
  client: string
  agency: string | null
  status: ProjectStatus
  projectType: ProjectType | null
  completeness: number
  budget: number | null
  deadline: string | null
  teamLead: string | null
  createdAt: string
  updatedAt: string
}

export interface FilterOptions {
  statuses: ProjectStatus[]
  projectTypes: ProjectType[]
  teamLeads: string[]
}

// =============================================================================
// Filter State
// =============================================================================

export interface ProjectFilters {
  search: string
  status: ProjectStatus | null
  projectType: ProjectType | null
  dateRange: {
    start: string | null
    end: string | null
  }
}

export type SortField = 'updatedAt' | 'createdAt' | 'title' | 'completeness' | 'status' | 'deadline'

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: SortField
  direction: SortDirection
}

export type ViewMode = 'grid' | 'list'

// =============================================================================
// Component Props
// =============================================================================

export interface ProjectDashboardProps {
  /** The list of projects to display */
  projects: Project[]
  /** Available options for filter dropdowns */
  filterOptions: FilterOptions
  /** Current filter state */
  filters?: ProjectFilters
  /** Current sort state */
  sort?: SortState
  /** Current view mode (grid or list) */
  viewMode?: ViewMode
  /** Called when user changes filters */
  onFilterChange?: (filters: ProjectFilters) => void
  /** Called when user changes sort */
  onSortChange?: (sort: SortState) => void
  /** Called when user toggles view mode */
  onViewModeChange?: (mode: ViewMode) => void
  /** Called when user clicks on a project to open it */
  onProjectClick?: (id: string) => void
  /** Called when user wants to create a new project manually */
  onCreateProject?: () => void
  /** Called when user wants to create a project via AI brief extraction */
  onCreateWithAI?: () => void
}

// =============================================================================
// Create Project Modal
// =============================================================================

export interface CreateProjectFormData {
  caseId: string
  title: string
  client: string
  agency?: string
}

export interface CreateProjectModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Called when user closes the modal */
  onClose: () => void
  /** Called when user submits the quick setup form */
  onSubmit?: (data: CreateProjectFormData) => void
  /** Called when user chooses to start with AI brief extraction */
  onStartWithAI?: () => void
}
