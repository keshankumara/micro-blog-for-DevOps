import { createContext } from 'react'

// Core context exported separately so component files only export components.
export const AuthContext = createContext(null)

export default AuthContext
