# Tezos Adaptive Issuance Dashboard

Un tableau de bord interactif pour visualiser l'historique de l'émission adaptative et du staking de Tezos.

## Fonctionnalités

- Visualisation de l'historique de l'émission (issuance) depuis la genèse
- Visualisation de l'historique du staking depuis la genèse
- Marqueurs pour les mises à jour importantes (Hangzhou, Paris, Quebec)
- Interface responsive avec Bootstrap
- Intégration avec l'API TzKT

## Technologies utilisées

- Next.js 14
- TypeScript
- Highcharts
- Bootstrap
- TzKT API

## Installation

```bash
# Cloner le dépôt
git clone [URL_DU_REPO]

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

## Structure du projet

```
src/
  ├── app/
  │   ├── components/
  │   │   └── HistoricalChart.tsx
  │   ├── services/
  │   │   └── tzkt-api.ts
  │   ├── globals.css
  │   ├── layout.tsx
  │   └── page.tsx
  └── ...
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
