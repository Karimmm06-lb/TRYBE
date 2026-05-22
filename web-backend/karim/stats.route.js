/**
 * stats.route.js — Karim / Module Ingestion & Analyse
 * GET /api/karim/stats — Statistiques globales du tableau de bord
 */

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("../auth.middleware");

const prisma = new PrismaClient();

router.get("/", verifyToken, async (req, res) => {
  try {
    // Totaux
    const totalAnalyses = await prisma.appelOffre.count({
      where: { statut: { not: "EN_ATTENTE" } },
    });

    const totalAlertes = await prisma.notification.count();

    const scoreAgg = await prisma.appelOffre.aggregate({
      _avg: { score: true },
      where: { score: { not: null } },
    });
    const scoreMoyen = Math.round(scoreAgg._avg.score || 0);

    // Derniers très pertinents (score ≥ 75)
    const derniersTresPertinents = await prisma.appelOffre.findMany({
      where: { score: { gte: 75 } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, titre: true, score: true, domaine: true, createdAt: true },
    });

    // Évolution sur 8 semaines (nombre d'AO créés par semaine)
    const now = new Date();
    const evolutionHebdomadaire = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const count = await prisma.appelOffre.count({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
      });

      evolutionHebdomadaire.push({
        semaine: weekStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
        count,
      });
    }

    // Répartition par statut
    const statutGroups = await prisma.appelOffre.groupBy({
      by: ["statut"],
      _count: { id: true },
    });
    const repartitionStatut = {};
    statutGroups.forEach((g) => { repartitionStatut[g.statut] = g._count.id; });

    // Répartition par domaine (top 6)
    const domaineGroups = await prisma.appelOffre.groupBy({
      by: ["domaine"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
      where: { domaine: { not: null } },
    });
    const repartitionDomaine = domaineGroups.map((g) => ({
      domaine: g.domaine,
      count: g._count.id,
    }));

    return res.json({
      totalAnalyses,
      totalAlertes,
      scoreMoyen,
      derniersTresPertinents,
      evolutionHebdomadaire,
      repartitionStatut,
      repartitionDomaine,
    });
  } catch (err) {
    console.error("Erreur GET /api/karim/stats :", err);
    return res.status(500).json({ error: "Erreur lors de la récupération des statistiques." });
  }
});

module.exports = router;
