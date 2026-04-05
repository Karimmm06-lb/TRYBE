# TRYBE - Analyse automatisée des appels d’offres

Projet de stage (2ème année) visant à automatiser l’analyse et le filtrage des appels d’offres à l’aide de l’intelligence artificielle.

Le système permet d’uploader un document (PDF, DOCX, TXT), d’en extraire le contenu, de l’analyser via une API d’IA, puis de générer un score de pertinence, un résumé et des recommandations.

---

## 🎯 Objectifs du projet

- Automatiser la lecture des appels d’offres
- Identifier les opportunités pertinentes
- Générer un score de pertinence (0 à 100)
- Fournir un résumé du document
- Extraire les compétences clés
- Notifier les utilisateurs en cas d’opportunité intéressante

---

## ⚙️ Fonctionnalités

- Upload de fichiers (PDF, DOCX, TXT)
- Extraction de texte à partir des documents
- Analyse via OpenAI API
- Génération de :
  - Résumé
  - Score de pertinence
  - Domaine
  - Compétences requises
  - Justification
- Stockage des résultats en base de données
- Notification email en cas de score élevé
- Interface de visualisation des appels d’offres
- Historique des notifications

---

## 🧱 Stack technique

### Backend
- Laravel (PHP)

### Frontend
- Vue.js 3
- Tailwind CSS

### Base de données
- PostgreSQL

### Intelligence Artificielle
- OpenAI API

### Traitement de documents
- PHPWord (DOCX)
- PDF Parser (PDF)
- PHP natif (TXT)

---

## 🏗️ Architecture du système

Le système fonctionne selon le pipeline suivant :

1. Upload du document
2. Stockage du fichier sur le serveur
3. Extraction du texte
4. Nettoyage du contenu
5. Analyse via OpenAI API
6. Génération du score et résumé
7. Stockage des résultats en base
8. Application de la logique métier (pertinence)
9. Envoi de notification si nécessaire

---

## 🔁 Workflow

1. L’utilisateur upload un fichier (appel d’offre)
2. Le backend valide et stocke le fichier
3. Le texte est extrait selon le format (PDF, DOCX, TXT)
4. Le contenu est envoyé à OpenAI avec des critères définis
5. Une réponse structurée est générée :
   - titre
   - domaine
   - résumé
   - score
   - compétences
   - justification
6. Les données sont enregistrées en base
7. Une notification est envoyée si le score dépasse un seuil
8. L’utilisateur peut consulter les résultats dans l’interface

---

## 🗄️ Modèle de données (simplifié)

### Table : appels_offres
- id
- fichier_path
- titre
- domaine
- resume
- score
- justification
- statut
- date_analyse

### Table : competences_extraites
- id
- ao_id
- competence

### Table : notifications
- id
- ao_id
- type
- envoyee_le

---

## 📂 Structure du projet
app/
├── Http/Controllers → gestion des requêtes
├── Models → modèles Eloquent
├── Services → logique métier (IA, extraction, notifications)

routes/
├── api.php → routes API

resources/
├── js/ → frontend Vue.js

database/
├── migrations → structure de la base de données

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repo-url>
cd trybe
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
Frontend
npm install
npm run dev
