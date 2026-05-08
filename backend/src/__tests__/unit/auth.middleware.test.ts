import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() if token is valid', () => {
    const token = jwt.sign({ userId: 'admin-001' }, config.jwtSecret);
    mockReq.headers = { authorization: `Bearer ${token}` };

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.userId).toBe('admin-001');
  });

  it('should return 401 if no auth header is present', () => {
    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Token d'authentification manquant" })
    );
  });

  it('should return 401 if token is empty after Bearer prefix', () => {
    mockReq.headers = { authorization: 'Bearer ' };

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Token d'authentification manquant" })
    );
  });

  it('should return 401 if token is invalid', () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Token d'authentification invalide" })
    );
  });

  it('should return 401 if token is expired', () => {
    const token = jwt.sign(
      { userId: 'admin-001', exp: Math.floor(Date.now() / 1000) - 3600 },
      config.jwtSecret
    );
    mockReq.headers = { authorization: `Bearer ${token}` };

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Le token d'authentification a expiré" })
    );
  });

  it('should accept token without Bearer prefix', () => {
    const token = jwt.sign({ userId: 'admin-001' }, config.jwtSecret);
    mockReq.headers = { authorization: token };

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.userId).toBe('admin-001');
  });

  it('should return 500 for generic errors during verification', () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };

    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Generic error');
    });

    authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Erreur interne du serveur' })
    );
    
    jest.restoreAllMocks();
  });
});
