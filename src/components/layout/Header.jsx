import { Link } from 'react-router-dom'

function Header({ user, onLogout }) {
  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">MealFlow</h1>
        {user && (
          <div>
            <p className="app-subtitle">
              Logged in as <strong>{user.name}</strong> ({user.email})
            </p>
            <nav style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Link to="/recipes" className="btn" style={{ border: '1px solid #4b5563' }}>
                Recipes
              </Link>
              <Link to="/mealplans/create" className="btn" style={{ border: '1px solid #4b5563' }}>
                Create mealplan
              </Link>
              <Link to="/mealplans/generate" className="btn" style={{ border: '1px solid #4b5563' }}>
                Generate shopping list
              </Link>
            </nav>
          </div>
        )}
      </div>
      {user && (
        <button
          className="btn"
          type="button"
          onClick={onLogout}
        >
          Log out
        </button>
      )}
    </header>
  )
}

export default Header
