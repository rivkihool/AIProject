import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axiosInstance'
import ProtectedRoute from '../components/ProtectedRoute'

// Maps for display
const STATUS_MAP = {
  0: 'Todo',
  1: 'In Progress',
  2: 'Done',
}

const PRIORITY_MAP = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
}

function TasksPageContent() {
  const navigate = useNavigate()

  // Data + UI state
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Filters
  const [status, setStatus] = useState(null)
  const [priority, setPriority] = useState(null)
  const [categoryId, setCategoryId] = useState(null)
  const [search, setSearch] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Data fetching
  // - builds query params dynamically (only non-null / non-empty values)
  useEffect(() => {
    let isMounted = true

    async function fetchTasks() {
      setLoading(true)
      setError(null)

      try {
        const params = {}
        if (status !== null && status !== '') params.status = status
        if (priority !== null && priority !== '') params.priority = priority
        if (categoryId !== null && categoryId !== '') params.categoryId = categoryId
        if (search && search.trim() !== '') params.search = search.trim()
        if (page) params.page = page
        if (pageSize) params.pageSize = pageSize

        const res = await axios.get('/tasks', { params })

        if (!isMounted) return

        // Expect response: { items, totalCount, page, pageSize }
        const data = res.data || {}
        setTasks(Array.isArray(data.items) ? data.items : [])
        setTotalCount(typeof data.totalCount === 'number' ? data.totalCount : 0)
      } catch (err) {
        // Friendly error message
        setError(err?.response?.data?.message || err.message || 'Failed to load tasks')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchTasks()

    return () => {
      isMounted = false
    }
  }, [status, priority, categoryId, search, page, pageSize])

  // Delete logic
  // - asks for confirmation, calls DELETE /api/tasks/{id}, reloads list on success
  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this task?')
    if (!ok) return

    try {
      setLoading(true)
      setError(null)
      await axios.delete(`/tasks/${id}`)
      // reload (keep current filters / page)
      // simple approach: refetch by bumping page state to trigger useEffect
      // but to keep page same we call fetch again by toggling page state briefly
      // easiest: call the same endpoint directly to refresh tasks
      const params = {}
      if (status !== null && status !== '') params.status = status
      if (priority !== null && priority !== '') params.priority = priority
      if (categoryId !== null && categoryId !== '') params.categoryId = categoryId
      if (search && search.trim() !== '') params.search = search.trim()
      if (page) params.page = page
      if (pageSize) params.pageSize = pageSize
      const res = await axios.get('/tasks', { params })
      const data = res.data || {}
      setTasks(Array.isArray(data.items) ? data.items : [])
      setTotalCount(typeof data.totalCount === 'number' ? data.totalCount : 0)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize))

  return (
    <div style={{ padding: 16 }}>
      <h1>My Tasks</h1>

      {/* Filters section */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <label>
          Status:
          <select
            value={status ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setStatus(v === '' ? null : Number(v))
              setPage(1)
            }}
            style={{ marginLeft: 6 }}
          >
            <option value="">All</option>
            <option value={0}>Todo</option>
            <option value={1}>In Progress</option>
            <option value={2}>Done</option>
          </select>
        </label>

        <label>
          Priority:
          <select
            value={priority ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setPriority(v === '' ? null : Number(v))
              setPage(1)
            }}
            style={{ marginLeft: 6 }}
          >
            <option value="">All</option>
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
        </label>

        <label>
          Category ID:
          <input
            type="number"
            value={categoryId ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setCategoryId(v === '' ? null : Number(v))
              setPage(1)
            }}
            placeholder="e.g. 2"
            style={{ marginLeft: 6, width: 100 }}
          />
        </label>

        <label style={{ flex: 1 }}>
          Search:
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search title or description"
            style={{ marginLeft: 6, width: '60%' }}
          />
        </label>

        <button onClick={() => navigate('/tasks/new')}>Add Task</button>
      </div>

      {/* Status messages */}
      {loading && <div>Loading tasks...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {/* Tasks list */}
      {!loading && !error && tasks.length === 0 && (
        <div>No tasks found. Try changing filters or add a new task.</div>
      )}

      {!loading && tasks.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Title</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Priority</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Due Date</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{t.title}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{STATUS_MAP[t.status]}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{PRIORITY_MAP[t.priority]}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                    <button onClick={() => navigate(`/tasks/${t.id}/edit`)} style={{ marginRight: 8 }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages} — {totalCount} items
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
        >
          Next
        </button>

        <label style={{ marginLeft: 12 }}>
          Page size:
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            style={{ marginLeft: 6 }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
    </div>
  )
}

// Wrap TasksPageContent in ProtectedRoute so the page is only accessible when authenticated
export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksPageContent />
    </ProtectedRoute>
  )
}
