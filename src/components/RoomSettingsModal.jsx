import React, { useState, useEffect } from 'react';
import { updateRoom, deleteRoom } from '../api';

export default function RoomSettingsModal({ isOpen, onClose, room, onUpdate, onDelete }) {
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [aiEnabled, setAiEnabled] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (room) {
            setName(room.name);
            setIsPrivate(room.is_private);
            setAiEnabled(room.ai_autocomplete_enabled);
            setPassword('');
        }
    }, [room]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const updates = {
                name,
                is_private: isPrivate,
                ai_autocomplete_enabled: aiEnabled
            };

            if (password) {
                updates.password = password;
            }

            await updateRoom(room.roomId, updates);
            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to update room');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        setError('');
        setLoading(true);

        try {
            await deleteRoom(room.roomId);
            onDelete();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to delete room');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !room) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Room Settings</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {!showDeleteConfirm ? (
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label htmlFor="roomName" className="form-label">Room Name</label>
                            <input
                                id="roomName"
                                type="text"
                                className="text-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                />
                                <span>Private Room</span>
                            </label>
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">
                                {isPrivate ? 'Change Password (leave blank to keep current)' : 'Set Password'}
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                className="text-input"
                                placeholder={isPrivate ? 'Enter new password' : 'Optional'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={aiEnabled}
                                    onChange={(e) => setAiEnabled(e.target.checked)}
                                />
                                <span>Enable AI Autocomplete</span>
                            </label>
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="danger-btn"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete Room
                            </button>
                            <div style={{ flex: 1 }} />
                            <button type="button" className="secondary-btn" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="primary-btn" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="modal-form">
                        <p className="modal-description">
                            Are you sure you want to delete this room? This action cannot be undone.
                        </p>

                        {error && <p className="error-text">{error}</p>}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="danger-btn"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete Room'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
