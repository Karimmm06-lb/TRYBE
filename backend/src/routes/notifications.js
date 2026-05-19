import { Router } from 'express'
import prisma from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'
import { sendNotificationIfNeeded } from '../services/notificationService.js'

const router = Router()
router.use(authenticate)

// GET /api/notifications — liste des notifications de l'utilisateur
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query
    const where = { user_id: req.userId }
    if (type) where.type = type

    const notifications = await prisma.notification.findMany({
      where,
      include: { appelOffre: { select: { titre: true, score: true, domaine: true } } },
      orderBy: { envoyeeLe: 'desc' },
      take: 100
    })
    res.json(notifications)
  } catch (err) { next(err) }
})

// PUT /api/notifications/:id/lue — marquer comme lue
router.put('/:id/lue', async (req, res, next) => {
  try {
    const notif = await prisma.notification.findFirst({
      where: { id: Number(req.params.id), user_id: req.userId }
    })
    if (!notif) return res.status(404).json({ message: 'Notification introuvable.' })

    const updated = await prisma.notification.update({
      where: { id: notif.id },
      data: { statut: 'lu' }
    })
    res.json(updated)
  } catch (err) { next(err) }
})

// POST /api/notifications/:id/renvoyer — renvoi manuel d'une notification
router.post('/:id/renvoyer', async (req, res, next) => {
  try {
    const notif = await prisma.notification.findFirst({
      where: { id: Number(req.params.id), user_id: req.userId },
      include: {
        appelOffre: {
          include: { competences: true, profil: true }
        }
      }
    })
    if (!notif) return res.status(404).json({ message: 'Notification introuvable.' })

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' })

    // Forcer le renvoi même si notif_email_active est false
    const userForSend = { ...user, notif_email_active: true }
    await sendNotificationIfNeeded(notif.appelOffre, userForSend, notif.appelOffre.profil)

    const updated = await prisma.notification.update({
      where: { id: notif.id },
      data: { statut: 'envoye', envoyeeLe: new Date() }
    })

    res.json({ message: 'Notification renvoyée.', notification: updated })
  } catch (err) { next(err) }
})

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const notif = await prisma.notification.findFirst({
      where: { id: Number(req.params.id), user_id: req.userId }
    })
    if (!notif) return res.status(404).json({ message: 'Notification introuvable.' })

    await prisma.notification.delete({ where: { id: notif.id } })
    res.json({ message: 'Supprimé.' })
  } catch (err) { next(err) }
})

export default router
