import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import './auth.css'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()

  // validation logic: ensure required fields and simple email format
  function validate() {
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    if (!password) return 'Password is required'
    return null
  }

  // submit handler: validate -> POST -> auth.login -> navigate
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setIsSubmitting(true)
    try {
      const resp = await axios.post('/api/auth/login', { email, password })
      const { token, user } = resp.data || {}
      if (!token || !user) {
        setError('Login failed. Please try again.')
        return
      }
      // call auth context to store token/user
      login(token, user)
      // redirect to tasks
      navigate('/tasks')
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Styles moved to ./auth.css and applied via className

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </label>

          <button className="auth-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  )
}
