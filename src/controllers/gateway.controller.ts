import { Request, Response } from "express";
import { commandService } from "../services/command.service";
import { User } from "@prisma/client";

export class GatewayController {
  static async executeCommand(req: Request, res: Response) {
    try {
      const { command } = req.body;
      // we know it's a User because requireApiKey ensures it
      const user = req.user as User;

      if (!command) {
        res.status(400).json({ error: "Command is required" });
        return;
      }

      const result = await commandService.processCommand(user, command);

      res.json(result);
      
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
