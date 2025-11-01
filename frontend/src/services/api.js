const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, opts = {}) {
	const res = await fetch(`${BASE}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		...opts,
	})
	if (!res.ok) {
		const text = await res.text()
		let msg = text || res.statusText
		try {
			// try parse json error
			const j = JSON.parse(text)
			msg = j.message || JSON.stringify(j)
				} catch {
					// ignore parse errors
				}
		throw new Error(msg)
	}
	return res.status === 204 ? null : res.json()
}

export const api = {
	getPosts: () => request('/posts'),
	createPost: (payload) => request('/posts', { method: 'POST', body: JSON.stringify(payload) }),
	login: (creds) => request('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
	register: (creds) => request('/auth/register', { method: 'POST', body: JSON.stringify(creds) }),
	getUserPosts: (userId) => request(`/users/${userId}/posts`),
	getMe: () => request('/auth/me'),
	logout: () => request('/auth/logout', { method: 'POST' }),
}

export default api
