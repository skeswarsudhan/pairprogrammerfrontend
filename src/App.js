import React from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { User } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RoomListPage from './pages/RoomListPage'
import RoomEditorPage from './pages/RoomEditorPage'

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide header on landing page
  const isLandingPage = location.pathname === '/';
  const showHeader = !isLandingPage || isAuthenticated;

  return (
    <div className="app-root">
      {showHeader && (
        <header className="app-header">
          <Link to={isAuthenticated ? "/rooms" : "/"} className="app-logo">
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
      )}

      <main className={isLandingPage && !isAuthenticated ? "" : "app-main"}>
        <Routes>
          {/* Landing page - show to unauthenticated users, redirect authenticated to rooms */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/rooms" /> : <LandingPage />}
          />

          <Route path="/login" element={isAuthenticated ? <Navigate to="/rooms" /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/rooms" /> : <RegisterPage />} />

          <Route
            path="/rooms"
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
          <Route path="*" element={<Navigate to={isAuthenticated ? "/rooms" : "/"} replace />} />
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
