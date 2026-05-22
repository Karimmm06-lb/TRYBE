/**
 * ao.route.js — Karim / Module Ingestion & Analyse
 * GET  /api/karim/ao          — Liste filtrée des AO
 * GET  /api/karim/ao/:id      — Détail d'un AO
 * PATCH /api/karim/ao/:id/statut — Mise à jour du statut
 * GET  /api/karim/ao/:id/export  — Export PDF
 */

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("../auth.middleware");
const { generateAoPdf } = require("./services/pdfExportService");

const prisma = new PrismaClient();

const STATUTS_VALIDES = ["EN_ATTENTE", "ANALYSE", "PERTINENT", "ARCHIVE"];

// ── GET /api/karim/ao ────────────────────────────────────────────────────────
router.get("/", verifyToken, async (req, res) => {
  try {
    const { score_min, score_max, domaine, statut, search, page = "1", limit = "20" } = req.query;

    const where = {};
    if (score_min !== undefined) where.score = { ...where.score, gte: parseInt(score_min) };
    if (score_max !== undefined) where.score = { ...where.score, lte: parseInt(score_max) };
    if (domaine) where.domaine = { contains: domaine, mode: "insensitive" };
    if (statut && STATUTS_VALIDES.includes(statut)) where.statut = statut;
    if (search) where.titre = { contains: search, mode: "insensitive" };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [total, items] = await Promise.all([
      prisma.appelOffre.count({ where }),
      prisma.appelOffre.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
        select: {
          id: true, titre: true, domaine: true, statut: true, score: true,
          sourceType: true, dateLimite: true, createdAt: true, budgetEstime: true,
          competences: true,
        },
      }),
    ]);

    return res.json({ total, page: parseInt(page), limit: parseInt(limit), items });
  } catch (err) {
    console.error("Erreur GET /api/karim/ao :", err);
    return res.status(500).json({ error: "Erreur lors de la récupération des AO." });
  }
});

// ── GET /api/karim/ao/:id ────────────────────────────────────────────────────
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ao = await prisma.appelOffre.findUnique({ where: { id } });
    if (!ao) return res.status(404).json({ error: "AO introuvable." });
    return res.json(ao);
  } catch (err) {
    return res.status(500).json({ error: "Erreur." });
  }
});

// ── PATCH /api/karim/ao/:id/statut ──────────────────────────────────────────
router.patch("/:id/statut", verifyToken, async (req, res) => {
  const { statut } = req.body;
  if (!statut || !STATUTS_VALIDES.includes(statut)) {
    return res.status(400).json({
      error: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(", ")}`,
    });
  }

  try {
    const id = parseInt(req.params.id);
    const ao = await prisma.appelOffre.update({
      where: { id },
      data: { statut },
    });
    return res.json({ message: "Statut mis à jour.", ao });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "AO introuvable." });
    return res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
});

// ── GET /api/karim/ao/:id/export ─────────────────────────────────────────────
router.get("/:id/export", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ao = await prisma.appelOffre.findUnique({ where: { id } });
    if (!ao) return res.status(404).json({ error: "AO introuvable." });

    const filename = `AO_${ao.id}_${ao.titre.slice(0, 40).replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await generateAoPdf(ao, res);
  } catch (err) {
    console.error("Erreur export PDF :", err);
    if (!res.headersSent) res.status(500).json({ error: "Erreur lors de la génération du PDF." });
  }
});

module.exports = router;
