import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useNavigationHistory } from '../hooks/useNavigationHistory.js'
import Notification from '../components/layout/Notification.jsx'
import { fetchMealplan, generateShoppingList } from '../api/mealplansApi.js'

function MealPlanViewPage({ auth }) {
  const { mealplanId } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mealplan, setMealplan] = useState(null)
  const [shoppingList, setShoppingList] = useState(null)
  const [loadingShoppingList, setLoadingShoppingList] = useState(false)
  const navigate = useNavigate()
  const { goBack } = useNavigationHistory()

  useEffect(() => {
    if (!auth || !auth.token) return
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchMealplan(auth.token, mealplanId)
        setMealplan(data)
        
        // Automatically fetch shopping list
        setLoadingShoppingList(true)
        try {
          const shoppingData = await generateShoppingList(auth.token, mealplanId)
          setShoppingList(shoppingData)
        } catch (err) {
          console.error('Failed to load shopping list:', err)
          setShoppingList(null)
        } finally {
          setLoadingShoppingList(false)
        }
      } catch (err) {
        setError(err.message || 'Failed to load mealplan')
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
        <h2>Mealplan {mealplan?.name || mealplanId}</h2>

        <div style={{ marginBottom: '0.75rem' }}>
          <button type="button" onClick={() => goBack()} className="btn" style={{ border: '1px solid #4b5563' }}>
            ← Back
          </button>
          <Link to="/mealplans" className="btn" style={{ border: '1px solid #4b5563', marginLeft: '0.5rem' }}>
            Back to mealplans
          </Link>
        </div>

        {loading && <p className="muted">Loading mealplan...</p>}

        {!loading && mealplan && (
          <div>
            <h3>Recipes</h3>
            <ol>
              {Array.isArray(mealplan.entries) && mealplan.entries.map((e) => (
                <li key={e.id || `${e.recipeId}-${Math.random()}`}>
                  {e.mealType}: {e.recipeTitle || `Recipe ${e.recipeId}`} (servings: {e.servingsOverride || '-'})
                </li>
              ))}
            </ol>
          </div>
        )}

        {!loading && mealplan && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid #374151', paddingTop: '1.5rem' }}>
            <h3>Shopping List</h3>
            {loadingShoppingList && <p className="muted">Loading shopping list...</p>}

            {!loadingShoppingList && shoppingList && Array.isArray(shoppingList.items) && (
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
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!loadingShoppingList && shoppingList && (!shoppingList.items || shoppingList.items.length === 0) && (
              <p className="muted">No items in shopping list.</p>
            )}

            {!loadingShoppingList && !shoppingList && (
              <p className="muted">Unable to load shopping list.</p>
            )}
          </div>
        )}
      </section>
    </>
  )
}

export default MealPlanViewPage
