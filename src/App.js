import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RoomListPage from './pages/RoomListPage'
import RoomEditorPage from './pages/RoomEditorPage'

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="app-root">
      <header className="app-header">
        <Link to="/" className="app-logo">
          Pair Programming Studio
        </Link>

        {isAuthenticated && (
          <div className="header-user">
            <span className="user-name">
              <User size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              {user?.username}
            </span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoomListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <RoomEditorPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

