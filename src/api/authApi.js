import { API_BASE_URL } from './client'

export async function loginRequest(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    let message = `Login failed (${res.status})`
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

  return {
    user: {
      id: data.id,
      name: data.name,
      email: data.email,
    },
    token: data.token,
  }
}
