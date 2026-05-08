import { errorMiddleware, createAppError, notFoundMiddleware } from '../../middleware/error.middleware';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Error Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockReq = { method: 'GET', originalUrl: '/test' };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('errorMiddleware', () => {
    it('should return 500 for generic errors', () => {
      const error = new Error('Generic error');
      errorMiddleware(error, mockReq as Request, mockRes as Response, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Erreur interne du serveur' })
      );
    });

    it('should return custom status for operational errors', () => {
      const error = createAppError('Custom error', 400);
      errorMiddleware(error, mockReq as Request, mockRes as Response, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Custom error' })
      );
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Debug error');
      errorMiddleware(error, mockReq as Request, mockRes as Response, nextFunction);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ stack: expect.any(String) })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFoundMiddleware', () => {
    it('should return 404 for non-existent routes', () => {
      notFoundMiddleware(mockReq as Request, mockRes as Response, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          error: 'Route GET /test non trouvée' 
        })
      );
    });
  });
});
