import { Router } from 'express'
import prisma from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { extractText, cleanText, getFormat } from '../services/extractionService.js'
import { analyzeDocument } from '../services/aiService.js'
import { sendNotificationIfNeeded } from '../services/notificationService.js'
import { generateAoPdf } from '../services/pdfExportService.js'

const router = Router()
router.use(authenticate)

// GET /api/appels-offres — liste avec filtres et recherche
router.get('/', async (req, res, next) => {
  try {
    const { score_min, score_max, domaine, statut, search } = req.query

    const where = { user_id: req.userId }

    if (score_min !== undefined) where.score = { ...where.score, gte: Number(score_min) }
    if (score_max !== undefined) where.score = { ...where.score, lte: Number(score_max) }
    if (domaine) where.domaine = { contains: domaine, mode: 'insensitive' }
    if (statut) where.statut = statut
    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { resume: { contains: search, mode: 'insensitive' } },
        { domaine: { contains: search, mode: 'insensitive' } }
      ]
    }

    const aos = await prisma.appelOffre.findMany({
      where,
      include: { competences: true, profil: { select: { nomProfil: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(aos)
  } catch (err) { next(err) }
})

// GET /api/appels-offres/:id — détail
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

// GET /api/appels-offres/:id/export — export PDF
router.get('/:id/export', async (req, res, next) => {
  try {
    const ao = await prisma.appelOffre.findFirst({
      where: { id: Number(req.params.id), user_id: req.userId },
      include: { competences: true, profil: { select: { nomProfil: true } } }
    })
    if (!ao) return res.status(404).json({ message: 'Appel d\'offres introuvable.' })

    const filename = `trybe-ao-${ao.id}-${Date.now()}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    generateAoPdf(ao, res)
  } catch (err) { next(err) }
})

// POST /api/appels-offres/upload — upload et analyse
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

    const score = analysis.score ?? null
    let statut = 'en_attente'
    if (score !== null) {
      if (score >= 75) statut = 'pertinent'
      else if (score >= 50) statut = 'pertinent'
      else statut = 'non_pertinent'
    }

    const ao = await prisma.appelOffre.create({
      data: {
        user_id: req.userId,
        profil_id: profilId,
        titre: analysis.titre,
        domaine: analysis.domaine,
        fichierPath: req.file.path,
        format,
        statut,
        score,
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

// PATCH /api/appels-offres/:id/statut — archiver / marquer comme traité
router.patch('/:id/statut', async (req, res, next) => {
  try {
    const { statut } = req.body
    const allowed = ['en_attente', 'pertinent', 'non_pertinent', 'archive', 'traite']
    if (!statut || !allowed.includes(statut)) {
      return res.status(400).json({ message: `Statut invalide. Valeurs acceptées : ${allowed.join(', ')}` })
    }

    const ao = await prisma.appelOffre.findFirst({
      where: { id: Number(req.params.id), user_id: req.userId }
    })
    if (!ao) return res.status(404).json({ message: 'Appel d\'offres introuvable.' })

    const updated = await prisma.appelOffre.update({
      where: { id: ao.id },
      data: { statut },
      include: { competences: true, profil: { select: { nomProfil: true } } }
    })
    res.json(updated)
  } catch (err) { next(err) }
})

// DELETE /api/appels-offres/:id
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
