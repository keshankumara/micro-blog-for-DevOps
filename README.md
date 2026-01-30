# 🚀 Microblog Web Application

A full-stack microblog platform where users can register, login, create posts (public/private), like posts, comment on posts, and interact with other users. Built with modern web technologies and designed with a beautiful blue and green theme.

## 📌 Features

- ✅ User Authentication (Register/Login with JWT)
- ✅ Create, Edit, Delete Posts
- ✅ Public/Private Post Toggle
- ✅ Like System
- ✅ Comment System
- ✅ User Profile
- ✅ Responsive Design
- ✅ Modern UI with Blue & Green Theme

## 🛠 Tech Stack

### Frontend
- React 19
- Vite
- React Router v6
- Axios
- Tailwind CSS
- Context API (State Management)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for Password Hashing

## 🎨 Color Palette

```
Primary Blue:  #2563EB  
Primary Green: #16A34A  
Light Blue:    #DBEAFE  
Light Green:   #DCFCE7  
White:         #FFFFFF  
Gray Text:     #6B7280  
Background:    #F9FAFB  
```

## 📁 Project Structure

```
micro-blog-for-DevOps/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── api/          # Axios configuration
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── backend/              # Node.js + Express backend
    ├── models/          # MongoDB models
    ├── routes/          # API routes
    ├── middleware/      # Auth middleware
    ├── index.js         # Server entry point
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB installed and running locally
- npm or yarn package manager

### Installation

#### 1. Clone the repository

```bash
cd c:\Users\Keshan\Desktop\micro-blog-for-DevOps
```

#### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory (already created):
```env
MONGO_URL=mongodb://54.173.187.235:27017/microblog
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
```

Start MongoDB (if not running):
```bash
# Windows
mongod

# Or if MongoDB is installed as a service
net start MongoDB
```

Run the backend server:
```bash
npm run dev
```

The backend will run on http://54.173.187.235:5000

#### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Run the frontend:
```bash
npm run dev
```

The frontend will run on http://54.173.187.235:3000

## 📖 API Endpoints

### Auth Routes
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Post Routes (Protected)
- `POST /posts/create` - Create new post
- `GET /posts` - Get all public posts
- `GET /posts/user/:userId` - Get user's posts
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `PUT /posts/like/:id` - Like/Unlike post
- `POST /posts/comment/:id` - Add comment to post

## 🎯 Usage

1. **Register** - Create a new account
2. **Login** - Sign in with your credentials
3. **Create Post** - Share your thoughts (public or private)
4. **Interact** - Like and comment on posts
5. **Profile** - View and manage your posts

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Input validation

## 🌟 UI Features

- Clean and modern design
- Responsive layout
- Card-based post display
- Smooth transitions
- User-friendly forms
- Real-time interactions

## 📝 Notes

- Make sure MongoDB is running before starting the backend
- The backend runs on port 5000 and frontend on port 3000
- Change the JWT_SECRET in production
- Posts can be toggled between public and private
- Only post owners can edit/delete their posts

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is installed and running
- Check if the port 27017 is available
- Verify the MONGO_URL in .env file

**Port Already in Use:**
- Change the PORT in backend/.env
- Change the port in frontend/vite.config.js
- Update the API baseURL in frontend/src/api/axios.js

**CORS Issues:**
- Verify the CORS configuration in backend/index.js
- Ensure the frontend URL is correct

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Quick Docker Deployment

```bash
# Set environment variables
export MONGO_URL="your-mongodb-connection-string"
export JWT_SECRET="your-jwt-secret"

# Start the application with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://54.173.187.235
# Backend: http://54.173.187.235:5000
```

## 📚 Future Enhancements

- User avatars
- Search functionality
- Pagination for posts
- Dark mode
- Notifications
- Follow/Unfollow system
- Direct messaging
- Post images
- Rich text editor

## 👨‍💻 Author

 -- Keshan Kumara --
Built with ❤️ for learning Full-Stack Development and DevOps 

---

**Happy Coding! 🎉**
