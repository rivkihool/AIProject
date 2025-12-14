import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  // Initialize from localStorage if present
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      if (storedToken) setToken(storedToken)
      if (storedUser) setUser(JSON.parse(storedUser))
    } catch (e) {
      // ignore parse errors
    }
  }, [])

  function login(newToken, newUser) {
    // store token and user and update state
    try {
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    } catch (e) {
      // ignore storage errors
    }
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    } catch (e) {}
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
