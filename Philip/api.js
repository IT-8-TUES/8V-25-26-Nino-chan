const BASE_URL = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("jwt");
}

function getCurrentUserId() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { jwt: token } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(BASE_URL + path, { ...options, headers });
  return res.json();
}
