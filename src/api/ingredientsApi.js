import { API_BASE_URL } from './client'

function authHeaders(token) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Load all ingredients from backend
export async function fetchIngredients(token) {
  const res = await fetch(`${API_BASE_URL}/api/ingredients`, {
    method: 'GET',
    headers: authHeaders(token),
  })

  if (!res.ok) {
    let message = `Failed to load ingredients (${res.status})`
    try {
      const body = await res.json()
      if (body && body.message) message = body.message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  return await res.json()
}

// Create new ingredient (name + category)
export async function createIngredient(token, payload) {
  const res = await fetch(`${API_BASE_URL}/api/ingredients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let message = `Failed to create ingredient (${res.status})`
    try {
      const body = await res.json()
      if (body && body.message) message = body.message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  return await res.json()
}
