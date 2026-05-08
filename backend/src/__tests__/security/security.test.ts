import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../app';

let mongoServer: MongoMemoryServer;
let authToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin123' });
  authToken = loginRes.body.data.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Security Tests - NoSQL Injection', () => {
  describe('POST /api/candidates - Injection attempts', () => {
    it('should reject NoSQL injection in email field', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Hacker',
          lastName: 'Test',
          email: { $gt: '' },
          phone: '+33612345678',
          position: 'Hacker',
          experience: 1,
          skills: ['hacking'],
        });

      expect(res.status).toBe(400);
    });

    it('should reject NoSQL injection in firstName field', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: { $ne: null },
          lastName: 'Test',
          email: 'test@test.com',
          phone: '+33612345678',
          position: 'Test',
          experience: 1,
          skills: ['test'],
        });

      expect(res.status).toBe(400);
    });

    it('should reject $where operator injection', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Test',
          email: 'test@test.com',
          phone: '+33612345678',
          position: 'Test',
          experience: 1,
          skills: ['test'],
          $where: 'this.password === "admin"',
        });

      // Zod strips unknown keys, so it should succeed (no injection)
      // or fail validation but NOT execute the injection
      expect([201, 400]).toContain(res.status);
    });

    it('should handle prototype pollution attempt', async () => {
      const res = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Test',
          email: 'pollution@test.com',
          phone: '+33612345678',
          position: 'Test',
          experience: 1,
          skills: ['test'],
          __proto__: { isAdmin: true },
          constructor: { prototype: { isAdmin: true } },
        });

      // Should not crash, and the injected fields should be ignored
      expect([201, 400]).toContain(res.status);
    });
  });

  describe('GET /api/candidates - Injection in query params', () => {
    it('should handle injection in search query', async () => {
      const res = await request(app)
        .get('/api/candidates?search[$gt]=')
        .set('Authorization', `Bearer ${authToken}`);

      // Should not crash
      expect([200, 400]).toContain(res.status);
    });

    it('should handle injection in status filter', async () => {
      const res = await request(app)
        .get('/api/candidates?status[$ne]=draft')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      // Should return results as if invalid status filter (ignored)
    });
  });
});

describe('Security Tests - Auth Brute Force', () => {
  it('should reject login after multiple bad attempts via rate limiting', async () => {
    const attempts = [];

    // Send 15 rapid login attempts (limit is 10 per window)
    for (let i = 0; i < 15; i++) {
      attempts.push(
        request(app)
          .post('/api/auth/login')
          .send({ username: 'admin', password: `wrong${i}` })
      );
    }

    const results = await Promise.all(attempts);

    // Some of the later requests should be rate-limited (429)
    const rateLimited = results.filter((r) => r.status === 429);
    const unauthorized = results.filter((r) => r.status === 401);

    // At least some should be rate-limited
    expect(rateLimited.length).toBeGreaterThan(0);
    // Some should get through before being rate-limited
    expect(unauthorized.length).toBeGreaterThan(0);
  });
});
