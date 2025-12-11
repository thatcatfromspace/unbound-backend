import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './config/prisma';
// import redis from './config/redis'; // for later usage
import { authService } from './services/auth.service';
import { Role } from '@prisma/client';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Check connection
    await prisma.$connect();
    console.log('PostgreSQL connected');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@unboundsecurity.ai'; // :p
    const existingAdmin = await authService.findUserByEmail(adminEmail);
    if (!existingAdmin) {
      console.log('Seeding default admin user...');
      const admin = await authService.createUser(adminEmail, Role.ADMIN, 999999);
      const apiKey = await authService.createApiKey(admin.id);
      console.log('===========================================================');
      console.log(`ADMIN USER CREATED: ${adminEmail}`);
      console.log(`API KEY: ${apiKey}`);
      console.log('SAVE THIS KEY! IT WILL NOT BE SHOWN AGAIN.');
      console.log('===========================================================');
    } else {
        console.log(`Admin user ${adminEmail} already exists.`);
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error(error);
    prisma.$disconnect;
    process.exit(1);
  }
};

startServer();
