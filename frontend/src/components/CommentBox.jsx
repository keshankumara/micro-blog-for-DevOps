import { useState } from 'react';

const CommentBox = ({ comments, onAddComment }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
          <button
            type="submit"
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Post
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.map((comment, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-6 h-6 bg-primary-green rounded-full flex items-center justify-center text-white text-xs font-bold">
                {comment.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="font-semibold text-sm text-gray-800">
                {comment.username || 'Anonymous'}
              </span>
            </div>
            <p className="text-gray-700 ml-8">{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentBox;
