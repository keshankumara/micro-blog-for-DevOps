import express from 'express';
import Post from '../models/Post.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Create Post
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { content, isPublic } = req.body;

    const post = await Post.create({
      userId: req.userId,
      username: req.username,
      content,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Public Posts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User's Posts (both public and private)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow users to see their own posts (including private ones)
    if (userId !== req.userId) {
      const posts = await Post.find({ userId, isPublic: true }).sort({ createdAt: -1 });
      return res.json(posts);
    }

    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Post
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isPublic } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.content = content || post.content;
    if (isPublic !== undefined) {
      post.isPublic = isPublic;
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like Post
router.put('/like/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.userId);
    if (index === -1) {
      // Like the post
      post.likes.push(req.userId);
    } else {
      // Unlike the post
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Comment on Post
router.post('/comment/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      userId: req.userId,
      username: req.username,
      text,
    });

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
