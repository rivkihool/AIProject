import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TaskFormPage from './pages/TaskFormPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import './pages/auth.css'

function TasksPage() {
  // simple protected placeholder tasks page
  const { user, logout } = useAuth()
  // Removed manual auth-redirect in favor of ProtectedRoute
  // if (!user) return <Navigate to="/login" replace />

  return (
    <div style={{ padding: 24 }}>
      <h1>Tasks</h1>
      <p>Welcome, {user.fullName || user.email}.</p>
      <p>This is a placeholder tasks page. Implement your task UI here.</p>
      <button onClick={() => { logout(); }} style={{ marginTop: 12 }}>Log out</button>
    </div>
  )
}

// Register page is provided in ./pages/RegisterPage.jsx

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Protected routes: any Route nested here will require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TaskFormPage />} />
        <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
      </Route>
      {/* Redirect default -> tasks (protected); fallback redirects to root */}
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
