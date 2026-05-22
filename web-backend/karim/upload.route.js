/**
 * upload.route.js — Karim / Module Ingestion & Analyse
 * POST /api/karim/upload  — Upload + extraction + scoring IA + notification
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const verifyToken = require("../auth.middleware");
const { extractText } = require("./services/extractionService");
const { analyserAO } = require("./services/aiService");
const { envoyerAlerte } = require("./services/notificationService");

const prisma = new PrismaClient();

// ── Multer : stockage temporaire ─────────────────────────────────────────────
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mo
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Format non supporté. Seuls PDF, DOCX et TXT sont acceptés."));
    }
  },
});

// ── POST /api/karim/upload ───────────────────────────────────────────────────
router.post("/", verifyToken, upload.single("fichier"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu." });
  }

  const filePath = req.file.path;

  try {
    // 1. Extraction du texte
    const contenuBrut = await extractText(filePath, req.file.mimetype);
    if (!contenuBrut || contenuBrut.length < 50) {
      return res.status(422).json({ error: "Impossible d'extraire le texte du document (trop court ou vide)." });
    }

    // 2. Analyse IA
    const analyse = await analyserAO(contenuBrut);

    // 3. Détermination du statut selon le score
    let statut = "EN_ATTENTE";
    if (analyse.score >= 60) statut = "PERTINENT";
    else if (analyse.score >= 1) statut = "ANALYSE";

    // 4. Sauvegarde en base
    const ao = await prisma.appelOffre.create({
      data: {
        titre: analyse.titre,
        domaine: analyse.domaine,
        fichierPath: filePath,
        sourceType: "MANUEL",
        statut,
        score: analyse.score,
        resume: analyse.resume,
        justification: analyse.justification,
        competences: analyse.competences,
        budgetEstime: analyse.budgetEstime,
        duree: analyse.duree,
        dateLimite: analyse.dateLimite ? new Date(analyse.dateLimite) : null,
        dateAnalyse: new Date(),
        contenuBrut: contenuBrut.slice(0, 5000),
      },
    });

    // 5. Notification si score ≥ seuil
    const seuilAlerte = parseInt(process.env.SEUIL_ALERTE || "60");
    if (ao.score >= seuilAlerte) {
      try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user) await envoyerAlerte(ao, user);
      } catch (notifErr) {
        console.error("Erreur notification (non bloquante) :", notifErr.message);
      }
    }

    return res.status(201).json({
      message: "Appel d'offres analysé avec succès.",
      ao: {
        id: ao.id,
        titre: ao.titre,
        domaine: ao.domaine,
        score: ao.score,
        statut: ao.statut,
        resume: ao.resume,
        justification: ao.justification,
        competences: ao.competences,
        budgetEstime: ao.budgetEstime,
        duree: ao.duree,
        dateLimite: ao.dateLimite,
        dateAnalyse: ao.dateAnalyse,
      },
    });
  } catch (err) {
    console.error("Erreur upload/analyse :", err);
    return res.status(500).json({ error: err.message || "Erreur lors de l'analyse." });
  } finally {
    // Nettoyage du fichier temporaire
    try { fs.unlinkSync(filePath); } catch (_) {}
  }
});

module.exports = router;
