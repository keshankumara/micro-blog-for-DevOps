import express from 'express'
import { getPosts, createPost, getUserPosts, deletePost } from '../controllers/postController.js'
import { requireAuth } from '../middlewares/auth.js'

const router = express.Router()

router.get('/', getPosts)
router.post('/', requireAuth, createPost)
router.get('/user/:id', getUserPosts)
router.delete('/:id', requireAuth, deletePost)

export default router
