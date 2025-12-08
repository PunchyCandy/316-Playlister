const BASE_URL = "http://localhost:4000/api";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || data?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

export async function fetchSongs() {
  const res = await fetch(`${BASE_URL}/songs`);
  return handleResponse(res);
}

export async function createSong({ ownerEmail, title, artist, year, youtubeId }) {
  const res = await fetch(`${BASE_URL}/songs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownerEmail, title, artist, year, youtubeId })
  });
  return handleResponse(res);
}

export async function updateSong({ id, title, artist, year, youtubeId, token }) {
  const res = await fetch(`${BASE_URL}/songs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ title, artist, year, youtubeId })
  });
  return handleResponse(res);
}

export async function deleteSong(id, token) {
  const res = await fetch(`${BASE_URL}/songs/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return handleResponse(res);
}
