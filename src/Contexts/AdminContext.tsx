import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'admin'
}

interface AdminContextType {
  admin: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isSuperAdmin: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions on component mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAdminProfile(session.user.email!)
      } else {
        setLoading(false)
      }
    })

    // Listen for real-time authentication state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchAdminProfile(session.user.email!)
      } else {
        setAdmin(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchAdminProfile = async (email: string) => {
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      console.log('Fetching admin profile for target email:', sanitizedEmail)

      // Using explicit precise lower matching filter to guarantee match across all platforms
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .filter('email', 'ilike', sanitizedEmail)

      console.log('Database returned profile payload:', { data, error })

      if (error) {
        console.error('Supabase profile query error:', error)
        setAdmin(null)
        return
      }

      if (data && data.length > 0) {
        const profile = data[0]
        setAdmin({ 
          id: profile.id, 
          email: profile.email, 
          role: profile.role 
        })
      } else {
        console.warn(`No entry found in admin_users for: ${sanitizedEmail}`)
        setAdmin(null)
      }
    } catch (err) {
      console.error('Unexpected runtime auth exception handling:', err)
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setAdmin(null)
  }

  const isSuperAdmin = admin?.role === 'super_admin'

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, isSuperAdmin }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdmin must be used within AdminProvider')
  return context
}