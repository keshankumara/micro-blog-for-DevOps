import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api/axios';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await api.get(`/posts/user/${user.id}`);
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user posts:', error);
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserPosts();
    }
  }, [user?.id]);

  const handleUpdatePost = (updatedPost) => {
    setPosts(posts.map(post => post._id === updatedPost._id ? updatedPost : post));
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary-blue text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-primary-blue rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{user?.username}</h1>
            <p className="text-gray-text">{user?.email}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Posts ({posts.length})</h2>

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-text text-lg">You haven't created any posts yet.</p>
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

export default Profile;
