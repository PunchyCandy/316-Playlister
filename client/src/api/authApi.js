const AUTH_BASE_URL = "http://localhost:4000/api/auth";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || data?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

// POST /api/auth/register
export async function registerAccount({ username, email, password, avatar }) {
  const res = await fetch(`${AUTH_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, avatar })
  });
  return handleResponse(res); // { token, user }
}

// POST /api/auth/login
export async function loginAccount({ email, password }) {
  const res = await fetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res); // { token, user }
}

// GET /api/auth/me
export async function fetchCurrentUser(token) {
  const res = await fetch(`${AUTH_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return handleResponse(res); // { _id, username, avatar, email, playlists }
}

// PUT /api/auth/me
export async function updateAccount({ username, email, password, avatar, token }) {
  const res = await fetch(`${AUTH_BASE_URL}/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ username, email, password, avatar })
  });
  return handleResponse(res); // { token, user }
}
