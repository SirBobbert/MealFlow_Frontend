import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../components/layout/Notification.jsx'
import { fetchRecipeById } from '../api/recipesApi.js'
import { createMealplan } from '../api/mealplansApi.js'
import { useNavigationHistory } from '../hooks/useNavigationHistory.js'

function MealPlanDraftPage({ auth }) {
  const [items, setItems] = useState([]) // { id, title? }
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [mealplanName, setMealplanName] = useState('')
  const { goBack } = useNavigationHistory()

  useEffect(() => {
    loadDraft()
  }, [])

  async function loadDraft() {
    setLoading(true)
    try {
      const raw = localStorage.getItem('mealplan_draft_ids')
      const parsed = raw ? JSON.parse(raw) : []
      // parsed may be an array of numbers or objects { id, mealType, servings }
      const normalized = parsed.map((p) => {
        if (typeof p === 'number') return { id: Number(p), mealType: 'DINNER', servings: 1 }
        if (p && typeof p === 'object') return { id: Number(p.id), mealType: p.mealType || 'DINNER', servings: p.servings || 1 }
        return null
      }).filter(Boolean)

      const uniqueById = []
      const seen = new Set()
      for (const item of normalized) {
        if (!seen.has(item.id)) {
          seen.add(item.id)
          uniqueById.push(item)
        }
      }

      const resolved = []
      for (const it of uniqueById) {
        try {
          const data = await fetchRecipeById(auth?.token, it.id)
          resolved.push({ id: it.id, title: data?.title || data?.name || `Recipe ${it.id}`, mealType: it.mealType, servings: it.servings, baseServings: data?.servings || 1, dayOfWeek: it.dayOfWeek || null })
        } catch (err) {
          resolved.push({ id: it.id, title: `Recipe ${it.id}`, mealType: it.mealType, servings: it.servings, baseServings: 1, dayOfWeek: it.dayOfWeek || null })
        }
      }
      setItems(resolved)
    } catch (err) {
      setNotification({ message: `Failed to load draft: ${err.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function removeItem(id) {
    try {
      const raw = localStorage.getItem('mealplan_draft_ids')
      const ids = raw ? JSON.parse(raw) : []
  const filtered = ids.filter((n) => Number((typeof n === 'number' ? n : n.id)) !== Number(id))
      localStorage.setItem('mealplan_draft_ids', JSON.stringify(filtered))
      setItems((prev) => prev.filter((i) => Number(i.id) !== Number(id)))
      setNotification({ message: `Removed recipe ${id} from draft.`, type: 'success' })
    } catch (err) {
      setNotification({ message: `Failed to remove: ${err.message}`, type: 'error' })
    }
  }

  function clearDraft() {
    localStorage.removeItem('mealplan_draft_ids')
    setItems([])
    setNotification({ message: 'Cleared draft mealplan.', type: 'success' })
  }

  async function handleCreateFromDraft() {
    if (!items || items.length === 0) {
      setNotification({ message: 'No recipes in draft to create a mealplan.', type: 'info' })
      return
    }
    if (!mealplanName || mealplanName.trim().length === 0) {
      setNotification({ message: 'Please provide a name for the mealplan.', type: 'info' })
      return
    }

    const payload = {
      name: mealplanName.trim(),
      listOfEntries: items.map((it) => ({ recipeId: Number(it.id), servingsOverride: Number(it.servings) || 1, mealType: it.mealType || 'DINNER', dayOfWeek: it.dayOfWeek || null })),
    }

    setCreating(true)
    try {
      const created = await createMealplan(auth?.token, payload)
      // clear draft
      localStorage.removeItem('mealplan_draft_ids')
      setItems([])
      setNotification({ message: `Mealplan "${created?.name || created?.id}" created.`, type: 'success' })
      // navigate to mealplans list or the created mealplan view if id available
      if (created && created.id) navigate(`/mealplans/${created.id}/view`)
      else navigate('/mealplans')
    } catch (err) {
      setNotification({ message: `Failed to create mealplan: ${err.message}`, type: 'error' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <Notification message={notification?.message} type={notification?.type} onClose={() => setNotification(null)} />

      <section className="card">
        <h2>Draft mealplan</h2>

        <div style={{ marginBottom: '0.75rem' }}>
          <button onClick={() => navigate(-1)} className="btn" style={{ border: '1px solid #4b5563' }}>
            ← Back
          </button>
          <button className="btn" style={{ marginLeft: '0.5rem', border: '1px solid #4b5563' }} onClick={clearDraft}>
            Clear draft
          </button>
          <div style={{ display: 'inline-flex', gap: '0.5rem', marginLeft: '0.5rem', alignItems: 'center' }}>
            <input className="form-input" placeholder="Mealplan name" value={mealplanName} onChange={(e) => setMealplanName(e.target.value)} style={{ width: '200px' }} />
            <button className="btn primary" onClick={handleCreateFromDraft} disabled={creating} style={{ border: '1px solid #4b5563' }}>
              {creating ? 'Creating...' : 'Create mealplan'}
            </button>
          </div>
        </div>

        {loading && <p className="muted">Loading draft...</p>}

        {!loading && items.length === 0 && <p className="muted">No recipes in draft. Add recipes from the recipes list.</p>}

        {!loading && items.length > 0 && (
          <ul className="simple-list">
            {items.map((it) => (
              <li key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{it.title}</strong>
                  <div className="muted">ID: {it.id} · Category: {it.mealType} · Servings: {it.servings} (base: {it.baseServings})</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link to={`/recipes/${it.id}`} className="btn" style={{ border: '1px solid #4b5563' }}>
                    View
                  </Link>
                  <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <select value={it.dayOfWeek || ''} onChange={(e) => {
                      const newDay = e.target.value || null
                      setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, dayOfWeek: newDay } : p))
                      const raw = localStorage.getItem('mealplan_draft_ids')
                      const parsed = raw ? JSON.parse(raw) : []
                      const updated = parsed.map((p) => (typeof p === 'number' ? (p === it.id ? { id: it.id, mealType: it.mealType, servings: it.servings, dayOfWeek: newDay } : p) : (p.id === it.id ? { ...p, dayOfWeek: newDay } : p)))
                      localStorage.setItem('mealplan_draft_ids', JSON.stringify(updated))
                    }}>
                      <option value="">(no day)</option>
                      <option value="MONDAY">MONDAY</option>
                      <option value="TUESDAY">TUESDAY</option>
                      <option value="WEDNESDAY">WEDNESDAY</option>
                      <option value="THURSDAY">THURSDAY</option>
                      <option value="FRIDAY">FRIDAY</option>
                      <option value="SATURDAY">SATURDAY</option>
                      <option value="SUNDAY">SUNDAY</option>
                    </select>
                  </label>
                  <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <select value={it.mealType} onChange={(e) => {
                      const newType = e.target.value
                      setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, mealType: newType } : p))
                      // persist
                      const raw = localStorage.getItem('mealplan_draft_ids')
                      const parsed = raw ? JSON.parse(raw) : []
                      const updated = parsed.map((p) => (typeof p === 'number' ? (p === it.id ? { id: it.id, mealType: newType, servings: it.servings } : p) : (p.id === it.id ? { ...p, mealType: newType } : p)))
                      localStorage.setItem('mealplan_draft_ids', JSON.stringify(updated))
                    }}>
                      <option value="BREAKFAST">BREAKFAST</option>
                      <option value="LUNCH">LUNCH</option>
                      <option value="DINNER">DINNER</option>
                      <option value="SNACK">SNACK</option>
                    </select>
                  </label>
                  <label style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <input type="number" min="1" value={it.servings} onChange={(e) => {
                      const newS = Number(e.target.value) || 1
                      setItems((prev) => prev.map((p) => p.id === it.id ? { ...p, servings: newS } : p))
                      const raw = localStorage.getItem('mealplan_draft_ids')
                      const parsed = raw ? JSON.parse(raw) : []
                      const updated = parsed.map((p) => {
                        if (typeof p === 'number') return (p === it.id ? { id: it.id, mealType: it.mealType, servings: newS, dayOfWeek: it.dayOfWeek } : p)
                        if (p && typeof p === 'object') return (p.id === it.id ? { ...p, servings: newS, dayOfWeek: it.dayOfWeek } : p)
                        return p
                      })
                      localStorage.setItem('mealplan_draft_ids', JSON.stringify(updated))
                    }} style={{ width: '60px' }} />
                  </label>
                  <div className="muted">Scale: {it.baseServings ? (Math.round((it.servings / it.baseServings) * 100) / 100) : 1}×</div>
                  <button className="btn" onClick={() => removeItem(it.id)} style={{ border: '1px solid #4b5563' }}>
                    Remove
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

export default MealPlanDraftPage
