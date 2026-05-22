/**
 * notifications.route.js — Karim / Module Ingestion & Analyse
 * GET    /api/karim/notifications           — Liste des notifications de l'utilisateur
 * PUT    /api/karim/notifications/:id/lue   — Marquer comme lue
 * POST   /api/karim/notifications/:id/renvoyer — Renvoyer l'email
 * DELETE /api/karim/notifications/:id       — Supprimer
 */

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("../auth.middleware");
const { envoyerAlerte } = require("./services/notificationService");

const prisma = new PrismaClient();

// ── GET /api/karim/notifications ─────────────────────────────────────────────
router.get("/", verifyToken, async (req, res) => {
  try {
    const { type, statut } = req.query;
    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (statut) where.statut = statut;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { envoyeLe: "desc" },
      take: 100,
      include: {
        ao: {
          select: { id: true, titre: true, score: true },
        },
      },
    });

    // Adapter la réponse au format attendu par le frontend
    const result = notifications.map((n) => ({
      id: n.id,
      type: n.type.toLowerCase(), // TRES_PERTINENT → tres_pertinent
      statut: n.statut === "ENVOYE" ? "envoye" : "lu",
      envoyeeLe: n.envoyeLe,
      ao_id: n.aoId,
      appelOffre: n.ao
        ? { titre: n.ao.titre, score: n.ao.score }
        : null,
    }));

    return res.json(result);
  } catch (err) {
    console.error("Erreur GET /api/karim/notifications :", err);
    return res.status(500).json({ error: "Erreur lors de la récupération des notifications." });
  }
});

// ── PUT /api/karim/notifications/:id/lue ────────────────────────────────────
router.put("/:id/lue", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== req.user.id) {
      return res.status(404).json({ error: "Notification introuvable." });
    }
    // On utilise le champ statut : ENVOYE → LU
    await prisma.notification.update({ where: { id }, data: { statut: "LU" } });
    return res.json({ message: "Notification marquée comme lue." });
  } catch (err) {
    return res.status(500).json({ error: "Erreur." });
  }
});

// ── POST /api/karim/notifications/:id/renvoyer ──────────────────────────────
router.post("/:id/renvoyer", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const notif = await prisma.notification.findUnique({
      where: { id },
      include: { ao: true },
    });
    if (!notif || notif.userId !== req.user.id) {
      return res.status(404).json({ error: "Notification introuvable." });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    await envoyerAlerte(notif.ao, user, true); // force = true

    // Remettre le statut à ENVOYE
    await prisma.notification.update({ where: { id }, data: { statut: "ENVOYE" } });

    return res.json({ message: "Notification renvoyée." });
  } catch (err) {
    console.error("Erreur renvoi notification :", err);
    return res.status(500).json({ error: "Erreur lors du renvoi." });
  }
});

// ── DELETE /api/karim/notifications/:id ─────────────────────────────────────
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== req.user.id) {
      return res.status(404).json({ error: "Notification introuvable." });
    }
    await prisma.notification.delete({ where: { id } });
    return res.json({ message: "Notification supprimée." });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la suppression." });
  }
});

module.exports = router;
