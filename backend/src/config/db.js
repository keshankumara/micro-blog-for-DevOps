import mongoose from 'mongoose'

// Use provided Atlas URI by default, but allow overriding via environment
const DEFAULT_MONGO = 'mongodb+srv://microBlog_DB:microBlog_DB@cluster0.rauitns.mongodb.net/?appName=Cluster0'
const MONGO_URI = process.env.MONGO_URI || DEFAULT_MONGO

export default async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    throw err
  }
}
