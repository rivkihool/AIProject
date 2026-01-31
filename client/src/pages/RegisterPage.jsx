import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import './auth.css'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()

  // validation: require name, email format, and password
  function validate() {
    if (!name) return 'Name is required'
    if (name.length < 2) return 'Name must be at least 2 characters'
    if (name.length > 100) return 'Name must be 100 characters or less'
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  // submit to /api/auth/register and call auth.login on success
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
      const resp = await axios.post('/auth/register', { name, email, password })
      const { token, user } = resp.data || {}
      if (!token || !user) {
        setError('Registration failed. Please try again.')
        return
      }
      // store auth state and navigate
      login(token, user)
      navigate('/tasks')
    } catch (err) {
      // Log error details for debugging (without sensitive data)
      console.error('[RegisterPage] Registration error:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        url: err.config?.url
      })

      if (err.response && err.response.data) {
        const { message, errors } = err.response.data
        if (errors && Array.isArray(errors) && errors.length > 0) {
          setError(errors.join(', '))
        } else if (message) {
          setError(message)
        } else {
          setError('Registration failed. Please try again.')
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please check your internet connection.')
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.')
      } else if (err.message) {
        setError('Connection error. Please try again.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <label>
            Name
            <input
              className="auth-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </label>

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
              placeholder="Choose a password"
              required
            />
          </label>

          <button className="auth-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  )
}
