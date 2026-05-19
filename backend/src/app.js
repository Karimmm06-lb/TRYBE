import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRoutes from './routes/auth.js'
import appelOffresRoutes from './routes/appelOffres.js'
import profilsRoutes from './routes/profils.js'
import notificationsRoutes from './routes/notifications.js'
import statsRoutes from './routes/stats.js'

const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/appels-offres', appelOffresRoutes)
app.use('/api/profils', profilsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/stats', statsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  const status = err.status ?? 500
  res.status(status).json({ message: err.message ?? 'Erreur serveur' })
})

export default app
