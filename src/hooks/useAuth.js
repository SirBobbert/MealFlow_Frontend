import { useState, useCallback } from 'react'

const STORAGE_KEY = 'mealflowAuth'

function loadInitialAuth() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { user: null, token: null }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.user || !parsed.token) {
      return { user: null, token: null }
    }
    return parsed
  } catch {
    return { user: null, token: null }
  }
}

export function useAuth() {
  const [auth, setAuth] = useState(loadInitialAuth)

  const login = useCallback((authData) => {
    setAuth(authData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
  }, [])

  const logout = useCallback(() => {
    setAuth({ user: null, token: null })
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { auth, login, logout }
}
