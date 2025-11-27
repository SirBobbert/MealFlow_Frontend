import { useEffect, useState } from 'react'
import Header from '../components/layout/Header.jsx'
import RecipeList from '../components/recipes/RecipeList.jsx'
import RecipeForm from '../components/recipes/RecipeForm.jsx'
import Notification from '../components/layout/Notification.jsx'
import {
  fetchRecipes,
  createRecipe,
  deleteRecipe,
} from '../api/recipesApi.js'

function RecipesPage({ auth, onLogout }) {
  // Local state for all recipes
  const [recipes, setRecipes] = useState([])

  // Local state for loading list
  const [loading, setLoading] = useState(false)

  // Local state for list load error
  const [listError, setListError] = useState(null)

  // Local state for create error
  const [createError, setCreateError] = useState(null)

  // Local state for delete error
  const [deleteError, setDeleteError] = useState(null)

  // Local state for currently deleting recipe id
  const [deletingId, setDeletingId] = useState(null)

  // Local state for notifications
  const [notification, setNotification] = useState(null)

  // Combined error to show in list
  const combinedListError = listError || deleteError

  // Load all recipes when auth changes
  useEffect(() => {
    if (!auth || !auth.token) return

    async function load() {
      setLoading(true)
      setListError(null)
      setDeleteError(null)
      try {
        const data = await fetchRecipes(auth.token)
        setRecipes(data)
      } catch (err) {
        setListError(err.message || 'Failed to load recipes')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [auth])

  // Handle create recipe
  async function handleCreateRecipe(payload) {
    setCreateError(null)
    try {
      const created = await createRecipe(auth.token, payload)
      setRecipes((prev) => [...prev, created])
      setNotification({ message: `Recipe "${created.title}" created successfully!`, type: 'success' })
      
      // Signal to clear the form
      return { success: true }
    } catch (err) {
      setCreateError(err.message || 'Failed to create recipe')
      setNotification({ message: `Failed to create recipe: ${err.message}`, type: 'error' })
      return { success: false }
    }
  }



  // Handle delete recipe
  async function handleDeleteRecipe(id) {
    setDeleteError(null)
    setDeletingId(id)
    
    // Find recipe name before deleting for notification
    const recipe = recipes.find(r => r.id === id)
    const recipeName = recipe ? recipe.title : 'Recipe'
    
    try {
      await deleteRecipe(auth.token, id)
      setRecipes((prev) => prev.filter((r) => r.id !== id))
      setNotification({ message: `"${recipeName}" deleted successfully!`, type: 'success' })
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete recipe')
      setNotification({ message: `Failed to delete recipe: ${err.message}`, type: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="app-shell">
      <Header user={auth.user} onLogout={onLogout} />
      <Notification 
        message={notification?.message}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />
      <main className="app-main app-main-grid">
        <RecipeList
          recipes={recipes}
          loading={loading}
          error={combinedListError}
          onDelete={handleDeleteRecipe}
          deletingId={deletingId}
        />
        <RecipeForm
          token={auth.token}
          onCreate={handleCreateRecipe}
          loading={false}
          error={createError}
        />
      </main>
    </div>
  )
}

export default RecipesPage
