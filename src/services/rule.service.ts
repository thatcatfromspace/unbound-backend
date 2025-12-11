import { PrismaClient, CommandRule, RuleAction } from "@prisma/client";

const prisma = new PrismaClient();

export class RuleService {
  async addRule(
    pattern: string,
    action: RuleAction,
    cost: number
  ): Promise<CommandRule> {
    return prisma.commandRule.upsert({
      where: { pattern },
      update: { action, cost },
      create: { pattern, action, cost }
    });
  }

  async getAllRules(): Promise<CommandRule[]> {
    return prisma.commandRule.findMany();
  }

  async deleteRule(id: number): Promise<CommandRule> {
    return prisma.commandRule.delete({ where: { id } });
  }

  // explicitly stated that first rule match takes precedence
  // TODO: use an in-memmory DB for bulk access?
  async findMatchingRule(command: string): Promise<CommandRule | null> {
    const rules = await prisma.commandRule.findMany();

    for (const rule of rules) {
      if (new RegExp(rule.pattern).test(command)) {
        return rule;
      }
    }
    // if no match found, return default allow rule
    return {
      id: 0,
      pattern: "*",
      action: RuleAction.AUTO_ACCEPT,
      cost: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    } as CommandRule;
  }
}

export const ruleService = new RuleService();
