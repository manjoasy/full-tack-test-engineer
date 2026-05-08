import mongoose from 'mongoose';
import { Candidate, ICandidate, CandidateStatus } from '../models/candidate.model';
import { CreateCandidateInput, UpdateCandidateInput } from '../schemas/candidate.schema';
import { createAppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetAllParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export class CandidateService {
  async create(data: CreateCandidateInput): Promise<ICandidate> {
    logger.info('Création d\'un nouveau candidat', { email: data.email });

    const existingCandidate = await Candidate.findOne({
      email: data.email,
      isDeleted: false,
    });

    if (existingCandidate) {
      throw createAppError('Un candidat avec cet email existe déjà', 409);
    }

    const candidate = new Candidate(data);
    await candidate.save();

    logger.info('Candidat créé avec succès', { id: candidate._id });
    return candidate;
  }

  async getById(id: string): Promise<ICandidate> {
    logger.debug('Récupération du candidat', { id });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createAppError('Format d\'ID invalide', 400);
    }

    const candidate = await Candidate.findOne({ _id: id, isDeleted: false });

    if (!candidate) {
      throw createAppError('Candidat non trouvé', 404);
    }

    return candidate;
  }

  async getAll(params: GetAllParams): Promise<PaginatedResult<ICandidate>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    // Strict type checking for all filters
    if (typeof params.status === 'string' && Object.values(CandidateStatus).includes(params.status as CandidateStatus)) {
      query.status = params.status;
    }

    const search = typeof params.search === 'string' ? params.search : '';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Candidate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Candidate.countDocuments(query),
    ]);

    logger.debug('Liste des candidats récupérée', { total, page, limit });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: UpdateCandidateInput): Promise<ICandidate> {
    logger.info('Mise à jour du candidat', { id });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createAppError('Format d\'ID invalide', 400);
    }

    // If email is being updated, check for duplicates
    if (data.email) {
      const existingCandidate = await Candidate.findOne({
        email: data.email,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (existingCandidate) {
        throw createAppError('Un candidat avec cet email existe déjà', 409);
      }
    }

    const candidate = await Candidate.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      throw createAppError('Candidat non trouvé', 404);
    }

    logger.info('Candidat mis à jour avec succès', { id });
    return candidate;
  }

  async softDelete(id: string): Promise<ICandidate> {
    logger.info('Suppression douce du candidat', { id });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createAppError('Format d\'ID invalide', 400);
    }

    const candidate = await Candidate.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          status: CandidateStatus.DELETED,
        },
      },
      { new: true }
    );

    if (!candidate) {
      throw createAppError('Candidat non trouvé', 404);
    }

    logger.info('Candidat supprimé avec succès (soft delete)', { id });
    return candidate;
  }

  async asyncValidate(id: string): Promise<ICandidate> {
    logger.info('Validation asynchrone du candidat', { id });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createAppError('Format d\'ID invalide', 400);
    }

    const candidate = await Candidate.findOne({ _id: id, isDeleted: false });

    if (!candidate) {
      throw createAppError('Candidat non trouvé', 404);
    }

    if (candidate.status === CandidateStatus.VALIDATED) {
      throw createAppError('Le candidat est déjà validé', 400);
    }

    // Simulate async validation with 2s delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Perform validation checks
    const validationErrors: string[] = [];

    if (!candidate.email || !candidate.email.includes('@')) {
      validationErrors.push("Format d'email invalide");
    }
    if (!candidate.firstName || candidate.firstName.length < 2) {
      validationErrors.push('Le prénom est trop court');
    }
    if (!candidate.lastName || candidate.lastName.length < 2) {
      validationErrors.push('Le nom est trop court');
    }
    if (!candidate.skills || candidate.skills.length === 0) {
      validationErrors.push('Au moins une compétence est requise');
    }

    if (validationErrors.length > 0) {
      throw createAppError(
        `Erreurs de validation: ${validationErrors.join(', ')}`,
        400
      );
    }

    candidate.status = CandidateStatus.VALIDATED;
    await candidate.save();

    logger.info('Candidat validé avec succès', { id });
    return candidate;
  }
}

export const candidateService = new CandidateService();
