import { useEffect, useState } from 'react'
import { fetchRecipes } from '../../api/recipesApi.js'
import { createMealplan } from '../../api/mealplansApi.js'

function MealPlanForm({ token, onCreated, initialRecipeId = null, initialRecipeIds = null, initialRecipeItems = null, heading = 'Create mealplan', submitLabel = 'Create mealplan' }) {
  const [name, setName] = useState('')
  const [recipes, setRecipes] = useState([])
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [listError, setListError] = useState(null)
  const [entries, setEntries] = useState([]) // { recipeId, servingsOverride, mealType }
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return
    async function load() {
      setLoadingRecipes(true)
      setListError(null)
      try {
        const data = await fetchRecipes(token)
        setRecipes(data)
      } catch (err) {
        setListError(err.message || 'Failed to load recipes')
      } finally {
        setLoadingRecipes(false)
      }
    }

    load()
  }, [token])

  // If an initial recipe id is provided (from navigation state), prefill entries
  useEffect(() => {
    // handle a single id (backwards compat)
    if (initialRecipeId) {
      setEntries((prev) => {
        if (prev.some((e) => Number(e.recipeId) === Number(initialRecipeId))) return prev
        return [...prev, { recipeId: Number(initialRecipeId), servingsOverride: 1, mealType: 'DINNER' }]
      })
    }

    // handle multiple initial ids (draft -> create flow)
    if (Array.isArray(initialRecipeIds) && initialRecipeIds.length > 0) {
      setEntries((prev) => {
        const existing = new Set(prev.map((e) => Number(e.recipeId)))
        const newOnes = initialRecipeIds
          .map((id) => Number(id))
          .filter((n) => !existing.has(n))
          .map((n) => ({ recipeId: n, servingsOverride: 1, mealType: 'DINNER' }))
        return [...prev, ...newOnes]
      })
    }

    // handle initialRecipeItems (array of { id, mealType, servings, dayOfWeek })
    if (Array.isArray(initialRecipeItems) && initialRecipeItems.length > 0) {
      setEntries((prev) => {
        const existing = new Set(prev.map((e) => Number(e.recipeId)))
        const newOnes = initialRecipeItems
          .map((it) => ({ recipeId: Number(it.id), servingsOverride: Number(it.servings) || 1, mealType: it.mealType || 'DINNER', dayOfWeek: it.dayOfWeek || null }))
          .filter((n) => !existing.has(n.recipeId))
        return [...prev, ...newOnes]
      })
    }
  // we intentionally only want to run this when the incoming ids change
  }, [initialRecipeId, JSON.stringify(initialRecipeIds)])

  function addRecipe(recipeId) {
    setEntries((prev) => [
      ...prev,
      { recipeId, servingsOverride: 1, mealType: 'DINNER' },
    ])
  }

  function updateEntry(index, patch) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)))
  }

  function removeEntry(index) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError('Please provide a name for the mealplan')
    if (!entries || entries.length === 0) return setError('Please add at least one recipe to the mealplan')

    const payload = {
      name,
      listOfEntries: entries.map((e) => ({
        recipeId: Number(e.recipeId),
        servingsOverride: Number(e.servingsOverride) || 1,
        mealType: e.mealType || 'DINNER',
        dayOfWeek: e.dayOfWeek || null,
      })),
    }

    setSubmitting(true)
    try {
      const created = await createMealplan(token, payload)
      setName('')
      setEntries([])
      if (onCreated) onCreated(created)
    } catch (err) {
      setError(err.message || 'Failed to create mealplan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="card">
      <h2>{heading}</h2>
      {error && <p className="error">{error}</p>}
      {listError && <p className="error">{listError}</p>}

      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">
          Name
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Week 1, Weekend meals..."
            required
          />
        </label>

        <div style={{ marginBottom: '0.5rem' }}>
          <h3>Available recipes</h3>
          {loadingRecipes && <p className="muted">Loading recipes...</p>}
          {!loadingRecipes && recipes.length === 0 && (
            <p className="muted">No recipes found. Create some first.</p>
          )}
          <ul className="simple-list">
            {recipes.map((r) => (
              <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{r.title || r.name}</strong>
                  <div className="muted">ID: {r.id}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button type="button" className="btn" onClick={() => addRecipe(r.id)} style={{ border: '1px solid #4b5563' }}>
                    Add
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Selected entries</h3>
          {entries.length === 0 && <p className="muted">No recipes selected yet.</p>}
          <ul className="entries-list">
            {entries.map((entry, i) => {
              const recipe = recipes.find((r) => r.id === entry.recipeId)
              return (
                <li key={i} className="entry-row">
                  <div style={{ flex: '1' }}>
                    <strong>{recipe ? (recipe.title || recipe.name) : `Recipe ${entry.recipeId}`}</strong>
                    <div className="muted">ID: {entry.recipeId}</div>
                  </div>

                  <label className="form-label small">
                    Meal type
                    <select className="form-input" value={entry.mealType} onChange={(e) => updateEntry(i, { mealType: e.target.value })}>
                      <option value="BREAKFAST">BREAKFAST</option>
                      <option value="LUNCH">LUNCH</option>
                      <option value="DINNER">DINNER</option>
                      <option value="SNACK">SNACK</option>
                    </select>
                  </label>

                  <label className="form-label small">
                    Servings
                    <input className="form-input" type="number" min="1" value={entry.servingsOverride} onChange={(e) => updateEntry(i, { servingsOverride: e.target.value })} />
                  </label>

                  <button type="button" className="btn" onClick={() => removeEntry(i)} style={{ border: '1px solid #4b5563' }}>
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : submitLabel}
          </button>
        </div>
      </form>
    </section>
  )
}

export default MealPlanForm
