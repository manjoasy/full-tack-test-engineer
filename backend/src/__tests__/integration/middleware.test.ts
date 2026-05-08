import request from 'supertest';
import app from '../../app';
import jwt from 'jsonwebtoken';

// Mock config to allow changing nodeEnv
jest.mock('../../config', () => ({
  config: {
    port: 5000,
    mongoUri: 'mongodb://localhost:27017/test',
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1h',
    nodeEnv: 'test',
  },
}));

// We still mock logger but we will add a separate test for it if needed
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

import { config } from '../../config';

describe('Middleware Coverage Tests', () => {
  describe('Auth Middleware', () => {
    it('should return 401 when authHeader is "Bearer "', async () => {
      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', 'Bearer ');

      expect(res.status).toBe(401);
      // The error message might depend on exact whitespace handling
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Token d'authentification manquant/);
    });

    it('should return 401 for expired token', async () => {
      // Mock jwt.verify to throw TokenExpiredError
      const spy = jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', 'Bearer some-token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Le token d'authentification a expiré");
      spy.mockRestore();
    });

    it('should return 500 for unexpected error in auth middleware', async () => {
      // Mock jwt.verify to throw generic error
      const spy = jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', 'Bearer some-token');

      expect(res.status).toBe(500);
      spy.mockRestore();
    });
  });

  describe('Error Middleware - Environment branches', () => {
    it('should show stack trace in development environment', async () => {
      // Change mocked config
      (config as { nodeEnv: string }).nodeEnv = 'development';
      
      const res = await request(app).get('/api/non-existent-route');
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('stack');
      
      (config as { nodeEnv: string }).nodeEnv = 'test';
    });
  });
});
