import { Router } from 'express'
import prisma from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

// GET /api/stats — analytics dashboard pour l'utilisateur connecté
router.get('/', async (req, res, next) => {
  try {
    const userId = req.userId

    // Totaux
    const [totalAnalyses, totalAlertes, scoreAgg] = await Promise.all([
      prisma.appelOffre.count({
        where: { user_id: userId, dateAnalyse: { not: null } }
      }),
      prisma.notification.count({
        where: { user_id: userId }
      }),
      prisma.appelOffre.aggregate({
        where: { user_id: userId, score: { not: null } },
        _avg: { score: true }
      })
    ])

    // 5 derniers AO très pertinents (score >= 75)
    const derniersTresPertinents = await prisma.appelOffre.findMany({
      where: { user_id: userId, score: { gte: 75 } },
      orderBy: { dateAnalyse: 'desc' },
      take: 5,
      select: {
        id: true,
        titre: true,
        domaine: true,
        score: true,
        dateAnalyse: true,
        statut: true
      }
    })

    // Évolution hebdomadaire (8 dernières semaines)
    const now = new Date()
    const weeklyData = []

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - i * 7)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const count = await prisma.appelOffre.count({
        where: {
          user_id: userId,
          createdAt: { gte: weekStart, lt: weekEnd }
        }
      })

      weeklyData.push({
        semaine: weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        count
      })
    }

    // Répartition par statut
    const repartitionStatut = await prisma.appelOffre.groupBy({
      by: ['statut'],
      where: { user_id: userId },
      _count: { statut: true }
    })

    // Répartition par domaine (top 5)
    const repartitionDomaine = await prisma.appelOffre.groupBy({
      by: ['domaine'],
      where: { user_id: userId, domaine: { not: null } },
      _count: { domaine: true },
      orderBy: { _count: { domaine: 'desc' } },
      take: 5
    })

    res.json({
      totalAnalyses,
      totalAlertes,
      scoreMoyen: scoreAgg._avg.score ? Math.round(scoreAgg._avg.score) : null,
      derniersTresPertinents,
      evolutionHebdomadaire: weeklyData,
      repartitionStatut: repartitionStatut.map(r => ({
        statut: r.statut,
        count: r._count.statut
      })),
      repartitionDomaine: repartitionDomaine.map(r => ({
        domaine: r.domaine,
        count: r._count.domaine
      }))
    })
  } catch (err) { next(err) }
})

export default router
