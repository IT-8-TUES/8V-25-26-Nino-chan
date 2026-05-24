const BASE_URL = "http://localhost:5000";
const PICS_BASE_URL = "http://localhost:5001";
const LOGIN_URL = "../Marti/html/login.html";

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

function redirectToLogin() {
  localStorage.removeItem("jwt");
  window.location.href = LOGIN_URL;
}

if (!getToken() || !getCurrentUserId()) {
  redirectToLogin();
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { jwt: token } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(BASE_URL + path, { ...options, headers });
  if (res.status === 401) {
    redirectToLogin();
    return null;
  }
  return res.json();
}

async function apiFetchBlob(url) {
  const token = getToken();
  const res = await fetch(url, {
    headers: token ? { jwt: token } : {},
  });
  if (res.status === 401) {
    redirectToLogin();
    return null;
  }
  if (!res.ok) return null;
  return res.blob();
}

async function apiUpload(path, formData, baseUrl = BASE_URL) {
  const token = getToken();
  const res = await fetch(baseUrl + path, {
    method: "POST",
    headers: token ? { jwt: token } : {},
    body: formData,
  });
  if (res.status === 401) {
    redirectToLogin();
    return null;
  }
  return res.json();
}
