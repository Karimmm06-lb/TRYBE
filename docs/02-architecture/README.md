# 02 — Architecture

## Diagramme de flux

![Flux de traitement](./diagrammes/diagramme-flux.png)

### Description du flux
1. L'utilisateur upload un fichier
2. Validation du fichier
3. Si invalide → erreur de validation
4. Si valide → stockage + extraction du texte
5. Si extraction échoue → erreur d'extraction
6. Envoi du texte à OpenAI → réception réponse IA
7. Stockage en base de données
8. Comparaison du score avec le seuil
9. Si score >= seuil → notification email
10. Affichage du résultat dans l'interface
