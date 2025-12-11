import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './config/prisma';
import redis from './config/redis';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Check connections
    await prisma.$connect();
    console.log('PostgreSQL connected');
    
    if (redis.status === 'ready') {
      console.log('Redis connected');
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const exitHandler = async () => {
      if (server) {
        server.close(() => {
          console.log('Server closed');
        });
      }
      await prisma.$disconnect();
      await redis.quit();
      process.exit(1);
    };

    const unexpectedErrorHandler = (error: Error) => {
      console.error(error);
      exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
      console.log('SIGTERM received');
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
