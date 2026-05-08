import { Router } from 'express'
import prisma from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { extractText, cleanText, getFormat } from '../services/extractionService.js'
import { analyzeDocument } from '../services/aiService.js'
import { sendNotificationIfNeeded } from '../services/notificationService.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const aos = await prisma.appelOffre.findMany({
      where: { user_id: req.userId },
      include: { competences: true, profil: { select: { nomProfil: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(aos)
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const ao = await prisma.appelOffre.findFirst({
      where: { id: Number(req.params.id), user_id: req.userId },
      include: { competences: true, profil: { select: { nomProfil: true } } }
    })
    if (!ao) return res.status(404).json({ message: 'Appel d\'offres introuvable.' })
    res.json(ao)
  } catch (err) { next(err) }
})

router.post('/upload', upload.single('file'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: 'Fichier requis.' })

  try {
    const profilId = req.body.profil_id ? Number(req.body.profil_id) : null
    let profil = null
    if (profilId) {
      profil = await prisma.profilInteret.findFirst({ where: { id: profilId, user_id: req.userId } })
    }

    const rawText = await extractText(req.file.path)
    const cleanedText = cleanText(rawText)
    const format = getFormat(req.file.path)

    const analysis = await analyzeDocument(cleanedText, profil)

    const dateLimite = analysis.date_limite ? new Date(analysis.date_limite) : null

    const ao = await prisma.appelOffre.create({
      data: {
        user_id: req.userId,
        profil_id: profilId,
        titre: analysis.titre,
        domaine: analysis.domaine,
        fichierPath: req.file.path,
        format,
        statut: analysis.score !== null ? (analysis.score >= 60 ? 'pertinent' : analysis.score >= 0 ? 'non_pertinent' : 'analyse') : 'analyse',
        score: analysis.score,
        resume: analysis.resume,
        justification: analysis.justification,
        budget_estime: analysis.budget_estime,
        dateLimite: dateLimite && !isNaN(dateLimite.getTime()) ? dateLimite : null,
        source: 'manuel',
        dateAnalyse: new Date(),
        competences: {
          create: analysis.competences.slice(0, 20).map(c => ({ competence: c }))
        }
      },
      include: { competences: true, profil: { select: { nomProfil: true } } }
    })

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (user) await sendNotificationIfNeeded(ao, user, profil)

    res.status(201).json(ao)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const ao = await prisma.appelOffre.findFirst({ where: { id: Number(req.params.id), user_id: req.userId } })
    if (!ao) return res.status(404).json({ message: 'Introuvable.' })

    await prisma.competenceExtraite.deleteMany({ where: { ao_id: ao.id } })
    await prisma.notification.deleteMany({ where: { ao_id: ao.id } })
    await prisma.appelOffre.delete({ where: { id: ao.id } })

    res.json({ message: 'Supprimé.' })
  } catch (err) { next(err) }
})

export default router
