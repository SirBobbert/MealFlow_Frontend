import { Link } from 'react-router-dom'
import { useState } from 'react'

function RecipeList({
  recipes,
  loading,
  error,
  onDelete,
  deletingId,
}) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)
  if (loading) {
    return (
      <section className="card">
        <h2>Your recipes</h2>
        <p>Loading...</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>Your recipes</h2>

      {error && <p className="error">{error}</p>}

      {!error && recipes.length === 0 && (
        <p className="muted">
          No recipes yet. Create your first one.
        </p>
      )}

      <ul className="recipe-list">
        {recipes.map((r) => {
          const hasInstructions =
            typeof r.instructions === 'string' &&
            r.instructions.trim().length > 0

          return (
            <li key={r.id} className="recipe-item">
              <div className="recipe-header">
                <div>
                  <h3>
                    {r.title}{' '}
                    <span className="muted">
                      (ID: {r.id})
                    </span>
                  </h3>

                  {(r.servings || r.prepTime) && (
                    <p className="recipe-meta">
                      {r.servings && (
                        <span>Servings: {r.servings}</span>
                      )}
                      {r.servings && r.prepTime && (
                        <span> · </span>
                      )}
                      {r.prepTime && (
                        <span>Prep: {r.prepTime} min</span>
                      )}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Link
                    to={`/recipes/${r.id}`}
                    className="btn"
                    style={{ border: '1px solid #4b5563' }}
                  >
                    View
                  </Link>
                  <Link
                    to={`/recipes/${r.id}/edit`}
                    className="btn"
                    style={{ border: '1px solid #4b5563' }}
                  >
                    Edit
                  </Link>
                  {onDelete && (
                    confirmingDeleteId === r.id ? (
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            onDelete(r.id)
                            setConfirmingDeleteId(null)
                          }}
                          disabled={deletingId === r.id}
                        >
                          {deletingId === r.id ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => setConfirmingDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setConfirmingDeleteId(r.id)}
                        style={{ border: '1px solid #4b5563' }}
                      >
                        Delete
                      </button>
                    )
                  )}
                </div>
              </div>

              {r.description && (
                <p className="recipe-description">
                  {r.description}
                </p>
              )}

              {r.ingredients && r.ingredients.length > 0 && (
                <div className="recipe-ingredients-preview">
                  <strong>Ingredients:</strong>{' '}
                  {r.ingredients
                    .map(ingredient => ingredient.ingredientName || ingredient.name)
                    .filter(name => name) // Remove any undefined/null names
                    .join(', ')}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default RecipeList
