# Microblog Backend

Node.js + Express + MongoDB backend for the Microblog platform.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

The server will run on http://localhost:5000

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
MONGO_URL=mongodb://localhost:27017/microblog
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **nodemon** - Development server with hot reload

## 🏗 Project Structure

```
backend/
├── models/              # Mongoose models
│   ├── User.js         # User model
│   └── Post.js         # Post model
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   └── posts.js        # Post CRUD routes
├── middleware/         # Custom middleware
│   └── auth.js         # JWT authentication middleware
├── index.js            # Server entry point
├── .env                # Environment variables
└── package.json        # Dependencies
```

## 🗄 Database Models

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  timestamps: true
}
```

### Post Model
```javascript
{
  userId: String,
  username: String,
  content: String,
  isPublic: Boolean,
  likes: [String],
  comments: [{
    userId: String,
    username: String,
    text: String,
    createdAt: Date
  }],
  timestamps: true
}
```

## 🛣 API Routes

### Authentication (`/auth`)

#### Register
```
POST /auth/register
Body: { username, email, password }
Response: { token, user }
```

#### Login
```
POST /auth/login
Body: { email, password }
Response: { token, user }
```

### Posts (`/posts`) - All routes require authentication

#### Create Post
```
POST /posts/create
Headers: { Authorization: "Bearer <token>" }
Body: { content, isPublic }
Response: Post object
```

#### Get All Public Posts
```
GET /posts
Headers: { Authorization: "Bearer <token>" }
Response: Array of posts
```

#### Get User Posts
```
GET /posts/user/:userId
Headers: { Authorization: "Bearer <token>" }
Response: Array of user's posts
```

#### Update Post
```
PUT /posts/:id
Headers: { Authorization: "Bearer <token>" }
Body: { content, isPublic }
Response: Updated post
```

#### Delete Post
```
DELETE /posts/:id
Headers: { Authorization: "Bearer <token>" }
Response: Success message
```

#### Like/Unlike Post
```
PUT /posts/like/:id
Headers: { Authorization: "Bearer <token>" }
Response: Updated post with likes
```

#### Add Comment
```
POST /posts/comment/:id
Headers: { Authorization: "Bearer <token>" }
Body: { text }
Response: Updated post with comments
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## 🧪 Testing

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL commands

Example cURL:
```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'

# Create Post
curl -X POST http://localhost:5000/posts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"My first post!","isPublic":true}'
```

## 🗄 MongoDB Setup

### Local MongoDB

Make sure MongoDB is installed and running:

```bash
# Windows
net start MongoDB

# Or run mongod directly
mongod
```

### MongoDB Atlas (Cloud)

1. Create account at mongodb.com/atlas
2. Create a new cluster
3. Get connection string
4. Update MONGO_URL in .env

```env
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/microblog?retryWrites=true&w=majority
```

## 📝 Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token expiration (7 days)
- Protected routes with middleware
- CORS enabled for frontend communication
- Input validation

## 🐛 Common Issues

**MongoDB Connection Failed:**
- Check if MongoDB is running
- Verify MONGO_URL in .env
- Check network connectivity for MongoDB Atlas

**JWT Token Invalid:**
- Token might be expired (7 days expiration)
- JWT_SECRET mismatch
- Token format incorrect (should be "Bearer <token>")

**CORS Error:**
- Verify CORS configuration in index.js
- Check if frontend URL is allowed

## 🚀 Deployment

### Environment Variables for Production

```env
MONGO_URL=<your_production_mongodb_url>
JWT_SECRET=<strong_random_secret>
PORT=5000
```

### Deployment Platforms

- **Heroku**
- **Railway**
- **AWS EC2**
- **DigitalOcean**
- **Render**

Remember to:
1. Set environment variables on the platform
2. Update CORS to allow production frontend URL
3. Use a strong JWT_SECRET
4. Use MongoDB Atlas for cloud database
