import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Check, X } from 'lucide-react'
import { fetchRooms, createRoom as createRoomAPI, joinRoom as joinRoomAPI } from '../api'
import { useAuth } from '../contexts/AuthContext'
import CreateRoomModal from '../components/CreateRoomModal'
import JoinPrivateRoomModal from '../components/JoinPrivateRoomModal'

export default function RoomListPage() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [joiningRoomId, setJoiningRoomId] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
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

  async function handleCreateRoom(name, isPrivate, password, aiEnabled) {
    const room = await createRoomAPI(name, isPrivate, password, aiEnabled)
    await loadRooms()
    navigate(`/room/${room.roomId}`)
  }

  async function handleJoinRoom(room) {
    const isMyRoom = user && room.admin_id === user.id;

    // Admin can always join their own room without password
    if (room.is_private && !isMyRoom) {
      setSelectedRoom(room)
      setShowPasswordModal(true)
    } else {
      try {
        await joinRoomAPI(room.roomId)
        navigate(`/room/${room.roomId}`)
      } catch (e) {
        console.error(e)
        setError('Failed to join room.')
      }
    }
  }

  async function handleJoinPrivateRoom(password) {
    const roomId = selectedRoom.roomId;
    try {
      await joinRoomAPI(roomId, password)
      setShowPasswordModal(false)
      setSelectedRoom(null)
      navigate(`/room/${roomId}`)
    } catch (e) {
      console.error(e)
      // Let the modal handle the error display
      throw e
    }
  }

  function handleJoinInputSubmit(e) {
    e.preventDefault()
    if (joiningRoomId.trim()) {
      navigate(`/room/${joiningRoomId.trim()}`)
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
        <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
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
            <p>No rooms yet. Click "Create New Room" to start one.</p>
          </div>
        )}

        {rooms.map((room) => {
          const isMyRoom = room.admin_id === user?.id
          return (
            <div key={room.roomId} className="room-card">
              <div className="room-card-header">
                <h2>{room.name}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {isMyRoom && <span className="owner-badge">👤 Your Room</span>}
                  {room.is_private && <span className="privacy-badge">🔒 Private</span>}
                </div>
              </div>
              <p className="room-card-body">
                Room ID: {room.roomId}
                <br />
                Admin: {room.admin_username}
                <br />
                AI Autocomplete: {room.ai_autocomplete_enabled ? '✓ Enabled' : '✗ Disabled'}
              </p>
              <div className="room-card-footer">
                <button
                  className="primary-btn"
                  onClick={() => handleJoinRoom(room)}
                >
                  {isMyRoom ? 'Enter Room' : 'Join Room'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button className="ghost-btn" onClick={loadRooms}>
        Refresh list
      </button>

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
      />

      <JoinPrivateRoomModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setSelectedRoom(null)
        }}
        onJoin={handleJoinPrivateRoom}
        roomName={selectedRoom?.name}
      />
    </div>
  )
}

