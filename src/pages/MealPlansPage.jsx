import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Notification from '../components/layout/Notification.jsx'
import { fetchMealplans, deleteMealplan } from '../api/mealplansApi.js'

function MealPlansPage({ auth }) {
  const [mealplans, setMealplans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth || !auth.token) return
    load()
  }, [auth])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMealplans(auth.token)
      // API may return { mealplans: [...] } or array
      const list = Array.isArray(data) ? data : (Array.isArray(data.mealplans) ? data.mealplans : [])
      setMealplans(list)
    } catch (err) {
      setError(err.message || 'Failed to load mealplans')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteMealplan(auth.token, id)
      setMealplans((prev) => prev.filter((m) => m.id !== id))
      setNotification({ message: `Deleted mealplan ${id}`, type: 'success' })
    } catch (err) {
      setNotification({ message: `Failed to delete: ${err.message}`, type: 'error' })
    }
  }

  return (
    <>
      <Notification message={notification?.message} type={notification?.type} onClose={() => setNotification(null)} />

      <section className="card">
        <h2>View mealplans</h2>

        <div style={{ marginBottom: '0.75rem' }}>
          <button onClick={() => navigate(-1)} className="btn" style={{ border: '1px solid #4b5563' }}>
            ← Back
          </button>
          <Link to="/mealplans/draft" className="btn" style={{ border: '1px solid #4b5563', marginLeft: '0.5rem' }}>
            Draft mealplan
          </Link>
        </div>

        {loading && <p className="muted">Loading mealplans...</p>}

        {!loading && mealplans.length === 0 && <p className="muted">No mealplans yet.</p>}

        {!loading && mealplans.length > 0 && (
          <ul className="simple-list">
            {mealplans.map((m) => (
              <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{m.name || `Mealplan ${m.id}`}</strong>
                  <div className="muted">ID: {m.id}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/mealplans/${m.id}/view`} className="btn" style={{ border: '1px solid #4b5563' }}>
                    View
                  </Link>
                  <button className="btn" onClick={() => handleDelete(m.id)} style={{ border: '1px solid #4b5563' }}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default MealPlansPage
