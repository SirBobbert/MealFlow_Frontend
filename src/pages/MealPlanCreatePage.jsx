import Header from '../components/layout/Header.jsx'
import Notification from '../components/layout/Notification.jsx'
import MealPlanForm from '../components/mealplans/MealPlanForm.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function MealPlanCreatePage({ auth, onLogout }) {
  const [notification, setNotification] = useState(null)
  const [createdId, setCreatedId] = useState(null)
  const [manualId, setManualId] = useState('')

  function handleCreated(created) {
    setCreatedId(created?.id || null)
    setNotification({ message: `Mealplan "${created.name || created.id}" created successfully.`, type: 'success' })
  }

  return (
    <div className="app-shell">
      <Header user={auth.user} onLogout={onLogout} />
      <Notification message={notification?.message} type={notification?.type} onClose={() => setNotification(null)} />
      <main className="app-main">
        <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/recipes" className="btn" style={{ border: '1px solid #4b5563' }}>
            Back to recipes
          </Link>

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

        <MealPlanForm token={auth.token} onCreated={handleCreated} />
      </main>
    </div>
  )
}

export default MealPlanCreatePage
