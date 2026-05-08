import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../schemas/candidate.schema';
import { logger } from '../utils/logger';

const router = Router();

// Hardcoded admin user for demo purposes
const ADMIN_USER = {
  id: 'admin-001',
  username: 'admin',
  // Hash of 'admin123'
  passwordHash: bcrypt.hashSync('admin123', 10),
};

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check username
    if (username !== ADMIN_USER.username) {
      logger.warn('Tentative de connexion échouée - utilisateur inconnu', { username });
      res.status(401).json({
        success: false,
        error: "Nom d'utilisateur ou mot de passe incorrect",
      });
      return;
    }

    // Check password
    const isValid = await bcrypt.compare(password, ADMIN_USER.passwordHash);
    if (!isValid) {
      logger.warn('Tentative de connexion échouée - mot de passe incorrect', { username });
      res.status(401).json({
        success: false,
        error: "Nom d'utilisateur ou mot de passe incorrect",
      });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: ADMIN_USER.id, username: ADMIN_USER.username },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    logger.info('Connexion réussie', { username });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: ADMIN_USER.id,
          username: ADMIN_USER.username,
        },
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion', { error });
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
    });
  }
});

export default router;
