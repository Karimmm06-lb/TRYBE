import { Router } from 'express'
import prisma from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.userId },
      include: { appelOffre: { select: { titre: true, score: true, domaine: true } } },
      orderBy: { envoyeeLe: 'desc' },
      take: 50
    })
    res.json(notifications)
  } catch (err) { next(err) }
})

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
