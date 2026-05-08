import { Router } from 'express'
import prisma from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const profils = await prisma.profilInteret.findMany({
      where: { user_id: req.userId },
      orderBy: { id: 'asc' }
    })
    res.json(profils)
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { nomProfil, domaines, competences, budgetMin, seuilAlerte, seuilTresRelevant } = req.body
    if (!nomProfil) return res.status(400).json({ message: 'Nom du profil requis.' })
    const profil = await prisma.profilInteret.create({
      data: { user_id: req.userId, nomProfil, domaines, competences, budgetMin, seuilAlerte: seuilAlerte ?? 50, seuilTresRelevant: seuilTresRelevant ?? 75 }
    })
    res.status(201).json(profil)
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.profilInteret.findFirst({ where: { id: Number(req.params.id), user_id: req.userId } })
    if (!existing) return res.status(404).json({ message: 'Profil introuvable.' })
    const { nomProfil, domaines, competences, budgetMin, seuilAlerte, seuilTresRelevant } = req.body
    const updated = await prisma.profilInteret.update({
      where: { id: existing.id },
      data: { nomProfil, domaines, competences, budgetMin, seuilAlerte, seuilTresRelevant }
    })
    res.json(updated)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.profilInteret.findFirst({ where: { id: Number(req.params.id), user_id: req.userId } })
    if (!existing) return res.status(404).json({ message: 'Profil introuvable.' })
    await prisma.profilInteret.delete({ where: { id: existing.id } })
    res.json({ message: 'Supprimé.' })
  } catch (err) { next(err) }
})

export default router
