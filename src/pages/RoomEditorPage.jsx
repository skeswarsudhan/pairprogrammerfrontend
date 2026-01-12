import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { autocomplete, fetchRoom, runCode, leaveRoom as leaveRoomAPI, joinRoom as joinRoomAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Editor from '@monaco-editor/react';
import RoomSettingsModal from '../components/RoomSettingsModal';
import RoomUsersPanel from '../components/RoomUsersPanel';
import JoinPrivateRoomModal from '../components/JoinPrivateRoomModal';

const WS_BASE_URL = 'wss://pairprogrammer.onrender.com/ws';

export default function RoomEditorPage() {
  const { roomId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('Connecting...');
  const [ws, setWs] = useState(null);
  const [room, setRoom] = useState(null);

  const [autoSuggestion, setAutoSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const [language, setLanguage] = useState('python');
  const [runOutput, setRunOutput] = useState('');
  const [running, setRunning] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showUsers, setShowUsers] = useState(true);

  const typingTimeoutRef = useRef(null);
  const ignoreIncomingRef = useRef(false);
  const editorRef = useRef(null);

  const monacoLanguage =
    language === 'python'
      ? 'python'
      : language === 'javascript'
        ? 'javascript'
        : language === 'c++'
          ? 'cpp'
          : language === 'c'
            ? 'c'
            : language === 'java'
              ? 'java'
              : 'plaintext';

  const [joinError, setJoinError] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [roomPassword, setRoomPassword] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      try {
        const roomData = await fetchRoom(roomId);
        setRoom(roomData);

        // Check if user is the admin
        const isRoomAdmin = roomData.admin_id === user?.id;

        // Try to join the room (admins and existing participants can join without password)
        try {
          await joinRoomAPI(roomId, null);
          // Successfully joined
          if (roomData && roomData.code) {
            setCode(roomData.code);
          }
        } catch (joinErr) {
          // Check if it's a private room requiring password (only for non-admins)
          if (joinErr.response?.status === 400 && roomData.is_private && !isRoomAdmin) {
            setNeedsPassword(true);
          } else if (joinErr.response?.status === 401) {
            // Incorrect password or other auth issue
            setJoinError('Failed to join room. Please check your credentials.');
          } else {
            // Already a participant or other success case, continue
            if (roomData && roomData.code) {
              setCode(roomData.code);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load room:', e);
        if (e.response?.status === 404) {
          setJoinError('Room not found');
          setTimeout(() => navigate('/'), 2000);
        } else {
          setJoinError('Failed to load room');
        }
      }
    }
    loadInitialData();
  }, [roomId, navigate, user]);

  // Connect WebSocket only after room is loaded and user can access it
  useEffect(() => {
    // Don't connect if room not loaded or needs password
    if (!room || needsPassword) {
      return;
    }

    const socket = new WebSocket(`${WS_BASE_URL}/${roomId}?token=${token}`);

    socket.onopen = () => {
      setStatus('Connected');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = event.data;

      // Try to parse as JSON (for user_joined/user_left events)
      try {
        const message = JSON.parse(data);
        // Handle user events - don't set as code
        if (message.type === 'user_joined') {
          console.log(`${message.username} joined the room`);
          return; // Don't set as code
        }
        if (message.type === 'user_left') {
          console.log(`${message.username} left the room`);
          return; // Don't set as code
        }
        // If it's some other JSON, ignore it
        if (message.type || message.error) {
          console.log('Received WebSocket event:', message);
          return;
        }
      } catch (e) {
        // Not JSON, treat as plain text code
      }

      // Plain text code update
      ignoreIncomingRef.current = true;
      setCode(data);
      ignoreIncomingRef.current = false;
    };

    socket.onclose = () => {
      setStatus('Disconnected');
      setWs(null);
    };

    socket.onerror = () => {
      setStatus('Error');
    };

    return () => {
      socket.close();
    };
  }, [roomId, token, room, needsPassword]);

  function handleEditorChange(value) {
    const newCode = value ?? '';
    setCode(newCode);
    setAutoSuggestion('');
    setRunOutput('');

    if (!ignoreIncomingRef.current && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(newCode);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only trigger autocomplete if enabled in room settings
    if (room?.ai_autocomplete_enabled) {
      typingTimeoutRef.current = setTimeout(() => {
        triggerAutocomplete(newCode);
      }, 600);
    }
  }

  function handleEditorDidMount(editor /*, monaco */) {
    editorRef.current = editor;
  }

  async function triggerAutocomplete(currentCode) {
    if (!room?.ai_autocomplete_enabled) return;

    try {
      setLoadingSuggestion(true);

      let cursorPos = currentCode.length;
      const editor = editorRef.current;
      if (editor) {
        const model = editor.getModel();
        const position = editor.getPosition();
        if (model && position) {
          const offset = model.getOffsetAt(position);
          cursorPos = offset;
        }
      }

      const result = await autocomplete(currentCode, cursorPos, language, roomId);
      setAutoSuggestion(result.suggestion || '');
    } catch (e) {
      console.error('Autocomplete error:', e);
    } finally {
      setLoadingSuggestion(false);
    }
  }

  function applySuggestion() {
    if (!autoSuggestion) return;
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    const position = editor.getPosition();

    if (!model || !position) return;

    const offset = model.getOffsetAt(position);
    const fullText = model.getValue();

    const before = fullText.slice(0, offset);
    const after = fullText.slice(offset);
    const newCode = before + autoSuggestion + after;

    ignoreIncomingRef.current = true;
    model.setValue(newCode);
    ignoreIncomingRef.current = false;

    const newOffset = before.length + autoSuggestion.length;
    const newPos = model.getPositionAt(newOffset);
    editor.setPosition(newPos);
    editor.focus();

    setCode(newCode);
    setAutoSuggestion('');

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(newCode);
    }
  }

  function handleLanguageChange(e) {
    const newLang = e.target.value;
    setLanguage(newLang);
    setAutoSuggestion('');
    setRunOutput('');
  }

  async function handleRunCode() {
    try {
      setRunning(true);
      setRunOutput('');
      const res = await runCode(language, code);
      const out = `${res.stdout || ''}${res.stderr || ''}`;
      setRunOutput(out || '(no output)');
    } catch (e) {
      console.error('Run error:', e);
      setRunOutput('Error running code');
    } finally {
      setRunning(false);
    }
  }

  async function handleLeaveRoom() {
    try {
      if (room?.admin_id === user?.id) {
        alert('You are the admin. Please delete the room instead of leaving.');
        return;
      }
      await leaveRoomAPI(roomId);
      navigate('/');
    } catch (e) {
      console.error('Leave room error:', e);
      alert('Failed to leave room');
    }
  }

  async function handleRoomUpdate() {
    // Reload room data
    try {
      const roomData = await fetchRoom(roomId);
      setRoom(roomData);
    } catch (e) {
      console.error('Failed to reload room:', e);
    }
  }

  function handleRoomDelete() {
    navigate('/');
  }

  async function handleJoinWithPassword(password) {
    try {
      await joinRoomAPI(roomId, password);
      setNeedsPassword(false);
      setJoinError('');
      // Reload room data
      const roomData = await fetchRoom(roomId);
      if (roomData && roomData.code) {
        setCode(roomData.code);
      }
    } catch (err) {
      setJoinError('Incorrect password');
      throw err; // Re-throw to show error in modal
    }
  }

  const isAdmin = room?.admin_id === user?.id;

  // Show error page if room not found or join failed
  if (joinError && !room) {
    return (
      <div className="room-page">
        <div className="room-header">
          <div>
            <p className="back-link">
              <Link to="/">← Back to rooms</Link>
            </p>
            <h1 className="room-title">Room Not Found</h1>
          </div>
        </div>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ padding: '24px', background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.6)', borderRadius: '12px', display: 'inline-block' }}>
            <p className="error-text" style={{ fontSize: '18px', margin: 0 }}>{joinError}</p>
            <p style={{ color: '#888', marginTop: '12px' }}>Redirecting to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-page">
      <div className="room-header">
        <div>
          <p className="back-link">
            <Link to="/">← Back to rooms</Link>
          </p>
          <h1 className="room-title">{room?.name || `Room ${roomId}`}</h1>
          <p className="room-subtitle">
            Room ID: {roomId}
          </p><p className='privacy-badge'>
            {room?.is_private ? 'Private' : 'Public'}
          </p>
        </div>
        <div className="room-header-right">
          <div className="language-select-wrapper">
            <label htmlFor="language-select" className="language-label">
              Language:
            </label>
            <select
              id="language-select"
              value={language}
              onChange={handleLanguageChange}
              className="language-select"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="c++">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
            </select>
          </div>
          {isAdmin && (
            <button className="secondary-btn" onClick={() => setShowSettings(true)}>
              Settings
            </button>
          )}
          <button className="secondary-btn" onClick={handleLeaveRoom}>
            Leave Room
          </button>
          <div className={`status-pill status-${status.toLowerCase()}`}>
            {status}
          </div>
        </div>
      </div>

      <div className="room-content">
        <div className="editor-section">
          <div className="editor-shell">
            <Editor
              height="420px"
              defaultLanguage={monacoLanguage}
              language={monacoLanguage}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
            <div className="editor-footer">
              <div className="editor-footer-left">
                {room?.ai_autocomplete_enabled && loadingSuggestion && (
                  <span className="info-text">Getting AI suggestion…</span>
                )}
                {room?.ai_autocomplete_enabled && autoSuggestion && !loadingSuggestion && (
                  <div className="suggestion-box">
                    <span className="suggestion-label">AI suggestion:</span>
                    <pre className="suggestion-text">{autoSuggestion}</pre>
                    <button className="secondary-btn" onClick={applySuggestion}>
                      Apply
                    </button>
                  </div>
                )}
                {!room?.ai_autocomplete_enabled && (
                  <span className="info-text">AI autocomplete is disabled for this room</span>
                )}
              </div>
              <div className="editor-footer-right">
                <button
                  className="primary-btn"
                  onClick={handleRunCode}
                  disabled={running}
                >
                  {running ? 'Running…' : 'Run Code'}
                </button>
              </div>
            </div>
          </div>

          {runOutput && (
            <div className="output-panel">
              <h3 className="output-title">Output</h3>
              <pre className="output-text">{runOutput}</pre>
            </div>
          )}
        </div>

        {showUsers && (
          <div className="sidebar">
            <RoomUsersPanel roomId={roomId} />
          </div>
        )}
      </div>

      {joinError && (
        <div style={{ padding: '16px', background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.6)', borderRadius: '8px', marginTop: '16px' }}>
          <p className="error-text">{joinError}</p>
        </div>
      )}

      {needsPassword && (
        <JoinPrivateRoomModal
          isOpen={needsPassword}
          onClose={() => {
            setNeedsPassword(false);
            navigate('/');
          }}
          onJoin={handleJoinWithPassword}
          roomName={room?.name}
        />
      )}

      {isAdmin && (
        <RoomSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          room={room}
          onUpdate={handleRoomUpdate}
          onDelete={handleRoomDelete}
        />
      )}
    </div>
  );
}
