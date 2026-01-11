import React, { useState } from 'react';

export default function CreateRoomModal({ isOpen, onClose, onCreate }) {
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [aiEnabled, setAiEnabled] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Room name is required');
            return;
        }

        if (isPrivate && !password) {
            setError('Password is required for private rooms');
            return;
        }

        setLoading(true);

        try {
            await onCreate(name, isPrivate, password || null, aiEnabled);
            // Reset form
            setName('');
            setIsPrivate(false);
            setPassword('');
            setAiEnabled(true);
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create New Room</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="roomName" className="form-label">Room Name</label>
                        <input
                            id="roomName"
                            type="text"
                            className="text-input"
                            placeholder="My Coding Room"
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

                    {isPrivate && (
                        <div className="form-group">
                            <label htmlFor="roomPassword" className="form-label">Room Password</label>
                            <input
                                id="roomPassword"
                                type="password"
                                className="text-input"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    )}

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
                        <button type="button" className="secondary-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
