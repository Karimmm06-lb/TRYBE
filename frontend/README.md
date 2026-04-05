# Frontend — Vue.js 3 + Tailwind CSS

## Installation
```bash
cd frontend
npm install
npm run dev
```

## Pages (mon périmètre)

| Page | Route | Description |
|---|---|---|
| Upload AO | `/appels-offres/nouveau` | Formulaire d'upload |
| Détail AO | `/appels-offres/{id}` | Résultat de l'analyse |
| Notifications | `/notifications` | Historique des alertes |

## Structuresrc/
├── pages/
│   ├── UploadAO.vue
│   ├── DetailAO.vue
│   └── Notifications.vue
├── components/
│   ├── ScoreBadge.vue
│   └── FileDropZone.vue
└── services/
└── api.js
