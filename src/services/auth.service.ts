import crypto from "crypto";
import { PrismaClient, User, ApiKey } from "@prisma/client";

const prisma = new PrismaClient();

export class AuthService {
  async createApiKey(userId: number): Promise<string> {
    const randomBytes = crypto.randomBytes(24).toString("hex");
    const plaintextKey = `ub_cmd_gw_${randomBytes}`;

    // Create a hash of the key for storage
    const keyHash = crypto
      .createHash("sha256")
      .update(plaintextKey)
      .digest("hex");
    const prefix = plaintextKey.substring(0, 14);

    await prisma.apiKey.create({
      data: {
        keyHash,
        prefix,
        userId
      }
    });

    return plaintextKey;
  }

  async validateApiKey(key: string): Promise<User | null> {
    const prefix = key.substring(0, 14);
    const incomingHash = crypto.createHash("sha256").update(key).digest("hex");

    const tokenRecord = await prisma.apiKey.findUnique({
      where: { keyHash: incomingHash },
      include: { user: true }
    });

    if (!tokenRecord) return null;

    return tokenRecord.user;
  }

  // for debug purposes
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(
    email: string,
    role: "ADMIN" | "MEMBER",
    credits: number = 0
  ): Promise<User> {
    return prisma.user.create({
      data: {
        email,
        role,
        credits
      }
    });
  }
}

export const authService = new AuthService();
