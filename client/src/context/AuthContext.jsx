import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axiosInstance from '../api/axiosInstance'

// AuthContext provides authentication state and helpers across the app.
// It stores token and user in localStorage so auth survives page reloads.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // initialize from localStorage when the provider mounts
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('auth_token') || null
    } catch (e) {
      return null
    }
  })

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth_user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  const isAuthenticated = Boolean(token)

  // keep axios instance header in sync for immediate requests after login/logout
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common = axiosInstance.defaults.headers.common || {}
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      if (axiosInstance.defaults.headers && axiosInstance.defaults.headers.common) {
        delete axiosInstance.defaults.headers.common.Authorization
      }
    }
  }, [token])

  // login: store token & user, update state
  function login(newToken, newUser) {
    try {
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    } catch (e) {
      // ignore storage errors
    }
    setToken(newToken)
    setUser(newUser)
  }

  // logout: clear storage and reset state
  function logout() {
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    } catch (e) {
      // ignore
    }
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout }),
    [token, user, isAuthenticated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export default AuthContext
