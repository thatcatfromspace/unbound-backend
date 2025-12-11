import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { ruleService } from "../services/rule.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AdminController {
  // create user
  static async createUser(req: Request, res: Response) {
    try {
      const { email, role, credits } = req.body;

      if (!email || !role) {
        res.status(400).json({ error: "Email and role are required" });
        return;
      }

      let user = await authService.findUserByEmail(email);
      if (user) {
        res.status(409).json({ error: "User already exists" });
        return;
      }

      user = await authService.createUser(email, role, credits || 0);

      const apiKey = await authService.createApiKey(user.id);

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          credits: user.credits
        },
        apiKey // returned ONLY ONCE
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // add or update rule
  static async updateRule(req: Request, res: Response) {
    try {
      const { pattern, action, cost, startTime, endTime } = req.body;
      if (!pattern || !action || cost === undefined) {
        res
          .status(400)
          .json({
            error:
              "pattern, action (AUTO_ACCEPT/AUTO_REJECT), and cost are required"
          });
        return;
      }
      // validate if the rule is valid
      try {
        new RegExp(pattern);
      } catch (e: any) {
        res.status(400).json({ error: `Invalid regex pattern: ${e.message}` });
        return;
      }
      const rule = await ruleService.addRule(pattern, action, cost, startTime, endTime);
      res.json({ message: "Rule updated", rule });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // get all rules
  static async getRules(req: Request, res: Response) {
    try {
      const rules = await ruleService.getAllRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // get logs
  static async getLogs(req: Request, res: Response) {
    try {
      const logs = await prisma.commandLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 100,
        include: { user: { select: { email: true } } }
      });
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // get pending approval requests
  static async getPendingRequests(req: Request, res: Response) {
    try {
        const requests = await prisma.approvalRequest.findMany({
            where: { status: 'PENDING' },
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  }

  // approve a request
  static async approveRequest(req: Request, res: Response) {
      try {
          const { id } = req.params;
          await prisma.approvalRequest.update({
              where: { id: Number(id) },
              data: { status: 'APPROVED' }
          });
          res.json({ message: 'Request approved' });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  }

  // reject a request
  static async rejectRequest(req: Request, res: Response) {
      try {
          const { id } = req.params;
          await prisma.approvalRequest.update({
              where: { id: Number(id) },
              data: { status: 'REJECTED' }
          });
          res.json({ message: 'Request rejected' });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  }
}
