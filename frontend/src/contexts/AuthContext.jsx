import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './AuthContextCore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    api
      .getMe()
      .then((u) => mounted && setUser(u))
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => (mounted = false)
  }, [])

  const login = async (creds) => {
    const u = await api.login(creds)
    setUser(u)
    return u
  }

  const register = async (creds) => {
    const u = await api.register(creds)
    setUser(u)
    return u
  }

  const logout = async () => {
    try {
      await api.logout()
    } finally {
      setUser(null)
      navigate('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Note: `useAuth` is provided from a separate module to keep this file
// exporting only React components (improves fast refresh compatibility).
