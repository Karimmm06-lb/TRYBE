# Backend — Laravel

## Installation
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

## Variables d'environnement (.env)
## Endpoints API (mon périmètre)

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/appels-offres` | Upload et analyse d'un AO |
| GET | `/api/appels-offres/{id}` | Détail d'un AO |
| GET | `/api/notifications` | Historique des notifications |
