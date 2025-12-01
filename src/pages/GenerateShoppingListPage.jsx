import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Notification from '../components/layout/Notification.jsx'

function GenerateShoppingListPage({ auth, onLogout }) {
  const [id, setId] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function handleGo(e) {
    e.preventDefault()
    const val = String(id || '').trim()
    if (!val) return setError('Enter a mealplan id')
    setError(null)
    navigate(`/mealplans/${val}/shopping-list`)
  }

  return (
    <div className="app-shell">
      <Header user={auth.user} onLogout={onLogout} />
      <Notification message={error} type={error ? 'error' : undefined} onClose={() => setError(null)} />
      <main className="app-main">
        <section className="card">
          <h2>Generate shopping list</h2>

          <form onSubmit={handleGo} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              className="form-input"
              type="text"
              placeholder="Mealplan ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              style={{ width: '160px' }}
            />

            <button className="btn" type="submit" style={{ border: '1px solid #4b5563' }}>
              Generate
            </button>

            <Link to="/recipes" className="btn" style={{ border: '1px solid #4b5563' }}>
              Back to recipes
            </Link>
          </form>
        </section>
      </main>
    </div>
  )
}

export default GenerateShoppingListPage
