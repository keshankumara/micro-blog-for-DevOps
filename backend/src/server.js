import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import postRoutes from './routes/postRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { errorHandler } from './middlewares/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

async function start() {
  try {
    await connectDB()

    app.use(helmet())
    app.use(express.json())
    app.use(cookieParser())
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev'))

    const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'
    app.use(
      cors({
        origin: frontendOrigin,
        credentials: true,
      }),
    )

    // lightweight health endpoint for container healthchecks
    app.get('/health', (_req, res) => res.json({ ok: true }))

    console.log(`Configured CORS origin: ${frontendOrigin}`)

    // basic rate limiter
    const limiter = rateLimit({ windowMs: 60_000, max: 120 })
    app.use(limiter)

    // routes
    app.use('/api/auth', authRoutes)
    app.use('/api/posts', postRoutes)
    app.use('/api/users', userRoutes)

    // error handler (last)
    app.use(errorHandler)

  // bind to 0.0.0.0 so Docker containers are reachable from the host
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on 0.0.0.0:${PORT}`))
  } catch (err) {
    console.error('Failed to start server', err)
    process.exit(1)
  }
}

start()
