import request from 'supertest';
import express from 'express';
import authRouter from '../../routes/auth.routes';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes Error Handling', () => {
  it('should return 500 if bcrypt fails', async () => {
    // Mock bcrypt.compare to throw an error
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
      throw new Error('Bcrypt error');
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password' });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Erreur interne du serveur');
    
    jest.restoreAllMocks();
  });
});
