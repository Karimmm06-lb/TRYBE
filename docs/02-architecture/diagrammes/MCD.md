# MCD — Modèle Conceptuel de Données
## Projet : Analyse et filtrage automatisés des appels d'offres par IA
**Entreprise :** Trybe (SARL AIVOT)

---

```mermaid
erDiagram
  User ||--o{ Notification : "recoit"
  User ||--o{ ProfilInteret : "configure"
  User ||--o{ AppelOffre : "uploade"
  AppelOffre ||--o{ Notification : "genere"
  AppelOffre ||--o{ CompetenceExtraite : "contient"
  ProfilInteret ||--o{ AppelOffre : "evalue"

  User {
    int id PK
    string email
    string password
    string role
    boolean notif_email_active
    datetime createdAt
  }

  AppelOffre {
    int id PK
    int user_id FK
    int profil_id FK
    string titre
    string domaine
    string fichierPath
    string format
    string statut
    int score
    text resume
    text justification
    int budget_estime
    date dateLimite
    string source
    datetime dateAnalyse
    datetime createdAt
  }

  CompetenceExtraite {
    int id PK
    int ao_id FK
    string competence
  }

  ProfilInteret {
    int id PK
    int user_id FK
    string nomProfil
    string domaines
    string competences
    int budgetMin
    int seuilAlerte
    int seuilTresRelevant
  }

  Notification {
    int id PK
    int ao_id FK
    int user_id FK
    string type
    string statut
    datetime envoyeeLe
  }

  SurveillanceSource {
    int id PK
    string nomPlateforme
    string url
    boolean active
    int frequenceMinutes
    datetime derniereSurveillance
    int nbAoRecuperes
    text logErreur
  }
```

---

## Relations

| Relation | Type | Description |
|----------|------|-------------|
| User → AppelOffre | 1,N | Un utilisateur peut uploader plusieurs AO |
| User → ProfilInteret | 1,N | Un utilisateur configure plusieurs profils |
| User → Notification | 1,N | Un utilisateur reçoit plusieurs notifications |
| ProfilInteret → AppelOffre | 1,N | Un profil évalue plusieurs AO |
| AppelOffre → CompetenceExtraite | 1,N | Un AO contient plusieurs compétences extraites |
| AppelOffre → Notification | 1,N | Un AO génère plusieurs notifications |

---

## Logique de scoring

| Score | Décision | Action |
|-------|----------|--------|
| ≥ 75 | Très pertinent | Notification email + tête de liste |
| 50–74 | Pertinent | Affiché sans notification |
| < 50 | Non pertinent | Archivé |
