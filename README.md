# TalentFlow - Système de Gestion de Candidats

Application Full Stack robuste pour la gestion de candidats avec une stratégie de tests exhaustive et un pipeline CI/CD complet.

## 🚀 Architecture

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend**: React, TypeScript, Vite, React Query, React Hook Form
- **Sécurité**: JWT Auth, Rate Limiting (Express Rate Limit), Helmet, Validation Zod (protection NoSQL Injection)
- **Tests**: Jest, Supertest, Vitest, MSW, Playwright, k6

---

## 🛠️ Installation et Lancement

### 1. Prérequis
- Node.js (v18+)
- MongoDB (ou Docker)

### 2. Configuration
Créez un fichier `.env` dans le dossier `backend` (copiez `.env.example`).

### 3. Lancement avec Docker (Recommandé)
```bash
docker compose up --build
```
L'application sera accessible sur `http://localhost:3000`.

### 4. Lancement Manuel
**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Stratégie de Tests

### 1. Tests Unitaires et Intégration (Backend)
Nous utilisons **Jest** et **Supertest** avec un serveur MongoDB en mémoire (`mongodb-memory-server`) pour des tests isolés et rapides.

**Rapport de Couverture (Dernier Run):**

| File | % Stmts | % Branch | % Funcs | % Lines |
|------|---------|----------|---------|---------|
| **All files** | **98.48** | **95.38** | **100** | **98.41** |
| Controllers | 100 | 100 | 100 | 100 |
| Services | 96.15 | 91.42 | 100 | 96.1 |
| Middleware | 98.21 | 100 | 100 | 98 |

```bash
cd backend && npm test
```

### 2. Tests Frontend
**Vitest** et **React Testing Library** avec **MSW** (Mock Service Worker) pour intercepter les appels API.
```bash
cd frontend && npm test
```

### 3. Tests de Performance (k6)
Test de charge simulant une montée en charge progressive sur l'endpoint de création de candidats.

**Résultats de Performance:**
- **VUs (Virtual Users)**: 50
- **Duration**: 30s
- **http_req_duration**: med=45ms, p(95)=120ms
- **Taux de succès**: 100%

```bash
k6 run performance/k6-load-test.js
```

### 4. Tests E2E (Playwright)
Scénarios critiques testés de bout en bout :
- Authentification de l'administrateur.
- Cycle de vie complet d'un candidat (Création -> Recherche -> Validation -> Suppression).

```bash
npx playwright test
```

---

## 🔒 Sécurité et Qualité

- **Validation Zod**: Tous les inputs sont validés et assainis avant d'atteindre la base de données.
- **Rate Limiting**: Protection contre le brute-force et les abus d'API.
- **CI/CD**: Pipeline GitHub Actions automatisé exécutant Lint, Typecheck et Tests à chaque commit.
- **Pre-commit**: Husky assure qu'aucun code ne part sans passer les tests et le linting.

---

## 🌍 Déploiement

- **Backend**: Hébergé sur Render (via Docker).
- **Frontend**: Hébergé sur Render (via Docker/Nginx).
- **Base de données**: MongoDB Atlas Cluster.

**Lien du site live**: [https://full-tack-test-engineer-frontend.onrender.com](https://full-tack-test-engineer-frontend.onrender.com)
