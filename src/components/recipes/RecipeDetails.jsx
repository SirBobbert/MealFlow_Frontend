// src/components/recipes/RecipeDetails.jsx
import { useEffect, useState } from 'react'

function RecipeDetails({ recipe, token }) {
  if (!recipe) {
    return (
      <section className="card">
        <p>Recipe not found.</p>
      </section>
    )
  }

  const hasInstructions =
    typeof recipe.instructions === 'string' &&
    recipe.instructions.trim().length > 0

  return (
    <section className="card">
      <div className="recipe-view-header">
        <div>
          <h1 className="recipe-title">{recipe.title}</h1>
          <p className="recipe-id">Recipe ID: {recipe.id}</p>
        </div>
      </div>

      <div className="recipe-meta-grid">
        {recipe.servings && (
          <div className="recipe-meta-item">
            <strong>Servings:</strong> {recipe.servings}
          </div>
        )}
        {recipe.prepTime && (
          <div className="recipe-meta-item">
            <strong>Prep Time:</strong> {recipe.prepTime} minutes
          </div>
        )}
      </div>

      {recipe.description && (
        <div className="recipe-section">
          <h3>Description</h3>
          <p className="recipe-description">{recipe.description}</p>
        </div>
      )}

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="recipe-section">
          <h3>Ingredients</h3>
          <ul className="ingredients-display">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="ingredient-display-item">
                <span className="ingredient-amount">
                  {ingredient.amount} {ingredient.unit}
                </span>
                <span className="ingredient-name">
                  {ingredient.ingredientName || ingredient.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasInstructions && (
        <div className="recipe-section">
          <h3>Instructions</h3>
          <div className="recipe-instructions">
            {recipe.instructions
              .split('\n')
              .filter(line => line.trim()) // Remove empty lines
              .map((line, index) => (
                <div key={index} className="instruction-step">
                  <span className="step-number">Step {index + 1}</span>
                  <p className="instruction-text">
                    {line.trim()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {(!recipe.ingredients || recipe.ingredients.length === 0) && (
        <div className="recipe-section">
          <p className="muted">No ingredients listed for this recipe.</p>
        </div>
      )}
    </section>
  )
}

export default RecipeDetails