import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Notification from '../components/layout/Notification.jsx'
import RecipeForm from '../components/recipes/RecipeForm.jsx'
import { createRecipe } from '../api/recipesApi.js'
import { useNavigationHistory } from '../hooks/useNavigationHistory.js'

function RecipeCreatePage({ auth, onLogout }) {
  const [createError, setCreateError] = useState(null)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()
  const { goBack } = useNavigationHistory()

  async function handleCreateRecipe(payload) {
    setCreateError(null)
    try {
      const created = await createRecipe(auth.token, payload)
      setNotification({ message: `Recipe "${created.title}" created successfully!`, type: 'success' })
      
      // Navigate back to recipes after a brief delay to show notification
      setTimeout(() => {
        navigate('/recipes')
      }, 1500)
      
      // Signal to clear the form
      return { success: true }
    } catch (err) {
      setCreateError(err.message || 'Failed to create recipe')
      setNotification({ message: `Failed to create recipe: ${err.message}`, type: 'error' })
      return { success: false }
    }
  }

  return (
    <>
      <Notification 
        message={notification?.message}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />

      <div style={{ marginBottom: '1rem' }}>
        <button type="button" onClick={() => goBack()} className="btn" style={{ border: '1px solid #4b5563' }}>
          ← Back
        </button>
      </div>

      <RecipeForm
        token={auth.token}
        onCreate={handleCreateRecipe}
        loading={false}
        error={createError}
      />
    </>
  )
}

export default RecipeCreatePage
