import { PrismaClient, RuleAction } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding rules...');

  const rules = [
    { pattern: ':(){ :|:& };:', action: RuleAction.AUTO_REJECT, cost: 0 },
    { pattern: 'rm\\s+-rf\\s+/', action: RuleAction.AUTO_REJECT, cost: 0 },
    { pattern: 'mkfs\\.', action: RuleAction.AUTO_REJECT, cost: 0 },
    { pattern: 'git\\s+(status|log|diff)', action: RuleAction.AUTO_ACCEPT, cost: 2 },
    { pattern: '^(ls|cat|pwd|echo)', action: RuleAction.AUTO_ACCEPT, cost: 1 }
  ];

  for (const rule of rules) {
    await prisma.commandRule.upsert({
      where: { pattern: rule.pattern },
      update: rule,
      create: rule,
    });
    console.log(`Upserted rule: ${rule.pattern} -> ${rule.action}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
