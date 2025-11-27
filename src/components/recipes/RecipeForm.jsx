// src/components/recipes/RecipeForm.jsx
import { useEffect, useState } from 'react'
import {
  fetchIngredients,
  createIngredient,
} from '../../api/ingredientsApi.js'
import { createRecipe, updateRecipe } from '../../api/recipesApi.js'

// Ingredient categories
const INGREDIENT_CATEGORIES = [
  { value: 'VEGETABLE', label: 'Vegetables' },
  { value: 'FRUIT', label: 'Fruits' },
  { value: 'MEAT', label: 'Meat' },
  { value: 'DAIRY', label: 'Dairy' },
  { value: 'GRAIN', label: 'Grains' },
  { value: 'SPICE', label: 'Spices & Herbs' },
  { value: 'CONDIMENT', label: 'Condiments & Sauces' },
  { value: 'BEVERAGE', label: 'Beverages' },
  { value: 'OTHER', label: 'Other' }
]

function RecipeForm({
  token,
  editingRecipe,
  onCreate,
  onUpdate,
  onCancelEdit,
  loading,
  error,
}) {
  // Local state for title
  const [title, setTitle] = useState('')

  // Local state for description
  const [description, setDescription] = useState('')

  // Local state for servings
  const [servings, setServings] = useState('')

  // Local state for prep time
  const [prepTime, setPrepTime] = useState('')

  // Local state for instructions (optional) - array of steps
  const [instructionSteps, setInstructionSteps] = useState([''])

  // Local state for client-side validation error
  const [localError, setLocalError] = useState(null)

  // All available ingredients from backend
  const [availableIngredients, setAvailableIngredients] =
    useState([])

  // Local state for loading ingredients
  const [ingredientsLoading, setIngredientsLoading] =
    useState(false)

  // Local state for ingredient API error
  const [ingredientsError, setIngredientsError] =
    useState(null)

  // Ingredient rows for this recipe
  // Each row: { ingredientId, ingredientName, amount, unit, category, isNewIngredient }
  const [ingredientRows, setIngredientRows] = useState([
    { ingredientId: null, ingredientName: '', amount: '', unit: '', category: '', isNewIngredient: false },
  ])

  // Row index that currently shows suggestions
  const [activeIngredientRowIndex, setActiveIngredientRowIndex] =
    useState(null)

  // State for new ingredient creation
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newIngredientName, setNewIngredientName] = useState('')
  const [newIngredientCategory, setNewIngredientCategory] = useState('OTHER')
  const [pendingRowIndex, setPendingRowIndex] = useState(null)
  const [pendingIngredientName, setPendingIngredientName] = useState('')

  // Load all ingredients once when token changes
  useEffect(() => {
    if (!token) return

    async function loadIngredients() {
      setIngredientsLoading(true)
      setIngredientsError(null)
      try {
        const data = await fetchIngredients(token)
        setAvailableIngredients(data)
      } catch (err) {
        setIngredientsError(
          err.message || 'Failed to load ingredients',
        )
      } finally {
        setIngredientsLoading(false)
      }
    }

    loadIngredients()
  }, [token])

  // When editingRecipe changes, sync form and ingredients
  useEffect(() => {
    if (editingRecipe) {
      console.log('Setting up form for editing recipe:', editingRecipe)
      console.log('Modal state:', showCategoryModal)
      setTitle(editingRecipe.title || '')
      setDescription(editingRecipe.description || '')
      setServings(
        editingRecipe.servings !== undefined &&
        editingRecipe.servings !== null
          ? String(editingRecipe.servings)
          : '',
      )
      setPrepTime(
        editingRecipe.prepTime !== undefined &&
        editingRecipe.prepTime !== null
          ? String(editingRecipe.prepTime)
          : '',
      )
      // Convert instructions string to array of steps
      const steps = editingRecipe.instructions
        ? editingRecipe.instructions.split('\n').filter(step => step.trim())
        : ['']
      setInstructionSteps(steps.length > 0 ? steps : [''])
      setLocalError(null)

      if (
        Array.isArray(editingRecipe.ingredients) &&
        editingRecipe.ingredients.length > 0
      ) {
        console.log('Processing ingredients for editing:', editingRecipe.ingredients)
        const mapped = editingRecipe.ingredients.map((ri) => ({
          ingredientId: ri.ingredientId ?? ri.id ?? null,
          ingredientName: ri.ingredientName || ri.name || '',
          amount:
            ri.amount !== undefined && ri.amount !== null
              ? String(ri.amount)
              : '',
          unit: ri.unit || '',
          category: ri.category || '',
          isNewIngredient: false
        }))
        console.log('Mapped ingredients:', mapped)
        setIngredientRows(mapped)
      } else {
        console.log('No ingredients found, setting default empty row')
        setIngredientRows([
          {
            ingredientId: null,
            ingredientName: '',
            amount: '',
            unit: '',
            category: '',
            isNewIngredient: false
          },
        ])
      }
    } else {
      setTitle('')
      setDescription('')
      setServings('')
      setPrepTime('')
      setInstructionSteps([''])
      setLocalError(null)
      setIngredientRows([
        {
          ingredientId: null,
          ingredientName: '',
          amount: '',
          unit: '',
          category: '',
          isNewIngredient: false
        },
      ])
    }
  }, [editingRecipe])

  // Add ingredient row
  function handleAddIngredientRow() {
    setIngredientRows((rows) => [
      ...rows,
      {
        ingredientId: null,
        ingredientName: '',
        amount: '',
        unit: '',
        category: '',
        isNewIngredient: false
      },
    ])
  }

  // Remove ingredient row by index
  function handleRemoveIngredientRow(index) {
    setIngredientRows((rows) =>
      rows.length === 1
        ? rows
        : rows.filter((_, i) => i !== index),
    )
  }

  // Update ingredient row field
  function handleChangeIngredientRow(index, field, value) {
    setIngredientRows((rows) =>
      rows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    )

    if (field === 'ingredientName') {
      // When typing name, clear any previously selected id
      setIngredientRows((rows) =>
        rows.map((row, i) =>
          i === index ? { ...row, ingredientId: null } : row,
        ),
      )
      setActiveIngredientRowIndex(index)
      
      // Update category field based on ingredient
      const trimmedValue = value.trim()
      if (trimmedValue.length > 2) {
        // Add a small delay to avoid checking on every keystroke
        setTimeout(() => {
          const existingIngredient = availableIngredients.find(
            ing => ing.name.toLowerCase() === trimmedValue.toLowerCase()
          )
          
          console.log('Checking ingredient:', trimmedValue, 'Found:', existingIngredient)
          
          // Update the row with category info
          setIngredientRows((rows) =>
            rows.map((row, i) =>
              i === index ? { 
                ...row, 
                category: existingIngredient ? existingIngredient.category : row.category,
                isNewIngredient: !existingIngredient && availableIngredients.length > 0
              } : row,
            ),
          )
        }, 300)
      }
    }
  }

  // Select suggestion for a row
  function handleSelectSuggestion(rowIndex, ingredient) {
    setIngredientRows((rows) =>
      rows.map((row, i) =>
        i === rowIndex
          ? {
              ...row,
              ingredientId: ingredient.id,
              ingredientName: ingredient.name,
              category: ingredient.category || '',
              isNewIngredient: false
            }
          : row,
      ),
    )
    setActiveIngredientRowIndex(null)
  }

  // Handle blur on ingredient name input
  function handleIngredientNameBlur() {
    // slight delay so click on suggestion still works
    setTimeout(() => setActiveIngredientRowIndex(null), 120)
  }

  // Handle instruction step changes
  function handleInstructionStepChange(index, value) {
    setInstructionSteps(steps => 
      steps.map((step, i) => i === index ? value : step)
    )
  }

  // Add new instruction step
  function addInstructionStep() {
    setInstructionSteps(steps => [...steps, ''])
  }

  // Remove instruction step
  function removeInstructionStep(index) {
    if (instructionSteps.length === 1) return // Keep at least one step
    setInstructionSteps(steps => steps.filter((_, i) => i !== index))
  }

  // Handle creating new ingredient with category
  async function handleCreateIngredient() {
    try {
      console.log('Creating ingredient:', pendingIngredientName, 'with category:', newIngredientCategory)
      const created = await createIngredient(token, {
        name: pendingIngredientName,
        category: newIngredientCategory,
      })
      
      console.log('Created ingredient:', created)
      
      // Update the pending ingredient row
      setIngredientRows(rows => 
        rows.map((row, i) => 
          i === pendingRowIndex 
            ? { ...row, ingredientId: created.id }
            : row
        )
      )
      
      setAvailableIngredients((prev) => [...prev, created])
      setShowCategoryModal(false)
      setNewIngredientName('')
      setNewIngredientCategory('OTHER')
      setPendingRowIndex(null)
      setPendingIngredientName('')
      
      // Continue with form submission by calling handleSubmit directly
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} })
      }, 100)
      
    } catch (err) {
      console.error('Error creating ingredient:', err)
      setLocalError(err.message || 'Failed to create ingredient')
    }
  }

  // Cancel ingredient creation
  function handleCancelIngredientCreation() {
    setShowCategoryModal(false)
    setNewIngredientName('')
    setNewIngredientCategory('OTHER')
    setPendingRowIndex(null)
    setPendingIngredientName('')
  }

  // Handle recipe form submit
  async function handleSubmit(e) {
    e.preventDefault()

    // Required: title, description, servings, prepTime
    if (
      !title.trim() ||
      !description.trim() ||
      !servings.trim() ||
      !prepTime.trim()
    ) {
      setLocalError(
        'Name, description, servings and prep time are required.',
      )
      return
    }

    const servingsNumber = Number(servings)
    const prepTimeNumber = Number(prepTime)

    if (
      Number.isNaN(servingsNumber) ||
      Number.isNaN(prepTimeNumber)
    ) {
      setLocalError('Servings and prep time must be valid numbers.')
      return
    }



    // Validate that partially filled rows are complete
    const hasIncompleteRow = ingredientRows.some((row) => {
      const anyFilled = row.ingredientName !== '' || row.amount !== '' || row.unit !== ''
      const allFilled = row.ingredientName !== '' && row.amount !== '' && row.unit !== ''
      return anyFilled && !allFilled
    })

    if (hasIncompleteRow) {
      setLocalError(
        'For each ingredient row, fill ingredient, amount and unit, or leave the row completely empty.',
      )
      return
    }

    // Validate that new ingredients have categories selected
    const hasNewIngredientWithoutCategory = ingredientRows.some((row) => {
      const isRowFilled = row.ingredientName !== '' && row.amount !== '' && row.unit !== ''
      return isRowFilled && row.isNewIngredient && !row.category
    })

    if (hasNewIngredientWithoutCategory) {
      setLocalError(
        'Please select a category for all new ingredients.',
      )
      return
    }

    // Build ingredients payload - need to handle new vs existing ingredients
    const ingredientsPayload = []
    
    for (const row of ingredientRows) {
      if (row.ingredientName && row.amount && row.unit) {
        const amount = Number(row.amount)
        if (isNaN(amount)) {
          setLocalError('All amounts must be valid numbers.')
          return
        }
        
        if (row.isNewIngredient) {
          // For new ingredients, create them first
          try {
            const newIngredient = await createIngredient(token, {
              name: row.ingredientName,
              category: row.category || 'OTHER'
            })
            ingredientsPayload.push({
              ingredientId: newIngredient.id,
              amount: amount,
              unit: row.unit
            })
          } catch (err) {
            setLocalError(`Failed to create ingredient "${row.ingredientName}": ${err.message}`)
            return
          }
        } else {
          // For existing ingredients, use the ingredientId
          ingredientsPayload.push({
            ingredientId: row.ingredientId,
            amount: amount,
            unit: row.unit
          })
        }
      }
    }

    // Convert instruction steps array to string
    const instructions = instructionSteps
      .filter(step => step.trim()) // Remove empty steps
      .join('\n')

    const payload = {
      title,
      description,
      servings: servingsNumber,
      prepTime: prepTimeNumber,
      instructions,
      ingredients: ingredientsPayload,
    }

    console.log('Form submitting with payload:', payload)
    console.log('Ingredient rows before processing:', ingredientRows)
    console.log('Processed ingredients payload:', ingredientsPayload)

    setLocalError(null)

    if (editingRecipe) {
      await onUpdate(editingRecipe.id, payload)
    } else {
      const result = await onCreate(payload)
      // Clear form if creation was successful
      if (result?.success) {
        setTitle('')
        setDescription('')
        setServings('')
        setPrepTime('')
        setInstructionSteps([''])
        setIngredientRows([{ ingredientId: null, ingredientName: '', amount: '', unit: '' }])
      }
    }
  }

  const isEditing = !!editingRecipe

  return (
    <section className="card">
      <h2>{isEditing ? 'Edit recipe' : 'Create recipe'}</h2>

      {localError && <p className="error">{localError}</p>}
      {error && <p className="error">{error}</p>}
      {ingredientsError && (
        <p className="error">{ingredientsError}</p>
      )}

      {isEditing && editingRecipe && (
        <p className="muted">
          Editing recipe with ID <strong>{editingRecipe.id}</strong>.
        </p>
      )}

      <form onSubmit={handleSubmit} className="form">
        <label className="form-label">
          Name
          <input
            className="form-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="form-label">
          Description
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            required
          />
        </label>

        <label className="form-label">
          Servings
          <input
            className="form-input"
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
          />
        </label>

        <label className="form-label">
          Prep time (minutes)
          <input
            className="form-input"
            type="number"
            min="0"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            required
          />
        </label>

        <div className="form-section">
          <label className="form-label">
            Instructions (optional)
          </label>
          <div className="instruction-steps">
            {instructionSteps.map((step, index) => (
              <div key={index} className="instruction-step-input">
                <span className="step-number-input">Step {index + 1}</span>
                <input
                  type="text"
                  className="form-input"
                  value={step}
                  onChange={(e) => handleInstructionStepChange(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
                {(step.trim() !== '' || instructionSteps.length > 1) && (
                  <button
                    type="button"
                    className="btn btn-small"
                    onClick={() => removeInstructionStep(index)}
                    disabled={instructionSteps.length === 1}
                    style={{ 
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      fontSize: '1rem',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#374151',
                      border: '1px solid #4b5563',
                      color: '#d1d5db'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn"
            onClick={addInstructionStep}
            style={{ border: '1px solid #4b5563' }}
          >
            Add step
          </button>
        </div>

        <div style={{ borderTop: '1px solid #374151', margin: '1.5rem 0' }}></div>

        <h3>Ingredients</h3>
        {ingredientsLoading && (
          <p className="muted">Loading ingredients...</p>
        )}

        <div className="ingredients-list">
          {ingredientRows.map((row, index) => {
            const isActive = activeIngredientRowIndex === index
            const query = row.ingredientName.trim().toLowerCase()

            // Filter + alphabetically sort suggestions
            const suggestions =
              isActive && query.length > 0
                ? availableIngredients
                    .filter((ing) =>
                      ing.name.toLowerCase().includes(query),
                    )
                    .sort((a, b) =>
                      a.name.localeCompare(b.name),
                    )
                    .slice(0, 6)
                : []

            return (
              <div
                key={index}
                className="ingredient-row"
              >
                <div>
                  <label className="form-label small">
                    Ingredient
                    <input
                      className="form-input"
                      type="text"
                      value={row.ingredientName}
                      onChange={(e) =>
                        handleChangeIngredientRow(
                          index,
                          'ingredientName',
                          e.target.value,
                        )
                      }
                      onFocus={() =>
                        setActiveIngredientRowIndex(index)
                      }
                      onBlur={handleIngredientNameBlur}
                      placeholder="Carrot, Onion..."
                    />
                  </label>

                  {suggestions.length > 0 && (
                    <ul className="ingredient-suggestions">
                      {suggestions.map((ing) => (
                        <li key={ing.id}>
                          <button
                            type="button"
                            onMouseDown={(e) =>
                              e.preventDefault()
                            }
                            onClick={() =>
                              handleSelectSuggestion(
                                index,
                                ing,
                              )
                            }
                          >
                            {ing.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 0', minWidth: 0, width: '50%' }}>
                    <label className="form-label small">
                      Amount
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={row.amount}
                        onChange={(e) =>
                          handleChangeIngredientRow(
                            index,
                            'amount',
                            e.target.value,
                          )
                        }
                        style={{ width: '100%', minWidth: 0 }}
                      />
                    </label>
                  </div>

                  <div style={{ flex: '1 1 0', minWidth: 0, width: '50%' }}>
                    <label className="form-label small">
                      Unit
                      <input
                        className="form-input"
                        type="text"
                        value={row.unit}
                        onChange={(e) =>
                          handleChangeIngredientRow(
                            index,
                            'unit',
                            e.target.value,
                          )
                        }
                        placeholder="g, ml, pcs..."
                        style={{ width: '100%', minWidth: 0 }}
                      />
                    </label>
                  </div>
                </div>

                <label className="form-label small">
                  Category
                  {row.isNewIngredient ? (
                    <select
                      className="form-input"
                      value={row.category}
                      onChange={(e) =>
                        handleChangeIngredientRow(
                          index,
                          'category',
                          e.target.value,
                        )
                      }
                      style={{ backgroundColor: '#020617', borderColor: '#374151', color: 'inherit' }}
                    >
                      <option value="">Select category *</option>
                      {INGREDIENT_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      type="text"
                      value={row.category}
                      readOnly
                      placeholder={row.ingredientName ? "Loading category..." : "Type ingredient first..."}
                      style={{ backgroundColor: '#020617', borderColor: '#374151', color: '#9ca3af' }}
                    />
                  )}
                </label>

                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    handleRemoveIngredientRow(index)
                  }
                  style={{ border: '1px solid #4b5563' }}
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className="btn"
          onClick={handleAddIngredientRow}
          style={{ border: '1px solid #4b5563' }}
        >
          Add ingredient
        </button>

        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <button
            className="btn primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Saving...'
              : isEditing
              ? 'Save changes'
              : 'Save recipe'}
          </button>

          {isEditing && (
            <button
              className="btn"
              type="button"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal">
            <h3>Select Category for New Ingredient</h3>
            <p>Creating ingredient: <strong>{pendingIngredientName}</strong></p>
            
            <label className="form-label">
              Category
              <select 
                className="form-input"
                value={newIngredientCategory}
                onChange={(e) => setNewIngredientCategory(e.target.value)}
              >
                {INGREDIENT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
            
            <div className="modal-buttons">
              <button 
                type="button" 
                className="btn primary"
                onClick={handleCreateIngredient}
              >
                Create Ingredient
              </button>
              <button 
                type="button" 
                className="btn"
                onClick={handleCancelIngredientCreation}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default RecipeForm
