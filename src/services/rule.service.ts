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
    return null;
  }
}

export const ruleService = new RuleService();
