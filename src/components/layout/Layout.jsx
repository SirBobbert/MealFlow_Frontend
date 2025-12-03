import Header from './Header.jsx'

function Layout({ children, auth, onLogout }) {
  return (
    <div className="app-shell">
      <Header user={auth.user} onLogout={onLogout} />
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}

export default Layout
