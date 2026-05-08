import { CandidateService } from '../../services/candidate.service';
import { Candidate, CandidateStatus } from '../../models/candidate.model';
import mongoose from 'mongoose';

// Mock the Candidate model correctly
jest.mock('../../models/candidate.model', () => {
  const actual = jest.requireActual('../../models/candidate.model');
  return {
    ...actual,
    Candidate: jest.fn().mockImplementation(() => ({
      save: jest.fn(),
    })),
  };
});

// Assign mocks to static methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Candidate.findOne as any) = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Candidate.find as any) = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Candidate.findOneAndUpdate as any) = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Candidate.countDocuments as any) = jest.fn();

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CandidateService', () => {
  let service: CandidateService;

  const mockCandidate = {
    _id: new mongoose.Types.ObjectId(),
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33612345678',
    position: 'Développeur Full Stack',
    experience: 5,
    skills: ['TypeScript', 'React', 'Node.js'],
    status: CandidateStatus.DRAFT,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  beforeEach(() => {
    service = new CandidateService();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('create', () => {
    it('should create a candidate successfully', async () => {
      (Candidate.findOne as jest.Mock).mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue(mockCandidate);
      (Candidate as unknown as jest.Mock).mockImplementation(() => ({
        ...mockCandidate,
        save: saveMock,
      }));

      const result = await service.create({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33612345678',
        position: 'Développeur Full Stack',
        experience: 5,
        skills: ['TypeScript'],
      });

      expect(result).toBeDefined();
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw 409 if email exists', async () => {
      (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(service.create(mockCandidate as any)).rejects.toThrow('Un candidat avec cet email existe déjà');
    });
  });

  describe('getById', () => {
    it('should return candidate', async () => {
      (Candidate.findOne as jest.Mock).mockResolvedValue(mockCandidate);
      const result = await service.getById(mockCandidate._id.toString());
      expect(result.email).toBe(mockCandidate.email);
    });

    it('should throw 404 if not found', async () => {
      (Candidate.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.getById(new mongoose.Types.ObjectId().toString())).rejects.toThrow('Candidat non trouvé');
    });
  });

  describe('getAll', () => {
    it('should return paginated candidates', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockCandidate]),
      };
      (Candidate.find as jest.Mock).mockReturnValue(mockQuery);
      (Candidate.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await service.getAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should handle filters and search', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      (Candidate.find as jest.Mock).mockReturnValue(mockQuery);
      (Candidate.countDocuments as jest.Mock).mockResolvedValue(0);

      await service.getAll({ status: CandidateStatus.DRAFT, search: 'test' });
      expect(Candidate.find).toHaveBeenCalled();
    });

    it('should clamp page and limit values', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      (Candidate.find as jest.Mock).mockReturnValue(mockQuery);
      (Candidate.countDocuments as jest.Mock).mockResolvedValue(0);

      const result = await service.getAll({ page: -1, limit: 500 });
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(100);
    });
  });

  describe('update', () => {
    it('should update successfully', async () => {
      (Candidate.findOne as jest.Mock).mockResolvedValue(null);
      (Candidate.findOneAndUpdate as jest.Mock).mockResolvedValue(mockCandidate);
      const result = await service.update(mockCandidate._id.toString(), { firstName: 'New' });
      expect(result).toBeDefined();
    });

    it('should throw 404 if not found', async () => {
      (Candidate.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      await expect(service.update(mockCandidate._id.toString(), { firstName: 'New' })).rejects.toThrow('Candidat non trouvé');
    });

    it('should throw 409 if email taken', async () => {
      (Candidate.findOne as jest.Mock).mockResolvedValue({ _id: 'other' });
      await expect(service.update(mockCandidate._id.toString(), { email: 'taken@test.com' })).rejects.toThrow('Un candidat avec cet email existe déjà');
    });
  });

  describe('softDelete', () => {
    it('should delete successfully', async () => {
      (Candidate.findOneAndUpdate as jest.Mock).mockResolvedValue(mockCandidate);
      const result = await service.softDelete(mockCandidate._id.toString());
      expect(result).toBeDefined();
    });

    it('should throw 404 if not found', async () => {
      (Candidate.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      await expect(service.softDelete(mockCandidate._id.toString())).rejects.toThrow('Candidat non trouvé');
    });
  });

  describe('asyncValidate', () => {
    it('should validate after delay', async () => {
      jest.useFakeTimers();
      const candidate = { 
        ...mockCandidate, 
        status: CandidateStatus.DRAFT, 
        save: jest.fn().mockResolvedValue(true) 
      };
      (Candidate.findOne as jest.Mock).mockResolvedValue(candidate);

      const promise = service.asyncValidate(mockCandidate._id.toString());
      
      // 1. Flush microtasks to reach the setTimeout line in the service
      await Promise.resolve();
      
      // 2. Advance timers
      jest.advanceTimersByTime(2000);
      
      // 3. Flush microtasks again to reach the end of the service function
      await Promise.resolve();
      await Promise.resolve();

      const result = await promise;
      expect(result.status).toBe(CandidateStatus.VALIDATED);
      expect(candidate.save).toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    it('should throw 400 if validation fails', async () => {
      jest.useFakeTimers();
      const invalidCandidate = { 
        ...mockCandidate, 
        firstName: 'J', // too short
        lastName: '', // too short
        skills: [], // empty
        email: 'invalid', // invalid format
        status: CandidateStatus.DRAFT 
      };
      (Candidate.findOne as jest.Mock).mockResolvedValue(invalidCandidate);

      const promise = service.asyncValidate(mockCandidate._id.toString());
      
      // Flush microtasks to reach setTimeout
      await Promise.resolve();
      
      jest.advanceTimersByTime(2000);
      
      // Flush microtasks to reach the throw statement
      await Promise.resolve();
      await Promise.resolve();

      await expect(promise).rejects.toThrow('Erreurs de validation');
      
      jest.useRealTimers();
    });

    it('should throw 404 if not found', async () => {
      (Candidate.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.asyncValidate(mockCandidate._id.toString())).rejects.toThrow('Candidat non trouvé');
    });

    it('should throw 400 if already validated', async () => {
      (Candidate.findOne as jest.Mock).mockResolvedValue({ ...mockCandidate, status: CandidateStatus.VALIDATED });
      await expect(service.asyncValidate(mockCandidate._id.toString())).rejects.toThrow('Le candidat est déjà validé');
    });
  });
});
