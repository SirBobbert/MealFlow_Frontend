import { Link } from 'react-router-dom'

function BurgerMenu({ open, onClose }) {
  return (
    <aside className={`burger-menu ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="burger-inner" onClick={(e) => e.stopPropagation()}>
        <nav>
          <ul>
            <li><Link to="/recipes">Recipes</Link></li>
            <li><Link to="/mealplans/create">Create mealplan</Link></li>
            <li><Link to="/mealplans/generate">Generate shopping list</Link></li>
            <li><Link to="/mealplans/1/view">View mealplan (example)</Link></li>
          </ul>
        </nav>
      </div>
      <style>{`
        .burger-menu{ position:fixed; inset:0; display:flex; }
        .burger-menu:not(.open){ pointer-events:none; }
        .burger-menu.open{ pointer-events:auto; }
        .burger-menu .burger-inner{ pointer-events:auto; width:280px; max-width:80%; background:#0b1220; color:inherit; padding:1rem; box-shadow:2px 0 12px rgba(0,0,0,0.6); transform:translateX(-110%); transition:transform .22s ease; }
        .burger-menu.open .burger-inner{ transform:translateX(0); }
        .burger-menu ul{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.5rem }
        .burger-menu a{ color:inherit; text-decoration:none }
      `}</style>
    </aside>
  )
}

export default BurgerMenu
