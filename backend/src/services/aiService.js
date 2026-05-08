import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Tu es un expert en analyse d'appels d'offres (AO) pour des entreprises de services numériques et technologiques.
Tu analyses le document fourni et tu retournes UNIQUEMENT un JSON valide avec cette structure exacte :
{
  "titre": "Titre court et précis de l'appel d'offres (max 100 caractères)",
  "domaine": "Domaine principal (ex: IT, Cloud, Sécurité, Développement, Data, Infrastructure...)",
  "resume": "Résumé factuel en 3-5 phrases : contexte, besoin, livrables attendus",
  "score": <nombre entier entre 0 et 100 représentant la pertinence globale>,
  "justification": "Explication du score : points forts, points faibles, adéquation au marché",
  "competences": ["compétence1", "compétence2", ...],
  "budget_estime": <nombre entier en euros ou null si non mentionné>,
  "date_limite": "<date ISO 8601 ou null>"
}
Réponds UNIQUEMENT avec le JSON, sans markdown, sans commentaires.`

export async function analyzeDocument(text, profil) {
  let userPrompt = `Analyse cet appel d'offres :\n\n${text}`

  if (profil) {
    userPrompt += `\n\nCritères d'évaluation du profil :\n`
    if (profil.domaines) userPrompt += `- Domaines cibles : ${profil.domaines}\n`
    if (profil.competences) userPrompt += `- Compétences recherchées : ${profil.competences}\n`
    if (profil.budgetMin) userPrompt += `- Budget minimum : ${profil.budgetMin}€\n`
    userPrompt += `\nTiens compte de ces critères pour calculer le score de pertinence.`
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('Réponse vide de l\'API IA')

    const parsed = JSON.parse(content)

    return {
      titre: String(parsed.titre ?? 'Appel d\'offres sans titre'),
      domaine: parsed.domaine ? String(parsed.domaine) : null,
      resume: parsed.resume ? String(parsed.resume) : null,
      score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : null,
      justification: parsed.justification ? String(parsed.justification) : null,
      competences: Array.isArray(parsed.competences) ? parsed.competences.map(String) : [],
      budget_estime: typeof parsed.budget_estime === 'number' ? parsed.budget_estime : null,
      date_limite: parsed.date_limite ?? null
    }
  } catch (err) {
    console.error('Erreur analyse IA:', err.message)
    return getFallbackAnalysis()
  }
}

function getFallbackAnalysis() {
  return {
    titre: 'Document analysé',
    domaine: 'Non déterminé',
    resume: 'L\'analyse automatique n\'a pas pu être effectuée. Vérifiez votre clé OpenAI.',
    score: 50,
    justification: 'Score par défaut — analyse IA indisponible.',
    competences: [],
    budget_estime: null,
    date_limite: null
  }
}
