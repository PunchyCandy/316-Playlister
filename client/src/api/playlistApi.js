const BASE_URL = "http://localhost:4000/api";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || data?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

export async function fetchPlaylists() {
  const res = await fetch(`${BASE_URL}/playlists`);
  const data = await handleResponse(res); // [{ _id, name, songs, listeners, ... }]
  return Array.isArray(data)
    ? data.map((p) => ({ ...p, id: p._id || p.id }))
    : [];
}

export async function createPlaylist({ name, ownerEmail, songs = [], listeners = [] }) {
  const res = await fetch(`${BASE_URL}/playlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, ownerEmail, songs, listeners })
  });
  return handleResponse(res);
}

export async function updatePlaylist({ id, name, songs, listeners }) {
  const res = await fetch(`${BASE_URL}/playlists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, songs, listeners })
  });
  return handleResponse(res);
}

export async function deletePlaylist(id) {
  const res = await fetch(`${BASE_URL}/playlists/${id}`, {
    method: "DELETE"
  });
  return handleResponse(res);
}
