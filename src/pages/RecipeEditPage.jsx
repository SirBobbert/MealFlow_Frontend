// src/pages/RecipeEditPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import RecipeForm from '../components/recipes/RecipeForm.jsx'
import Notification from '../components/layout/Notification.jsx'
import { updateRecipe, fetchRecipeById } from '../api/recipesApi.js'

function RecipeEditPage({ auth, onLogout }) {
  const { recipeId } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    async function fetchRecipe() {
      if (!recipeId || !auth.token) return

      setLoading(true)
      setError(null)

      try {
        const data = await fetchRecipeById(auth.token, recipeId)
        setRecipe(data)
      } catch (err) {
        setError(err.message || 'Failed to load recipe')
        console.error('Error fetching recipe:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [recipeId, auth.token])

  async function handleUpdate(id, payload) {
    setUpdating(true)
    setUpdateError(null)

    console.log('Updating recipe with payload:', payload)
    
    try {
      const updatedRecipe = await updateRecipe(auth.token, id, payload)
      console.log('Recipe updated successfully:', updatedRecipe)
      // Show success notification
      setNotification({ message: `Recipe "${updatedRecipe.title || payload.title}" updated successfully!`, type: 'success' })
      // Navigate back after a brief delay to show notification
      setTimeout(() => {
        navigate(`/recipes/${id}`, { replace: true, state: { refreshed: Date.now() } })
      }, 1500)
    } catch (err) {
      setUpdateError(err.message || 'Failed to update recipe')
      setNotification({ message: `Failed to update recipe: ${err.message}`, type: 'error' })
      console.error('Error updating recipe:', err)
    } finally {
      setUpdating(false)
    }
  }

  function handleCancel() {
    navigate(`/recipes/${recipeId}`)
  }

  return (
    <div className="app-shell">
      <Header auth={auth} onLogout={onLogout} />
      <Notification 
        message={notification?.message}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />

      <main className="app-main">
        <div className="recipe-view-navigation">
          <Link to={`/recipes/${recipeId}`} className="btn">
            ← Back to Recipe
          </Link>
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
          <RecipeForm
            token={auth.token}
            editingRecipe={recipe}
            onUpdate={handleUpdate}
            onCancelEdit={handleCancel}
            loading={updating}
            error={updateError}
          />
        )}
      </main>
    </div>
  )
}

export default RecipeEditPage