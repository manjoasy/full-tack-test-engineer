# TalentFlow - Système de Gestion de Candidats

Application Full Stack robuste pour la gestion de candidats avec une stratégie de tests exhaustive.

## Architecture

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend**: React, TypeScript, Vite, React Query, React Hook Form
- **Sécurité**: JWT Auth, Rate Limiting, Helmet, Validation Zod (NoSQL Injection safe)
- **Tests**: Jest, Supertest, Vitest, MSW, Playwright, k6

## Installation et Lancement

### Avec Docker (Recommandé)

```bash
docker compose up --build
```

L'application sera accessible sur `http://localhost:3000`.

### Installation Manuelle

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Stratégie de Tests

### 1. Tests Unitaires (100% Coverage Target)

- **Backend**: Services et modèles testés avec Jest.
- **Frontend**: Hooks et utilitaires testés avec Vitest.

```bash
# Backend
cd backend && npm test
# Frontend
cd frontend && npm test
```

### 2. Tests d'Intégration

- **Backend**: API endpoints testés avec Supertest et une base de données en mémoire (`mongodb-memory-server`).
- **Frontend**: Mock Service Worker (MSW) pour simuler l'API.

### 3. Tests E2E

- Playwright pour le scénario complet: Connexion -> Création -> Validation -> Suppression.

```bash
npx playwright test
```

### 4. Tests de Performance

- k6 simulant 500 requêtes simultanées sur la création de candidats.

```bash
k6 run performance/k6-load-test.js
```

### 5. Tests de Sécurité

- Scripts dédiés pour tester les injections NoSQL et le brute-force sur l'authentification.

## CI/CD

- **Husky**: Pre-commit hooks pour le Lint, Type-checking et tests unitaires.
- **GitHub Actions**: Pipeline automatisé exécutant tous les tests et vérifiant la couverture (>90%).

## Qualité du Code

- TypeScript strict.
- ESLint + Prettier.
- Logs structurés avec Winston.

---

**Note**: Pour exécuter les tests dans cet environnement, veuillez vous assurer que le répertoire du projet est ajouté aux espaces de travail (workspaces) autorisés.
