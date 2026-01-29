import { useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/axios';
import CommentBox from './CommentBox';

const PostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || '');
  const [error, setError] = useState(null);

  // Validate post object
  if (!post || !post._id) {
    return null;
  }

  const isOwner = user && user.id === post.userId;
  const hasLiked = post.likes?.some(likeId => likeId === user?.id);

  const handleLike = useCallback(async () => {
    try {
      setError(null);
      const response = await api.put(`/posts/like/${post._id}`);
      if (response.data && onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setError('Failed to like post');
    }
  }, [post._id, onUpdate]);

  const handleEdit = useCallback(async () => {
    if (!editContent.trim()) {
      setError('Content cannot be empty');
      return;
    }

    try {
      setError(null);
      const response = await api.put(`/posts/${post._id}`, { content: editContent.trim() });
      if (response.data && onUpdate) {
        onUpdate(response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError(error.response?.data?.message || 'Failed to update post');
    }
  }, [post._id, editContent, onUpdate]);

  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setError(null);
        await api.delete(`/posts/${post._id}`);
        if (onDelete) {
          onDelete(post._id);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        setError(error.response?.data?.message || 'Failed to delete post');
      }
    }
  }, [post._id, onDelete]);

  const handleComment = useCallback(async (text) => {
    if (!text || !text.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setError(null);
      const response = await api.post(`/posts/comment/${post._id}`, { text: text.trim() });
      if (response.data && onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error commenting:', error);
      setError(error.response?.data?.message || 'Failed to add comment');
    }
  }, [post._id, onUpdate]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Date unavailable';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center text-white font-bold">
            {post.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{post.username || 'Anonymous'}</h3>
            <p className="text-sm text-gray-text">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        {!post.isPublic && (
          <span className="bg-light-blue text-primary-blue text-xs px-3 py-1 rounded-full">
            Private
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            rows="3"
            maxLength="5000"
          />
          <div className="text-sm text-gray-text mt-1">
            {editContent.length} / 5000
          </div>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleEdit}
              className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
                setError(null);
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 mb-4 whitespace-pre-wrap break-words">{post.content}</p>
      )}

      <div className="flex items-center space-x-6 border-t border-gray-200 pt-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 ${
            hasLiked ? 'text-red-500' : 'text-gray-text'
          } hover:text-red-500 transition`}
        >
          <span className="text-xl">❤️</span>
          <span>{post.likes?.length || 0} Likes</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-text hover:text-primary-blue transition"
        >
          <span className="text-xl">💬</span>
          <span>{post.comments?.length || 0} Comments</span>
        </button>

        {isOwner && (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-text hover:text-primary-green transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-text hover:text-red-500 transition"
            >
              Delete
            </button>
          </>
        )}
      </div>

      {showComments && (
        <CommentBox
          comments={post.comments || []}
          onAddComment={handleComment}
        />
      )}
    </div>
  );
};

export default PostCard;
