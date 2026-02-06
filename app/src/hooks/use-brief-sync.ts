'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { TFBrief } from '@/lib/supabase/types'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export interface BriefSyncState {
  /** Whether the realtime subscription is active */
  isConnected: boolean
  /** Last time a remote update was received */
  lastRemoteUpdate: Date | null
  /** Source of last update (ui, chat, n8n, api) */
  lastUpdateSource: string | null
  /** Error message if subscription failed */
  error: string | null
}

export interface UseBriefSyncOptions {
  /** Case ID to subscribe to */
  caseId: string
  /** Callback when brief is updated remotely (e.g., from Slack) */
  onBriefUpdate?: (brief: TFBrief, source: string) => void
  /** Whether to enable realtime sync (can be toggled) */
  enabled?: boolean
}

/**
 * Hook for subscribing to realtime brief updates via Supabase.
 * Used to sync changes made via Slack (or other sources) back to the UI.
 *
 * Architecture: Last write wins - when a remote update comes in,
 * we simply update the local state with the new values.
 */
export function useBriefSync({
  caseId,
  onBriefUpdate,
  enabled = true,
}: UseBriefSyncOptions): BriefSyncState {
  const [state, setState] = useState<BriefSyncState>({
    isConnected: false,
    lastRemoteUpdate: null,
    lastUpdateSource: null,
    error: null,
  })

  const channelRef = useRef<RealtimeChannel | null>(null)
  const onBriefUpdateRef = useRef(onBriefUpdate)

  // Keep callback ref updated to avoid stale closures
  useEffect(() => {
    onBriefUpdateRef.current = onBriefUpdate
  }, [onBriefUpdate])

  const handleBriefChange = useCallback(
    (payload: RealtimePostgresChangesPayload<TFBrief>) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        const newBrief = payload.new as TFBrief

        // Determine source from activity log or default to 'unknown'
        // The source might be passed in metadata or we can infer from context
        const source = 'external' // Could be enhanced to track actual source

        setState(prev => ({
          ...prev,
          lastRemoteUpdate: new Date(),
          lastUpdateSource: source,
        }))

        // Notify parent component of the update
        if (onBriefUpdateRef.current) {
          onBriefUpdateRef.current(newBrief, source)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (!enabled || !caseId) {
      // Clean up existing subscription if disabled
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        setState(prev => ({ ...prev, isConnected: false }))
      }
      return
    }

    // Create realtime subscription for brief changes
    const channel = supabase
      .channel(`brief-changes-${caseId}`)
      .on<TFBrief>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tf_briefs',
          filter: `case_id=eq.${caseId}`,
        },
        handleBriefChange
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setState(prev => ({ ...prev, isConnected: true, error: null }))
        } else if (status === 'CHANNEL_ERROR') {
          setState(prev => ({
            ...prev,
            isConnected: false,
            error: 'Failed to connect to realtime updates',
          }))
        } else if (status === 'CLOSED') {
          setState(prev => ({ ...prev, isConnected: false }))
        }
      })

    channelRef.current = channel

    // Cleanup on unmount or when dependencies change
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [caseId, enabled, handleBriefChange])

  return state
}

/**
 * Hook to track activity log changes for a case.
 * Useful for showing a feed of updates (who changed what, when).
 */
export function useCaseActivity(caseId: string, enabled = true) {
  const [activities, setActivities] = useState<Array<{
    id: string
    type: string
    description: string | null
    source: string
    createdAt: Date
  }>>([])

  useEffect(() => {
    if (!enabled || !caseId) return

    const channel = supabase
      .channel(`case-activity-${caseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tf_case_activity',
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          if (payload.new) {
            const activity = payload.new as {
              id: string
              activity_type: string
              activity_description: string | null
              source: string
              created_at: string
            }
            setActivities(prev => [
              {
                id: activity.id,
                type: activity.activity_type,
                description: activity.activity_description,
                source: activity.source,
                createdAt: new Date(activity.created_at),
              },
              ...prev.slice(0, 49), // Keep last 50 activities
            ])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseId, enabled])

  return activities
}
