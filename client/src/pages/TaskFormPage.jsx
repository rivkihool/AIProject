import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from '../api/axiosInstance'
import './auth.css'

// Maps for form dropdowns
const STATUS_OPTIONS = [
  { value: 0, label: 'Todo' },
  { value: 1, label: 'In Progress' },
  { value: 2, label: 'Done' },
]

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
]

export default function TaskFormPage() {
  const navigate = useNavigate()
  const { id } = useParams() // id exists for edit mode, undefined for create mode

  // Determine if we're in edit or create mode
  const isEditMode = !!id

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState(0) // Default: Todo
  const [priority, setPriority] = useState(1) // Default: Medium
  const [dueDate, setDueDate] = useState('')
  const [categoryId, setCategoryId] = useState('')

  // Categories for dropdown
  const [categories, setCategories] = useState([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data loading: load task (if edit) and categories
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setLoading(true)
      setError('')

      try {
        // Always load categories
        const categoriesPromise = axios.get('/categories')

        // Load task data if in edit mode
        const taskPromise = isEditMode ? axios.get(`/tasks/${id}`) : Promise.resolve(null)

        const [categoriesRes, taskRes] = await Promise.all([categoriesPromise, taskPromise])

        if (!isMounted) return

        // Set categories
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])

        // Populate form fields if editing
        if (taskRes && taskRes.data) {
          const task = taskRes.data
          setTitle(task.title || '')
          setDescription(task.description || '')
          setStatus(task.status !== undefined ? task.status : 0)
          setPriority(task.priority !== undefined ? task.priority : 1)
          // Convert ISO date to YYYY-MM-DD format for date input
          if (task.dueDate) {
            const date = new Date(task.dueDate)
            const formattedDate = date.toISOString().split('T')[0]
            setDueDate(formattedDate)
          }
          setCategoryId(task.categoryId || '')
        }
      } catch (err) {
        if (!isMounted) return
        setError(err?.response?.data?.message || err.message || 'Failed to load data')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [id, isEditMode])

  // Client-side validation
  function validate() {
    if (!title || title.trim() === '') return 'Title is required'
    if (status === '' || status === null || status === undefined) return 'Status is required'
    if (priority === '' || priority === null || priority === undefined) return 'Priority is required'
    return null
  }

  // Submit handler
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // Validate
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare request body
      const body = {
        title: title.trim(),
        description: description.trim(),
        status: parseInt(status, 10),
        priority: parseInt(priority, 10),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
      }

      // Send request based on mode
      if (isEditMode) {
        // Edit mode: PUT /api/tasks/{id}
        await axios.put(`/tasks/${id}`, body)
      } else {
        // Create mode: POST /api/tasks
        await axios.post('/tasks', body)
      }

      // Success: redirect to tasks page
      navigate('/tasks')
    } catch (err) {
      // Show error message
      setError(err?.response?.data?.message || err.message || 'Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cancel handler
  function handleCancel() {
    navigate('/tasks')
  }

  // Show loading indicator while loading data
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo"></div>
            <h2 className="auth-title">Loading...</h2>
          </div>
          <p className="auth-subtitle">Please wait while we load the form data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '680px' }}>
        <div className="auth-header">
          <div className="auth-logo"></div>
          <h2 className="auth-title">{isEditMode ? 'Edit Task' : 'Create New Task'}</h2>
        </div>
        <p className="auth-subtitle">
          {isEditMode ? 'Update the task details below.' : 'Fill in the details to create a new task.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Title */}
          <label htmlFor="title">
            Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="title"
            type="text"
            className="auth-input"
            placeholder="Enter task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            required
          />

          {/* Description */}
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="auth-input"
            placeholder="Enter task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={4}
            style={{ resize: 'vertical' }}
          />

          {/* Status */}
          <label htmlFor="status">
            Status <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            id="status"
            className="auth-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isSubmitting}
            required
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Priority */}
          <label htmlFor="priority">
            Priority <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            id="priority"
            className="auth-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting}
            required
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Due Date */}
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            className="auth-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
          />

          {/* Category */}
          <label htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            className="auth-input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">-- Select Category (Optional) --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Error message */}
          {error && <div className="auth-error">{error}</div>}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="submit"
              className="auth-btn"
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="auth-btn"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                flex: 1,
                background: 'linear-gradient(90deg, #6b7280, #9ca3af)',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
