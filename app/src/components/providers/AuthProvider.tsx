'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface TFUser {
  id: string
  email: string
  name: string
  role: string
  avatar_url: string | null
}

interface AuthContextType {
  user: User | null
  tfUser: TFUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tfUser, setTFUser] = useState<TFUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTFUser = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('tf_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching TF user profile:', error)
      return null
    }
    return data as TFUser
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const profile = await fetchTFUser(session.user.id)
        setTFUser(profile)
      }

      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const profile = await fetchTFUser(session.user.id)
          setTFUser(profile)
        } else {
          setTFUser(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchTFUser])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signUp = async (email: string, password: string, name: string, role = 'Music Supervisor') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    })
    return { error: error as Error | null }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error: error as Error | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setTFUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      tfUser,
      session,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
