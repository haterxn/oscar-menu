const API = '/api';

function getToken() {
  return localStorage.getItem('noroc_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  localStorage.setItem('noroc_token', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('noroc_token');
}

export function isAuthenticated() {
  return !!getToken();
}

// Categories
export async function getCategories() {
  const res = await fetch(`${API}/categories`);
  return res.json();
}

export async function createCategory(formData) {
  const res = await fetch(`${API}/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function updateCategory(id, formData) {
  const res = await fetch(`${API}/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`${API}/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Items
export async function getItems(categoryId) {
  const url = categoryId ? `${API}/items?category_id=${categoryId}` : `${API}/items`;
  const res = await fetch(url);
  return res.json();
}

export async function createItem(formData) {
  const res = await fetch(`${API}/items`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function updateItem(id, formData) {
  const res = await fetch(`${API}/items/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${API}/items/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Feedback
export async function sendFeedback(data) {
  const res = await fetch(`${API}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getFeedback() {
  const res = await fetch(`${API}/feedback`, { headers: authHeaders() });
  return res.json();
}

export async function markFeedbackRead(id) {
  const res = await fetch(`${API}/feedback/${id}/read`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  return res.json();
}

export async function deleteFeedback(id) {
  const res = await fetch(`${API}/feedback/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Bookings
export async function sendBooking(data) {
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getBookings() {
  const res = await fetch(`${API}/bookings`, { headers: authHeaders() });
  return res.json();
}

export async function updateBookingStatus(id, status) {
  const res = await fetch(`${API}/bookings/${id}/status`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteBooking(id) {
  const res = await fetch(`${API}/bookings/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// Stats
export async function getStats() {
  const res = await fetch(`${API}/stats`, { headers: authHeaders() });
  return res.json();
}
