import express from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Helper function to validate MongoDB ID
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to validate content
const validateContent = (content) => {
  return content && typeof content === 'string' && content.trim().length > 0 && content.length <= 5000;
};

// Helper function to validate comment text
const validateComment = (text) => {
  return text && typeof text === 'string' && text.trim().length > 0 && text.length <= 1000;
};

// Create Post
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { content, isPublic } = req.body;

    // Validate input
    if (!validateContent(content)) {
      return res.status(400).json({ message: 'Content must be provided and not exceed 5000 characters' });
    }

    const post = await Post.create({
      userId: req.userId,
      username: req.username,
      content: content.trim(),
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Public Posts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);

    const posts = await Post.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User's Posts (both public and private)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId format
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Only allow users to see their own posts (including private ones)
    if (userId !== req.userId) {
      const posts = await Post.find({ userId, isPublic: true }).sort({ createdAt: -1 });
      return res.json(posts);
    }

    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Post
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isPublic } = req.body;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    // Validate content if provided
    if (content !== undefined && !validateContent(content)) {
      return res.status(400).json({ message: 'Content must not be empty and not exceed 5000 characters' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (content !== undefined) {
      post.content = content.trim();
    }
    if (isPublic !== undefined) {
      post.isPublic = isPublic;
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Update post error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like Post
router.put('/like/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdStr = req.userId.toString();
    const index = post.likes.findIndex(like => like.toString() === userIdStr);
    
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
    console.error('Like post error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on Post
router.post('/comment/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    // Validate comment text
    if (!validateComment(text)) {
      return res.status(400).json({ message: 'Comment text must be provided and not exceed 1000 characters' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      userId: req.userId,
      username: req.username,
      text: text.trim(),
    });

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Comment post error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
