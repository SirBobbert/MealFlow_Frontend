import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RecipeList from '../components/recipes/RecipeList.jsx'
import Notification from '../components/layout/Notification.jsx'
import {
  fetchRecipes,
  deleteRecipe,
} from '../api/recipesApi.js'

function RecipesPage({ auth, onLogout }) {
  // Local state for all recipes
  const [recipes, setRecipes] = useState([])

  // Local state for search query
  const [searchQuery, setSearchQuery] = useState('')

  // Local state for loading list
  const [loading, setLoading] = useState(false)

  // Local state for list load error
  const [listError, setListError] = useState(null)

  // Local state for delete error
  const [deleteError, setDeleteError] = useState(null)

  // Local state for currently deleting recipe id
  const [deletingId, setDeletingId] = useState(null)

  // Local state for notifications
  const [notification, setNotification] = useState(null)

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((r) => {
    const query = searchQuery.toLowerCase()
    return (
      (r.title && r.title.toLowerCase().includes(query)) ||
      (r.description && r.description.toLowerCase().includes(query))
    )
  })

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

  // Handle add to mealplan by storing the recipe id in a local draft (localStorage)
  // This avoids navigating away and lets the user view the draft mealplan later.
  function handleAddToMealplan(id) {
    if (!id) return
    try {
      const key = 'mealplan_draft_ids'
      const raw = localStorage.getItem(key)
      const arr = raw ? JSON.parse(raw) : []
      const numericId = Number(id)
      // check if already present (arr may contain numbers or objects)
      const exists = arr.some((p) => (typeof p === 'number' ? Number(p) === numericId : Number(p.id) === numericId))
      if (!exists) {
        // find recipe to get default servings
        const recipe = recipes.find((r) => Number(r.id) === numericId)
        const defaultServings = recipe?.servings || 1
        const obj = { id: numericId, mealType: 'DINNER', servings: defaultServings, dayOfWeek: null }
        arr.push(obj)
        localStorage.setItem(key, JSON.stringify(arr))
        setNotification({ message: `Added recipe ${id} to draft mealplan.`, type: 'success' })
      } else {
        setNotification({ message: `Recipe ${id} is already in the draft mealplan.`, type: 'info' })
      }
    } catch (err) {
      setNotification({ message: `Failed to add recipe to draft: ${err.message}`, type: 'error' })
    }
  }

  return (
    <>
      <Notification 
        message={notification?.message}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search recipes by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        />
        <Link to="/recipes/create" className="btn primary" style={{ border: '1px solid #4b5563' }}>
          Create recipe
        </Link>
      </div>
      <RecipeList
        recipes={filteredRecipes}
        loading={loading}
        error={combinedListError}
        onDelete={handleDeleteRecipe}
        onAddToMealplan={handleAddToMealplan}
        deletingId={deletingId}
        showCreatePrompt={searchQuery.length > 0 && filteredRecipes.length === 0}
      />
    </>
  )
}

export default RecipesPage
