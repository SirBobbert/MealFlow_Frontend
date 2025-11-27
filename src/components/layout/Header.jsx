function Header({ user, onLogout }) {
  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">MealFlow</h1>
        {user && (
          <p className="app-subtitle">
            Logged in as <strong>{user.name}</strong> ({user.email})
          </p>
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
