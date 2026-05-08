import { Request, Response, NextFunction } from 'express';
import { candidateService } from '../services/candidate.service';
import { logger } from '../utils/logger';

export class CandidateController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const candidate = await candidateService.create(req.body);
      res.status(201).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const candidate = await candidateService.getById(req.params.id);
      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, status } = req.query;
      const result = await candidateService.getAll({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        search: search as string,
        status: status as string,
      });
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const candidate = await candidateService.update(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const candidate = await candidateService.softDelete(req.params.id);
      res.status(200).json({
        success: true,
        data: candidate,
        message: 'Candidat supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }

  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Début de la validation asynchrone', { id: req.params.id });
      const candidate = await candidateService.asyncValidate(req.params.id);
      res.status(200).json({
        success: true,
        data: candidate,
        message: 'Candidat validé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const candidateController = new CandidateController();
