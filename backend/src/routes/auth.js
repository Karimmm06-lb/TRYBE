import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
  )
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis.' })
    if (password.length < 6) return res.status(400).json({ message: 'Mot de passe trop court (min 6 caractères).' })

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ message: 'Cet email est déjà utilisé.' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { email, password: hashed } })
    const token = signToken(user)

    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, notif_email_active: user.notif_email_active, createdAt: user.createdAt } })
  } catch (err) { next(err) }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis.' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' })

    const token = signToken(user)
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, notif_email_active: user.notif_email_active, createdAt: user.createdAt } })
  } catch (err) { next(err) }
})

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, role: true, notif_email_active: true, createdAt: true }
    })
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })
    res.json(user)
  } catch (err) { next(err) }
})

router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { notif_email_active } = req.body
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { notif_email_active },
      select: { id: true, email: true, role: true, notif_email_active: true, createdAt: true }
    })
    res.json(user)
  } catch (err) { next(err) }
})

export default router
