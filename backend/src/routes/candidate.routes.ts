import { Router } from 'express';
import { candidateController } from '../controllers/candidate.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCandidateSchema, updateCandidateSchema } from '../schemas/candidate.schema';

const router = Router();

// All candidate routes require authentication
router.use(authMiddleware);

// GET /api/candidates — List all candidates with pagination & filters
router.get('/', (req, res, next) => candidateController.getAll(req, res, next));

// POST /api/candidates — Create a new candidate
router.post(
  '/',
  validate(createCandidateSchema),
  (req, res, next) => candidateController.create(req, res, next)
);

// GET /api/candidates/:id — Get a candidate by ID
router.get('/:id', (req, res, next) => candidateController.getById(req, res, next));

// PUT /api/candidates/:id — Update a candidate (partial)
router.put(
  '/:id',
  validate(updateCandidateSchema),
  (req, res, next) => candidateController.update(req, res, next)
);

// DELETE /api/candidates/:id — Soft delete a candidate
router.delete('/:id', (req, res, next) => candidateController.delete(req, res, next));

// POST /api/candidates/:id/validate — Async validation (2s delay)
router.post('/:id/validate', (req, res, next) => candidateController.validate(req, res, next));

export default router;
