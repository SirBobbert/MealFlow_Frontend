import Notification from '../components/layout/Notification.jsx'
import MealPlanForm from '../components/mealplans/MealPlanForm.jsx'
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fetchRecipeById } from '../api/recipesApi.js'
import { useNavigationHistory } from '../hooks/useNavigationHistory.js'

function MealPlanCreatePage({ auth, onLogout }) {
  const [notification, setNotification] = useState(null)
  const [createdId, setCreatedId] = useState(null)
  const [manualId, setManualId] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const [draftIdsFromStorage, setDraftIdsFromStorage] = useState(null)
  const [draftItemsFromState, setDraftItemsFromState] = useState(null)
  const { goBack } = useNavigationHistory()

  function handleCreated(created) {
    setCreatedId(created?.id || null)
    setNotification({ message: `Mealplan "${created.name || created.id}" created successfully.`, type: 'success' })
  }

  // If we arrived via "Add to mealplan" from RecipesPage (location.state.addRecipeId),
  // immediately add it to the form (MealPlanForm accepts initialRecipeId) and show a notification.
  useEffect(() => {
    // If we arrive with addRecipeId (single) or draftRecipeIds (array), show a small notification and
    // clear the location state so reloading doesn't re-trigger the behavior. Also load draft IDs from localStorage
    // when present so users can add recipes from the Recipes list without navigating.
  const addId = location.state?.addRecipeId
  const draftIds = location.state?.draftRecipeIds
  const draftItems = location.state?.draftRecipeItems
    // try localStorage when no state provided
    const raw = localStorage.getItem('mealplan_draft_ids')
    const saved = raw ? JSON.parse(raw) : []
    const savedUnique = Array.isArray(saved) && saved.length > 0 ? Array.from(new Set(saved.map((n) => Number(n)))) : null
    if (!addId && !(Array.isArray(draftIds) && draftIds.length > 0) && !savedUnique) return

    let cancelled = false

    async function notify() {
      try {
        if (addId) {
          const data = await fetchRecipeById(auth.token, addId)
          if (cancelled) return
          const title = data?.title || data?.name || `Recipe ${addId}`
          setNotification({ message: `Added "${title}" to the mealplan.`, type: 'success' })
        } else if (Array.isArray(draftItems) && draftItems.length > 0) {
          // draftItems contains objects with id, mealType, servings, dayOfWeek
          setNotification({ message: `Loaded ${draftItems.length} draft recipe(s) into the mealplan.`, type: 'success' })
          setDraftItemsFromState(draftItems)
        } else if (Array.isArray(draftIds) && draftIds.length > 0) {
          setNotification({ message: `Loaded ${draftIds.length} draft recipe(s) into the mealplan.`, type: 'success' })
          setDraftIdsFromStorage(draftIds)
        } else if (savedUnique) {
          setNotification({ message: `Loaded ${savedUnique.length} draft recipe(s) from storage.`, type: 'success' })
          setDraftIdsFromStorage(savedUnique)
        }
      } catch (err) {
        if (cancelled) return
        setNotification({ message: `Loaded recipe(s) into the mealplan.`, type: 'success' })
      } finally {
        // clear location state so reloading doesn't re-trigger the add behavior
          navigate(location.pathname, { replace: true, state: {} })
      }
    }

    notify()

    return () => {
      cancelled = true
    }
  }, [location.state, auth.token, navigate, location.pathname])

  return (
    <>
      <Notification message={notification?.message} type={notification?.type} onClose={() => setNotification(null)} />

      <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button type="button" onClick={() => goBack()} className="btn" style={{ border: '1px solid #4b5563' }}>
          ← Back
        </button>

        {/* Input to jump directly to generate shopping list */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="Mealplan ID"
            className="form-input"
            style={{ width: '160px' }}
          />

          <Link
            to={`/mealplans/${manualId || createdId}/shopping-list`}
            className="btn"
            style={{ border: '1px solid #4b5563' }}
            onClick={(e) => {
              // prevent navigation if no id provided
              const idToUse = manualId || createdId
              if (!idToUse) e.preventDefault()
            }}
          >
            Generate shopping list
          </Link>
        </div>
      </div>

      <MealPlanForm
        token={auth.token}
        onCreated={handleCreated}
        heading="View mealplan"
        submitLabel="Create mealplan"
        initialRecipeId={location.state?.addRecipeId}
        initialRecipeIds={draftIdsFromStorage || location.state?.draftRecipeIds}
        initialRecipeItems={draftItemsFromState || location.state?.draftRecipeItems}
      />
    </>
  )
}

export default MealPlanCreatePage
