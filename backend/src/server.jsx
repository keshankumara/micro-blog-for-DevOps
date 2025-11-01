import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.jsx'
import postRoutes from './routes/postRoutes.jsx'
import userRoutes from './routes/userRoutes.jsx'
import { errorHandler } from './middlewares/errorHandler.jsx'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// connect to DB
connectDB().catch((err) => {
	console.error('DB connection error', err)
	process.exit(1)
})

// middlewares
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev'))

app.use(
	cors({
		origin: process.env.FRONTEND_URL || 'http://localhost:5173',
		credentials: true,
	}),
)

// basic rate limiter
const limiter = rateLimit({ windowMs: 60_000, max: 120 })
app.use(limiter)

// routes
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)

// error handler
app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
