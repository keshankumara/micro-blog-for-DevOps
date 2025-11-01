import { useContext } from 'react'
import { AuthContext } from './AuthContextCore'

export default function useAuth() {
  return useContext(AuthContext)
}
