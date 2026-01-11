import React, { useEffect, useState } from 'react';
import { getRoomUsers } from '../api';

export default function RoomUsersPanel({ roomId }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
        // Refresh users every 10 seconds
        const interval = setInterval(loadUsers, 10000);
        return () => clearInterval(interval);
    }, [roomId]);

    async function loadUsers() {
        try {
            const data = await getRoomUsers(roomId);
            setUsers(data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="users-panel">
            <h3 className="users-panel-title">Active Users</h3>

            {loading && <p className="info-text">Loading...</p>}
            {error && <p className="error-text">{error}</p>}

            <div className="users-list">
                {users.map((user) => (
                    <div key={user.id} className="user-item">
                        <div className="user-avatar">{user.username[0].toUpperCase()}</div>
                        <div className="user-info">
                            <div className="user-name">{user.username}</div>
                            <div className="user-joined">
                                Joined {new Date(user.joined_at).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
