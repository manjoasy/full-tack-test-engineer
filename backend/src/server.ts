import mongoose from 'mongoose';
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    logger.info('Connecté à MongoDB', { uri: config.mongoUri });

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`Serveur démarré sur le port ${config.port}`, {
        port: config.port,
        env: config.nodeEnv,
      });
    });
  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur', { error });
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Rejet non géré', { reason });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Exception non capturée', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Signal SIGTERM reçu. Arrêt gracieux...');
  await mongoose.disconnect();
  process.exit(0);
});

startServer();
