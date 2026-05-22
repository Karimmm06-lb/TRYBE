/**
 * aiService.js — Karim / Module Ingestion & Analyse
 * Analyse un appel d'offres avec GPT-4o-mini et retourne un objet structuré.
 */

const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyse le texte brut d'un AO et retourne les champs enrichis.
 * @param {string} contenu  Texte brut extrait du document
 * @returns {Promise<{
 *   titre: string,
 *   domaine: string,
 *   resume: string,
 *   score: number,
 *   justification: string,
 *   competences: string[],
 *   budgetEstime: string|null,
 *   duree: string|null,
 *   dateLimite: string|null
 * }>}
 */
async function analyserAO(contenu) {
  const prompt = `Tu es un expert en appels d'offres IT et numériques pour des entreprises françaises.
Analyse le texte suivant et réponds UNIQUEMENT en JSON valide avec exactement ces champs :

{
  "titre": "titre court de l'AO (max 120 car.)",
  "domaine": "domaine principal (ex: Développement Web, IA, Cybersécurité, Cloud, Data…)",
  "resume": "résumé clair en 3-4 phrases pour un décideur",
  "score": <entier 0-100 représentant la pertinence pour une ESN spécialisée en dev/IA/data>,
  "justification": "explication du score en 2-3 phrases",
  "competences": ["compétence1", "compétence2", "..."],
  "budgetEstime": "montant estimé ou null si absent",
  "duree": "durée du projet ou null si absente",
  "dateLimite": "date limite au format ISO 8601 ou null si absente"
}

Texte de l'AO :
---
${contenu.slice(0, 8000)}
---`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content;
  const result = JSON.parse(raw);

  return {
    titre: String(result.titre || "Sans titre").slice(0, 120),
    domaine: String(result.domaine || "Non spécifié"),
    resume: String(result.resume || ""),
    score: Math.min(100, Math.max(0, parseInt(result.score) || 0)),
    justification: String(result.justification || ""),
    competences: Array.isArray(result.competences) ? result.competences.map(String) : [],
    budgetEstime: result.budgetEstime ? String(result.budgetEstime) : null,
    duree: result.duree ? String(result.duree) : null,
    dateLimite: result.dateLimite ? result.dateLimite : null,
  };
}

module.exports = { analyserAO };
