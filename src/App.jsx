import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './pages/LoginPage.jsx'
import RecipesPage from './pages/RecipesPage.jsx'
import RecipeCreatePage from './pages/RecipeCreatePage.jsx'
import RecipeViewPage from './pages/RecipeViewPage.jsx'
import RecipeEditPage from './pages/RecipeEditPage.jsx'
import MealPlanCreatePage from './pages/MealPlanCreatePage.jsx'
import ShoppingListPage from './pages/ShoppingListPage.jsx'
import GenerateShoppingListPage from './pages/GenerateShoppingListPage.jsx'
import MealPlanViewPage from './pages/MealPlanViewPage.jsx'
import MealPlansPage from './pages/MealPlansPage.jsx'
import MealPlanDraftPage from './pages/MealPlanDraftPage.jsx'
import Layout from './components/layout/Layout.jsx'

function App() {
  const { auth, login, logout } = useAuth()
  const isAuthenticated =
    !!auth.user && !!auth.token

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={login} />
  }

  return (
    <Router>
      <Layout auth={auth} onLogout={logout}>
        <Routes>
          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route 
            path="/recipes" 
            element={<RecipesPage auth={auth} onLogout={logout} />} 
          />
          <Route 
            path="/recipes/create" 
            element={<RecipeCreatePage auth={auth} onLogout={logout} />} 
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
          <Route path="/mealplans" element={<MealPlansPage auth={auth} onLogout={logout} />} />
          <Route path="/mealplans/draft" element={<MealPlanDraftPage auth={auth} onLogout={logout} />} />
          <Route path="/mealplans/:mealplanId/shopping-list" element={<ShoppingListPage auth={auth} onLogout={logout} />} />
          <Route
            path="/mealplans/:mealplanId/view"
            element={<MealPlanViewPage auth={auth} onLogout={logout} />}
          />
          <Route
            path="/mealplans/generate"
            element={<GenerateShoppingListPage auth={auth} onLogout={logout} />}
          />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
