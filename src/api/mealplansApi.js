import { API_BASE_URL } from './client'

// Build auth headers with JWT
function authHeaders(token) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Create a mealplan
export async function createMealplan(token, payload) {
  const res = await fetch(`${API_BASE_URL}/api/mealplan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let message = `Failed to create mealplan (${res.status})`
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

// Generate shopping list from a mealplan by id
export async function generateShoppingList(token, mealplanId) {
  const res = await fetch(
    `${API_BASE_URL}/api/mealplan/create_shopping_list/${mealplanId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
    }
  )

  if (!res.ok) {
    let message = `Failed to generate shopping list (${res.status})`
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
