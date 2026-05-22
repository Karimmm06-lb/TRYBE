// mockData.js
const mockTenders = [
  {
    titre: "Développement d'une plateforme e-commerce",
    domaine: "Informatique",
    sourceUrl: "https://example.com/ao/001",
    sourceType: "AUTO",
    contenuBrut:
      "Nous recherchons un prestataire pour développer une plateforme e-commerce complète avec gestion des paiements, catalogue produits et tableau de bord administrateur.",
    competences: ["Node.js", "React", "PostgreSQL", "Stripe"],
    budgetEstime: "50000 EUR",
    duree: "6 mois",
    dateLimite: new Date("2026-07-01"),
  },
  {
    titre: "Audit de sécurité informatique",
    domaine: "Cybersécurité",
    sourceUrl: "https://example.com/ao/002",
    sourceType: "AUTO",
    contenuBrut:
      "Mission d'audit de sécurité complète incluant tests de pénétration, analyse des vulnérabilités et rapport détaillé avec recommandations.",
    competences: ["Pentest", "OWASP", "ISO 27001", "Kali Linux"],
    budgetEstime: "20000 EUR",
    duree: "2 mois",
    dateLimite: new Date("2026-06-15"),
  },
  {
    titre: "Mise en place d'une solution CRM",
    domaine: "Gestion d'entreprise",
    sourceUrl: "https://example.com/ao/003",
    sourceType: "AUTO",
    contenuBrut:
      "Déploiement et personnalisation d'une solution CRM pour une équipe commerciale de 50 personnes, intégration avec les outils existants.",
    competences: ["Salesforce", "CRM", "Intégration API", "Formation"],
    budgetEstime: "35000 EUR",
    duree: "4 mois",
    dateLimite: new Date("2026-08-01"),
  },
  {
    titre: "Développement d'une application mobile",
    domaine: "Mobile",
    sourceUrl: "https://example.com/ao/004",
    sourceType: "AUTO",
    contenuBrut:
      "Création d'une application mobile iOS et Android pour la gestion des interventions terrain avec géolocalisation et synchronisation hors-ligne.",
    competences: ["React Native", "iOS", "Android", "API REST"],
    budgetEstime: "70000 EUR",
    duree: "8 mois",
    dateLimite: new Date("2026-09-01"),
  },
  {
    titre: "Formation en intelligence artificielle",
    domaine: "Formation",
    sourceUrl: "https://example.com/ao/005",
    sourceType: "AUTO",
    contenuBrut:
      "Programme de formation en IA et machine learning pour 30 développeurs, incluant ateliers pratiques et certification.",
    competences: ["Python", "Machine Learning", "TensorFlow", "Data Science"],
    budgetEstime: "15000 EUR",
    duree: "3 mois",
    dateLimite: new Date("2026-06-30"),
  },
];

module.exports = mockTenders;