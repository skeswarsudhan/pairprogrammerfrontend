import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export async function fetchRooms() {
  const res = await axios.get(`${BASE_URL}/rooms`);
  return res.data;
}

export async function createRoom() {
  const res = await axios.post(`${BASE_URL}/rooms`);
  return res.data;
}

export async function fetchRoom(roomId) {
  const res = await axios.get(`${BASE_URL}/rooms/${roomId}`);
  return res.data;
}

export async function autocomplete(code, cursorPosition, language = 'python') {
  const res = await axios.post(`${BASE_URL}/autocomplete`, {
    code,
    cursorPosition,
    language
  });
  return res.data;
}

export async function runCode(language, code) {
  const res = await axios.post(`${BASE_URL}/run`, {
    language,
    code
  });
  return res.data;
}
