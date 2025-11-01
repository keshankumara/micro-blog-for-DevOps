import User from '../models/User.jsx'

export async function getUser(req, res, next) {
	try {
		const { id } = req.params
		const user = await User.findById(id).select('-password')
		if (!user) return res.status(404).json({ message: 'Not found' })
		res.json(user)
	} catch (err) {
		next(err)
	}
}
