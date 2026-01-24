import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/axios';
import CommentBox from './CommentBox';

const PostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useContext(AuthContext);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isOwner = user && user.id === post.userId;
  const hasLiked = post.likes?.includes(user?.id);

  const handleLike = async () => {
    try {
      const response = await api.put(`/posts/like/${post._id}`);
      onUpdate(response.data);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const response = await api.put(`/posts/${post._id}`, { content: editContent });
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${post._id}`);
        onDelete(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleComment = async (text) => {
    try {
      const response = await api.post(`/posts/comment/${post._id}`, { text });
      onUpdate(response.data);
    } catch (error) {
      console.error('Error commenting:', error);
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
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {!post.isPublic && (
          <span className="bg-light-blue text-primary-blue text-xs px-3 py-1 rounded-full">
            Private
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            rows="3"
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleEdit}
              className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
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
