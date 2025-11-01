import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

export function requireAuth(req, res, next) {
	try {
		const token = req.cookies?.token || (req.headers.authorization || '').replace(/^Bearer\s+/, '')
		if (!token) return res.status(401).json({ message: 'Unauthorized' })
		const decoded = jwt.verify(token, JWT_SECRET)
		req.user = { id: decoded.id }
		next()
	} catch (err) {
		return res.status(401).json({ message: 'Unauthorized' })
	}
}
