import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import './auth.css'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()

  // validation: require full name, email format, and password
  function validate() {
    if (!fullName) return 'Full name is required'
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    if (!password) return 'Password is required'
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
      const resp = await axios.post('/api/auth/register', { fullName, email, password })
      const { token, user } = resp.data || {}
      if (!token || !user) {
        setError('Registration failed. Please try again.')
        return
      }
      // store auth state and navigate
      login(token, user)
      navigate('/tasks')
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
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
            Full name
            <input
              className="auth-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
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
