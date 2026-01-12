import axios from 'axios';

// const BASE_URL = 'https://pairprogrammer.onrender.com';
const BASE_URL = 'https://pairprogrammer.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication endpoints
export async function register(email, username, password) {
  const res = await api.post('/auth/register', { email, username, password });
  return res.data;
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function googleAuth(token) {
  const res = await api.post('/auth/google', { token });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

// Room endpoints
export async function fetchRooms() {
  const res = await api.get('/rooms');
  return res.data;
}

export async function createRoom(name, isPrivate = false, password = null, aiAutocompleteEnabled = true) {
  const res = await api.post('/rooms', {
    name,
    is_private: isPrivate,
    password,
    ai_autocomplete_enabled: aiAutocompleteEnabled
  });
  return res.data;
}

export async function fetchRoom(roomId) {
  const res = await api.get(`/rooms/${roomId}`);
  return res.data;
}

export async function updateRoom(roomId, updates) {
  const res = await api.patch(`/rooms/${roomId}`, updates);
  return res.data;
}

export async function deleteRoom(roomId) {
  const res = await api.delete(`/rooms/${roomId}`);
  return res.data;
}

export async function joinRoom(roomId, password = null) {
  const res = await api.post(`/rooms/${roomId}/join`, { password });
  return res.data;
}

export async function leaveRoom(roomId) {
  const res = await api.post(`/rooms/${roomId}/leave`);
  return res.data;
}

export async function getRoomUsers(roomId) {
  const res = await api.get(`/rooms/${roomId}/users`);
  return res.data;
}

// Autocomplete and code execution
export async function autocomplete(code, cursorPosition, language = 'python', roomId) {
  const res = await api.post('/autocomplete', {
    code,
    cursorPosition,
    language,
    room_id: roomId
  });
  return res.data;
}

export async function runCode(language, code) {
  const res = await api.post('/run', {
    language,
    code
  });
  return res.data;
}

