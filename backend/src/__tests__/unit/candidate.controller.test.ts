import { candidateController } from '../../controllers/candidate.controller';
import { candidateService } from '../../services/candidate.service';
import { Request, Response, NextFunction } from 'express';

// Mock the service
jest.mock('../../services/candidate.service', () => ({
  candidateService: {
    getAll: jest.fn(),
    softDelete: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    asyncValidate: jest.fn(),
  },
}));

describe('Controller Error Handling', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockReq = { params: { id: '123' }, query: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it('should handle errors in getAll', async () => {
    const error = new Error('Service error');
    (candidateService.getAll as jest.Mock).mockRejectedValue(error);
    await candidateController.getAll(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(error);
  });

  it('should handle errors in delete', async () => {
    const error = new Error('Service error');
    (candidateService.softDelete as jest.Mock).mockRejectedValue(error);
    await candidateController.delete(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(error);
  });

  it('should handle errors in update', async () => {
    const error = new Error('Service error');
    (candidateService.update as jest.Mock).mockRejectedValue(error);
    await candidateController.update(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(error);
  });

  it('should handle errors in getById', async () => {
    const error = new Error('Service error');
    (candidateService.getById as jest.Mock).mockRejectedValue(error);
    await candidateController.getById(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(error);
  });

  it('should handle errors in create', async () => {
    const error = new Error('Service error');
    (candidateService.create as jest.Mock).mockRejectedValue(error);
    await candidateController.create(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(error);
  });

  it('should handle errors in validate', async () => {
    const error = new Error('Service error');
    (candidateService.asyncValidate as jest.Mock).mockRejectedValue(error);
    await candidateController.validate(mockReq as Request, mockRes as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith(error);
  });
});
