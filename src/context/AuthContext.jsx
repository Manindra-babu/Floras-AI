import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isMockMode } from '../supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Initialize Auth State
  useEffect(() => {
    if (isMockMode) {
      // Mock Auth Initialization
      const savedUser = localStorage.getItem('tree_census_mock_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      setLoading(false)
    } else {
      // Live Supabase Auth Initialization
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  // 2. Sign In
  const signIn = async (email, password) => {
    setLoading(true)
    if (isMockMode) {
      // Mock Sign In
      await new Promise((resolve) => setTimeout(resolve, 800)) // delay
      
      // Let's get mock registered users
      const mockUsers = JSON.parse(localStorage.getItem('tree_census_mock_registered_users') || '[]')
      
      // Default mock users
      const defaultUsers = [
        { id: 'mock-user-admin', email: 'admin@treecensus.org', password: 'password123' },
        { id: 'mock-user-user1', email: 'naturelover@gmail.com', password: 'password123' }
      ]
      
      const allUsers = [...defaultUsers, ...mockUsers]
      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

      if (foundUser) {
        const loggedUser = { id: foundUser.id, email: foundUser.email, role: 'authenticated' }
        setUser(loggedUser)
        localStorage.setItem('tree_census_mock_user', JSON.stringify(loggedUser))
        setLoading(false)
        return { data: { user: loggedUser }, error: null }
      } else {
        setLoading(false)
        return { data: { user: null }, error: { message: 'Invalid mock credentials. Try admin@treecensus.org with password123.' } }
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { data, error: null }
    } catch (e) {
      setLoading(false)
      return { data: null, error: e }
    }
  }

  // 3. Sign Up
  const signUp = async (email, password) => {
    setLoading(true)
    if (isMockMode) {
      // Mock Sign Up
      await new Promise((resolve) => setTimeout(resolve, 800))

      const mockUsers = JSON.parse(localStorage.getItem('tree_census_mock_registered_users') || '[]')
      
      if (email === 'admin@treecensus.org' || email === 'naturelover@gmail.com' || mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setLoading(false)
        return { data: { user: null }, error: { message: 'User already exists.' } }
      }

      const newUser = {
        id: `mock-user-${Math.random().toString(36).substring(2, 9)}`,
        email,
        password
      }
      
      mockUsers.push(newUser)
      localStorage.setItem('tree_census_mock_registered_users', JSON.stringify(mockUsers))

      const loggedUser = { id: newUser.id, email: newUser.email, role: 'authenticated' }
      setUser(loggedUser)
      localStorage.setItem('tree_census_mock_user', JSON.stringify(loggedUser))
      setLoading(false)
      return { data: { user: loggedUser }, error: null }
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return { data, error: null }
    } catch (e) {
      setLoading(false)
      return { data: null, error: e }
    }
  }

  // 4. Sign Out
  const signOut = async () => {
    setLoading(true)
    if (isMockMode) {
      localStorage.removeItem('tree_census_mock_user')
      setUser(null)
      setLoading(false)
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      return { error: null }
    } catch (e) {
      setLoading(false)
      return { error: e }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isMockAuth: isMockMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
