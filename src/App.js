import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import RoomListPage from './pages/RoomListPage'
import RoomEditorPage from './pages/RoomEditorPage'

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <Link to="/" className="app-logo">
          Pair Programming Studio
        </Link>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<RoomListPage />} />
          <Route path="/room/:roomId" element={<RoomEditorPage />} />
        </Routes>
      </main>
    </div>
  )
}
