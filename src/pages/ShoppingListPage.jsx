import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Notification from '../components/layout/Notification.jsx'
import { generateShoppingList } from '../api/mealplansApi.js'

function ShoppingListPage({ auth, onLogout }) {
  const { mealplanId } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [shoppingList, setShoppingList] = useState(null)

  useEffect(() => {
    if (!auth || !auth.token) return
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await generateShoppingList(auth.token, mealplanId)
        setShoppingList(data)
      } catch (err) {
        setError(err.message || 'Failed to generate shopping list')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [auth, mealplanId])

  return (
    <>
      <Notification message={error} type={error ? 'error' : undefined} onClose={() => setError(null)} />

      <section className="card">
        <h2>Shopping list for mealplan {mealplanId}</h2>
        <div style={{ marginBottom: '0.75rem' }}>
          <Link to="/recipes" className="btn" style={{ border: '1px solid #4b5563' }}>
            Back to recipes
          </Link>
        </div>

        {loading && <p className="muted">Generating shopping list...</p>}

        {!loading && shoppingList && Array.isArray(shoppingList.items) && (
          <ul className="shopping-list">
            {shoppingList.items.map((it) => (
              <li key={`${it.ingredientId}-${it.ingredientName}`} className="shopping-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <strong>{it.ingredientName}</strong>
                    <div className="muted">Category: {it.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>{it.amount} {it.unit}</div>
                    <div className="muted">Checked: {String(!!it.checked)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && shoppingList && (!shoppingList.items || shoppingList.items.length === 0) && (
          <p className="muted">No items in shopping list.</p>
        )}
      </section>
    </>
  )
}

export default ShoppingListPage
