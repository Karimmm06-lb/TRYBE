const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const axios = require("axios"); 
const mockTenders = require("./mockData");

const prisma = new PrismaClient();

const AI_SERVICE_URL = "http://localhost:3000/score";


router.post("/get-tenders", async (req, res) => {
  const results = [];
  const errors = [];

  for (const tender of mockTenders) {
    try {
      const aiResponse = await axios.post(AI_SERVICE_URL, {
        titre: tender.titre,
        domaine: tender.domaine,
        contenuBrut: tender.contenuBrut,
        competences: tender.competences,
        budgetEstime: tender.budgetEstime,
        duree: tender.duree,
      });

      const { ai_score, verdict } = aiResponse.data;
      
      const savedAO = await prisma.appelOffre.create({
        data: {
          titre: tender.titre,
          domaine: tender.domaine ?? null,
          fichierPath: tender.fichierPath ?? null,
          sourceUrl: tender.sourceUrl ?? null,
          sourceType: tender.sourceType ?? "AUTO",
          statut: "EN_ATTENTE",
          score: ai_score,
          justification: verdict,
          competences: tender.competences ?? [],
          budgetEstime: tender.budgetEstime ?? null,
          duree: tender.duree ?? null,
          dateLimite: tender.dateLimite ?? null,
          contenuBrut: tender.contenuBrut ?? null,
          dateAnalyse: new Date(),
        },
      });

      results.push({
        id: savedAO.id,
        titre: savedAO.titre,
        score: savedAO.score,
        verdict,
        statut: savedAO.statut,
      });
    } catch (err) {
      errors.push({
        titre: tender.titre,
        error: err?.response?.data?.message ?? err.message,
      });
    }
  }

  return res.status(200).json({
    status: "done",
    processed: results.length,
    failed: errors.length,
    results,
    ...(errors.length > 0 && { errors }),
  });
});


router.get("/tenders", async (req, res) => {
  try {
    
    const appelsOffres = await prisma.appelOffre.findMany({
      orderBy: { createdAt: 'desc' } // Les plus récentes en premier
    });

    
    let totalScore = 0;
    let countWithScore = 0;
    appelsOffres.forEach(ao => {
        if(ao.score) {
            totalScore += ao.score;
            countWithScore++;
        }
    });
    const scoreMoyen = countWithScore > 0 ? Math.round(totalScore / countWithScore) : 0;

  
    return res.status(200).json({
      user: { initials: 'JD', name: 'Jean Dupont', email: 'jean.dupont@trybe.com' },
      stats: {
        totalAO: appelsOffres.length,
        aoSauvegardes: 0,
        scoreMoyen: scoreMoyen
      },
      
      appelsOffres: appelsOffres.map(ao => ({
          id: ao.id,
          titre: ao.titre,
          domaine: ao.domaine || "Non spécifié",
          date: ao.createdAt.toISOString().split('T')[0],
          source: ao.sourceType === 'AUTO' ? "Récupération Auto" : "Manuel",
          score: ao.score || 0,
          statut: ao.statut,
          description: ao.contenuBrut || ao.resume || "Aucune description"
      }))
    });

  } catch (err) {
    console.error("Erreur GET /tenders:", err);
    res.status(500).json({ error: "Erreur lors de la récupération des données" });
  }
});

module.exports = router;