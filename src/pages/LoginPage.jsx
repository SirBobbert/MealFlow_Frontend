import { useState } from 'react'
import LoginForm from '../components/auth/LoginForm.jsx'
import Header from '../components/layout/Header.jsx'
import { loginRequest } from '../api/authApi.js'

function LoginPage({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogin(credentials) {
    setLoading(true)
    setError(null)
    try {
      const authData = await loginRequest(
        credentials.email,
        credentials.password,
      )
      onLoginSuccess(authData)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Header user={null} onLogout={null} />
      <main className="app-main">
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      </main>
    </div>
  )
}

export default LoginPage
