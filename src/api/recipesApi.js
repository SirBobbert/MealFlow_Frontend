import { API_BASE_URL } from './client'

// Build auth headers with JWT
function authHeaders(token) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Get all recipes
export async function fetchRecipes(token) {
  const res = await fetch(`${API_BASE_URL}/api/recipes`, {
    method: 'GET',
    headers: authHeaders(token),
  })

  if (!res.ok) {
    let message = `Failed to load recipes (${res.status})`
    try {
      const body = await res.json()
      if (body && body.message) {
        message = body.message
      }
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const data = await res.json()

  if (Array.isArray(data)) return data
  if (Array.isArray(data.recipes)) return data.recipes
  return []
}

// Get single recipe by id
export async function fetchRecipeById(token, id) {
  const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
    method: 'GET',
    headers: authHeaders(token),
  })

  if (!res.ok) {
    let message = `Failed to load recipe (${res.status})`
    try {
      const body = await res.json()
      if (body && body.message) {
        message = body.message
      }
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const data = await res.json()

  return data
}

// Create recipe
export async function createRecipe(token, payload) {
  const res = await fetch(`${API_BASE_URL}/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let message = `Failed to create recipe (${res.status})`
    try {
      const body = await res.json()
      if (body && body.message) {
        message = body.message
      }
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const data = await res.json()

  if (data && data.recipe) return data.recipe
  return data
}

// Update existing recipe by id (PATCH)
export async function updateRecipe(token, id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let message = `Failed to update recipe (${res.status})`
    try {
      const body = await res.json()
      if (body && body.message) {
        message = body.message
      }
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  const data = await res.json()

  if (data && data.recipe) return data.recipe
  return data
}

// Delete recipe by id
export async function deleteRecipe(token, id) {
  const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })

  if (!res.ok) {
    let message = `Failed to delete recipe (${res.status})`
    try {
      const body = await res.json()
      if (body && body.message) {
        message = body.message
      }
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  return true
}
