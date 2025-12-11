import { PrismaClient, CommandRule, RuleAction } from "@prisma/client";

const prisma = new PrismaClient();

export class RuleService {
  async addRule(
    pattern: string,
    action: RuleAction,
    cost: number,
    startTime?: string,
    endTime?: string
  ): Promise<CommandRule> {
    // Check for conflicts
    const conflict = await this.checkConflict(pattern);
    if (conflict) {
      throw new Error(`Rule conflict detected with existing pattern: ${conflict.pattern}`);
    }

    return prisma.commandRule.upsert({
      where: { pattern },
      update: { action, cost, startTime, endTime },
      create: { pattern, action, cost, startTime, endTime }
    });
  }

  async checkConflict(newPattern: string): Promise<CommandRule | null> {
    const rules = await prisma.commandRule.findMany();
    for (const rule of rules) {
      // Basic overlap detection: check if one pattern is a substring of the other
      if (rule.pattern !== newPattern && (rule.pattern.includes(newPattern) || newPattern.includes(rule.pattern))) {
        return rule;
      }
    }
    return null;
  }

  async getAllRules(): Promise<CommandRule[]> {
    return prisma.commandRule.findMany();
  }

  async deleteRule(id: number): Promise<CommandRule> {
    return prisma.commandRule.delete({ where: { id } });
  }

  async findMatchingRule(command: string): Promise<CommandRule | null> {
    const rules = await prisma.commandRule.findMany();
    
    for (const rule of rules) {
      if (new RegExp(rule.pattern).test(command)) {
        return rule;
      }
    }
    
    return {
      id: 0,
      pattern: "*",
      action: RuleAction.AUTO_ACCEPT,
      cost: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: null,
      endTime: null
    } as CommandRule;
  }
}

export const ruleService = new RuleService();
