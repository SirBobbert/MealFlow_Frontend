// src/pages/RecipeViewPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useNavigationHistory } from '../hooks/useNavigationHistory.js'
import Notification from '../components/layout/Notification.jsx'
import RecipeDetails from '../components/recipes/RecipeDetails.jsx'
import { fetchRecipeById } from '../api/recipesApi.js'

function RecipeViewPage({ auth, onLogout }) {
  const { recipeId } = useParams()
  const location = useLocation()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const { goBack } = useNavigationHistory()

  useEffect(() => {
    async function fetchRecipe() {
      if (!recipeId || !auth.token) return

      setLoading(true)
      setError(null)

      try {
        console.log('Fetching recipe data at:', new Date().toISOString())
        const data = await fetchRecipeById(auth.token, recipeId)
        console.log('Received recipe data:', data)
        setRecipe(data)
        
        // Show notification if coming from successful edit
        if (location.state?.refreshed) {
          setNotification({ message: 'Recipe loaded with latest changes', type: 'info' })
        }
      } catch (err) {
        setError(err.message || 'Failed to load recipe')
        console.error('Error fetching recipe:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [recipeId, auth.token, location.state])

  return (
    <>
      <Notification 
        message={notification?.message}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />

      <div className="recipe-view-navigation">
        <button type="button" onClick={() => goBack()} className="btn" style={{ border: '1px solid #4b5563' }}>
          ← Back
        </button>
        {recipe && (
          <Link 
            to={`/recipes/${recipeId}/edit`} 
            className="btn"
            style={{ border: '1px solid #4b5563' }}
          >
            Edit Recipe
          </Link>
        )}
      </div>

      {loading && (
        <section className="card">
          <p>Loading recipe...</p>
        </section>
      )}

      {error && (
        <section className="card">
          <p className="error">{error}</p>
        </section>
      )}

      {!loading && !error && recipe && (
        <RecipeDetails recipe={recipe} token={auth.token} />
      )}
    </>
  )
}

export default RecipeViewPage