'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../../supabaseClient'
import { User, AuthState } from '@/types'

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
  clearSession: () => Promise<void>
} | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          // If it's a refresh token error, clear the session and continue
          if (error.message.includes('Refresh Token') || error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut()
            setState(prev => ({ 
              ...prev, 
              user: null, 
              loading: false,
              error: null
            }))
          } else {
            setState(prev => ({ ...prev, error: error.message, loading: false }))
          }
        } else {
          setState(prev => ({ 
            ...prev, 
            user: session?.user as User | null, 
            loading: false,
            error: null
          }))
        }
      } catch (error) {
        console.error('Unexpected session error:', error)
        setState(prev => ({ 
          ...prev, 
          user: null, 
          loading: false,
          error: null
        }))
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        
        // Handle different auth events
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setState(prev => ({ 
            ...prev, 
            user: session?.user as User | null,
            loading: false,
            error: null
          }))
        } else if (event === 'SIGNED_IN') {
          setState(prev => ({ 
            ...prev, 
            user: session?.user as User | null,
            loading: false,
            error: null
          }))
        } else {
          setState(prev => ({ 
            ...prev, 
            user: session?.user as User | null,
            loading: false
          }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    // Get the current origin (production or localhost)
    // In production, this will be your Vercel domain
    // In development, this will be localhost:3000
    const redirectTo = `${window.location.origin}/home`
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo
      }
    })

    if (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }))
      throw error
    }

    // If user is immediately confirmed (no email confirmation required)
    // or if they're already logged in, update the state
    if (data.user && data.session) {
      setState(prev => ({ 
        ...prev, 
        user: data.user as User, 
        loading: false 
      }))
    } else {
      // Email confirmation required - user will be logged in after clicking the link
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        // Even if sign out fails, clear the local state
        setState(prev => ({ 
          ...prev, 
          user: null, 
          loading: false, 
          error: null 
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          user: null, 
          loading: false, 
          error: null 
        }))
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error)
      // Clear state even if there's an error
      setState(prev => ({ 
        ...prev, 
        user: null, 
        loading: false, 
        error: null 
      }))
    }
  }

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  const clearSession = async () => {
    try {
      // Clear any stored session data
      await supabase.auth.signOut({ scope: 'local' })
      setState(prev => ({ 
        ...prev, 
        user: null, 
        loading: false, 
        error: null 
      }))
    } catch (error) {
      console.error('Error clearing session:', error)
      setState(prev => ({ 
        ...prev, 
        user: null, 
        loading: false, 
        error: null 
      }))
    }
  }

  return (
    <AuthContext.Provider value={{
      user: state.user,
      loading: state.loading,
      error: state.error,
      signIn,
      signUp,
      signOut,
      clearError,
      clearSession
    }}>
      {children}
    </AuthContext.Provider>
  )
}
