import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { autocomplete, fetchRoom, runCode } from '../api';
import Editor from '@monaco-editor/react';

const WS_BASE_URL = 'ws://localhost:8000/ws';

export default function RoomEditorPage() {
  const { roomId } = useParams();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('Connecting...');
  const [ws, setWs] = useState(null);

  const [autoSuggestion, setAutoSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const [language, setLanguage] = useState('python'); // selected language for both autocomplete + run
  const [runOutput, setRunOutput] = useState('');
  const [running, setRunning] = useState(false);

  const typingTimeoutRef = useRef(null);
  const ignoreIncomingRef = useRef(false);
  const editorRef = useRef(null); // Monaco editor instance

  // Map dropdown language -> Monaco language id
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

  useEffect(() => {
    async function loadInitialCode() {
      try {
        const room = await fetchRoom(roomId);
        if (room && room.code) {
          setCode(room.code);
        }
      } catch (e) {
        console.error('Failed to load room:', e);
      }
    }
    loadInitialCode();
  }, [roomId]);

  useEffect(() => {
    const socket = new WebSocket(`${WS_BASE_URL}/${roomId}`);

    socket.onopen = () => {
      setStatus('Connected');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      ignoreIncomingRef.current = true;
      setCode(event.data);
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
  }, [roomId]);

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

    typingTimeoutRef.current = setTimeout(() => {
      triggerAutocomplete(newCode);
    }, 600);
  }

  function handleEditorDidMount(editor /*, monaco */) {
    editorRef.current = editor;
  }

  async function triggerAutocomplete(currentCode) {
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

      const result = await autocomplete(currentCode, cursorPos, language);
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

  return (
    <div className="room-page">
      <div className="room-header">
        <div>
          <p className="back-link">
            <Link to="/">← Back to rooms</Link>
          </p>
          <h1 className="room-title">Room {roomId}</h1>
          <p className="room-subtitle">
            Live collaborative coding. Open this URL in another browser to pair program.
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
          <div className={`status-pill status-${status.toLowerCase()}`}>
            {status}
          </div>
        </div>
      </div>

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
            {loadingSuggestion && (
              <span className="info-text">Getting AI suggestion…</span>
            )}
            {autoSuggestion && !loadingSuggestion && (
              <div className="suggestion-box">
                <span className="suggestion-label">AI suggestion:</span>
                <pre className="suggestion-text">{autoSuggestion}</pre>
                <button className="secondary-btn" onClick={applySuggestion}>
                  Apply
                </button>
              </div>
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
            <span className="hint-text">
             
            </span>
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
  );
}
