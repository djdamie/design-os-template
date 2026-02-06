'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { TeamMemberOption } from '@/components/project-canvas/types'

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const { data, error } = await supabase
          .from('tf_users')
          .select('id, name, role, avatar_url')
          .order('name')

        if (error) throw error

        const members: TeamMemberOption[] = (data || []).map((user) => ({
          id: user.id,
          name: user.name,
          role: user.role,
          avatar: user.avatar_url,
        }))

        setTeamMembers(members)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching team members:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

  return { teamMembers, loading, error }
}
