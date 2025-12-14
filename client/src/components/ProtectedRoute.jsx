import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute
 * - uses useAuth() to check `isAuthenticated`
 * - if authenticated: renders child route(s) via <Outlet/> or children
 * - if not: redirects to /login (configurable via redirectTo prop)
 */
export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    // Not authenticated -> redirect to login
    return <Navigate to={redirectTo} replace />
  }

  // Authenticated -> render nested routes or provided children
  return children ? children : <Outlet />
}
