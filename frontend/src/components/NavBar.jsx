import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-blue">
            Microblog
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/"
                  className="text-gray-text hover:text-primary-blue transition"
                >
                  Home
                </Link>
                <Link
                  to="/create"
                  className="text-gray-text hover:text-primary-green transition"
                >
                  Create Post
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-text hover:text-primary-blue transition"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-text hover:text-primary-blue transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
