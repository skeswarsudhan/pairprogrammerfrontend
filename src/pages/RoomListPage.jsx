import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRooms, createRoom } from '../api'

export default function RoomListPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [joiningRoomId, setJoiningRoomId] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadRooms()
  }, [])

  async function loadRooms() {
    try {
      setLoading(true)
      setError('')
      const data = await fetchRooms()
      setRooms(data)
    } catch (e) {
      console.error(e)
      setError('Could not load rooms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateRoom() {
    try {
      setError('')
      const room = await createRoom()
      navigate(`/room/${room.roomId}`)
    } catch (e) {
      console.error(e)
      setError('Failed to create room.')
    }
  }

  function handleJoin(roomId) {
    navigate(`/room/${roomId}`)
  }

  function handleJoinInputSubmit(e) {
    e.preventDefault()
    if (joiningRoomId.trim()) {
      handleJoin(joiningRoomId.trim())
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Active Rooms</h1>
          <p className="page-subtitle">
            Join an existing room or create a new space to pair-program in real time.
          </p>
        </div>
        <button className="primary-btn" onClick={handleCreateRoom}>
          + Create New Room
        </button>
      </div>

      <form className="join-form" onSubmit={handleJoinInputSubmit}>
        <input
          type="text"
          className="text-input"
          placeholder="Enter room ID to join directly"
          value={joiningRoomId}
          onChange={(e) => setJoiningRoomId(e.target.value)}
        />
        <button type="submit" className="secondary-btn">
          Join
        </button>
      </form>

      {loading && <p className="info-text">Loading rooms... This might take 50 to 60 seconds</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="rooms-grid">
        {rooms.length === 0 && !loading && (
          <div className="empty-card">
            <p>No rooms yet. Click “Create New Room” to start one.</p>
          </div>
        )}

        {rooms.map((room) => (
          <div key={room.roomId} className="room-card">
            <div className="room-card-header">
              <h2>{room.roomId}</h2>
            </div>
            <p className="room-card-body">
              Collaborative coding room. Click join to enter and start editing together.
            </p>
            <div className="room-card-footer">
              <button
                className="primary-btn"
                onClick={() => handleJoin(room.roomId)}
              >
                Join Room
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="ghost-btn" onClick={loadRooms}>
        Refresh list
      </button>
    </div>
  )
}
