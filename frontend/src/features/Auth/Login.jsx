import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../contexts/useAuth'
import Button from '../../components/Button'

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const { login } = useAuth()

	const submit = async (e) => {
		e.preventDefault()
		setLoading(true)
		try {
			await login({ email, password })
			navigate('/')
		} catch (err) {
			console.error(err)
			alert(err.message || 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="app-container">
			<div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
				<h2>Login</h2>
				<form onSubmit={submit} className="stack">
					<label className="form-field">
						<span className="small muted">Email</span>
						<input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
					</label>
					<label className="form-field">
						<span className="small muted">Password</span>
						<input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
					</label>
					<div className="row" style={{ justifyContent: 'flex-end' }}>
						<Button type="submit">{loading ? 'Signing in...' : 'Sign in'}</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
