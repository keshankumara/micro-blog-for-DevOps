import Post from '../models/Post.jsx'

export async function getPosts(req, res, next) {
	try {
		const posts = await Post.find().populate('author', 'name').sort({ createdAt: -1 }).lean()
		res.json(posts)
	} catch (err) {
		next(err)
	}
}

export async function createPost(req, res, next) {
	try {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
		const { content } = req.body
		if (!content || !content.trim()) return res.status(400).json({ message: 'Content is required' })

		const post = await Post.create({ author: req.user.id, content })
		const full = await Post.findById(post._id).populate('author', 'name')
		res.status(201).json(full)
	} catch (err) {
		next(err)
	}
}

export async function getUserPosts(req, res, next) {
	try {
		const { id } = req.params
		const posts = await Post.find({ author: id }).populate('author', 'name').sort({ createdAt: -1 })
		res.json(posts)
	} catch (err) {
		next(err)
	}
}

export async function deletePost(req, res, next) {
	try {
		const { id } = req.params
		const post = await Post.findById(id)
		if (!post) return res.status(404).json({ message: 'Not found' })
		if (!req.user || post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
		await post.remove()
		res.json({ ok: true })
	} catch (err) {
		next(err)
	}
}

