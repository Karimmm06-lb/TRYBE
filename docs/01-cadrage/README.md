# 01 — Cadrage

## Contexte
Trybe (SARL AIVOT) souhaite automatiser la veille et l'analyse des appels d'offres (AO).
Aujourd'hui ce travail est manuel : 10 à 15 minutes par AO, risque de manquer des opportunités.

## Problématique
> Comment automatiser l'analyse des appels d'offres pour identifier rapidement les opportunités pertinentes ?

## Objectifs
- Extraire le texte de documents AO (PDF, DOCX, TXT)
- Analyser et scorer chaque AO via l'API OpenAI
- Notifier les équipes si le score dépasse le seuil configuré
- Fournir une interface web pour visualiser et gérer les AO

## Périmètre Stagiaire 1
- Pipeline d'ingestion et d'analyse
- Pages : Upload, Détail AO, Notifications
