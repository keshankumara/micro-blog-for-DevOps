import { useState, useEffect } from 'react';
import { api } from '../api/axios';
import PostCard from '../components/PostCard';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadPosts = async () => {
      try {
        const response = await api.get('/posts');
        if (!isActive) return;
        setPosts(response.data);
      } catch (error) {
        if (!isActive) return;
        console.error('Error fetching posts:', error);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadPosts();

    return () => {
      isActive = false;
    };
  }, []);

  const handleUpdatePost = (updatedPost) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-blue text-xl">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Public Feed</h1>

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-text text-lg">No posts yet. Be the first to create one!!!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
          />
        ))
      )}
    </div>
  );
};

export default Home;
