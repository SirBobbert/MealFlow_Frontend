import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './pages/LoginPage.jsx'
import RecipesPage from './pages/RecipesPage.jsx'
import RecipeViewPage from './pages/RecipeViewPage.jsx'
import RecipeEditPage from './pages/RecipeEditPage.jsx'
import MealPlanCreatePage from './pages/MealPlanCreatePage.jsx'
import ShoppingListPage from './pages/ShoppingListPage.jsx'
import GenerateShoppingListPage from './pages/GenerateShoppingListPage.jsx'

function App() {
  const { auth, login, logout } = useAuth()
  const isAuthenticated =
    !!auth.user && !!auth.token

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={login} />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/recipes" replace />} />
        <Route 
          path="/recipes" 
          element={<RecipesPage auth={auth} onLogout={logout} />} 
        />
        <Route 
          path="/recipes/:recipeId" 
          element={<RecipeViewPage auth={auth} onLogout={logout} />} 
        />
        <Route 
          path="/recipes/:recipeId/edit" 
          element={<RecipeEditPage auth={auth} onLogout={logout} />} 
        />
        <Route
          path="/mealplans/create"
          element={<MealPlanCreatePage auth={auth} onLogout={logout} />}
        />
        <Route
          path="/mealplans/:mealplanId/shopping-list"
          element={<ShoppingListPage auth={auth} onLogout={logout} />}
        />
        <Route
          path="/mealplans/generate"
          element={<GenerateShoppingListPage auth={auth} onLogout={logout} />}
        />
      </Routes>
    </Router>
  )
}

export default App
