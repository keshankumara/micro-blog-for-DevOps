import React from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../contexts/useAuth'

export default function NavBar() {
  const { user, logout } = useAuth() || {}

  return (
    <header className="nav app-header">
      <div className="row">
        <Link to="/" className="brand">
          MicroBlog
        </Link>
        <span className="muted small">Share short posts • public</span>
      </div>

      <nav className="row">
        {user ? (
          <>
            <Link to={`/profile/${user.id}`} className="small muted">
              Hello, {user.name}
            </Link>
            <button onClick={logout} className="btn ghost">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn ghost">
              Log in
            </Link>
            <Link to="/register" className="btn">
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
