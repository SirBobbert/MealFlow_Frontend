import { useState } from 'react'

function LoginForm({ onSubmit, loading, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!onSubmit) return
    await onSubmit({ email, password })
  }

  return (
    <section className="card">
      <h2>Log in</h2>
      <p className="hint">
        Example (if backend seed is active):<br />
        <strong>email:</strong> test@email.com<br />
        <strong>password:</strong> 1234
      </p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">
          Email
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="form-label">
          Password
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button
          className="btn primary"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </section>
  )
}

export default LoginForm
