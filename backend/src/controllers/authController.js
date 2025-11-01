import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const TOKEN_NAME = 'token'

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already in use' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed })
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.cookie(TOKEN_NAME, token, { httpOnly: true, sameSite: 'lax' })
    return res.status(201).json({ id: user._id, name: user.name, email: user.email })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.cookie(TOKEN_NAME, token, { httpOnly: true, sameSite: 'lax' })
    return res.json({ id: user._id, name: user.name, email: user.email })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res) {
  res.clearCookie(TOKEN_NAME)
  res.json({ ok: true })
}

export async function me(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    next(err)
  }
}
