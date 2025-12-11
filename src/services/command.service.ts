import { PrismaClient, User, CommandStatus, RuleAction } from "@prisma/client";
import { ruleService } from "./rule.service";

const prisma = new PrismaClient();

interface CommandResult {
  success: boolean;
  output: string;
  costDeducted: number;
  status: CommandStatus;
}

export class CommandService {
  async processCommand(user: User, command: string): Promise<CommandResult> {
    const rule = await ruleService.findMatchingRule(command);

    if (!rule || rule.action === RuleAction.AUTO_REJECT) {
      await this.logCommand(
        user.id,
        command,
        CommandStatus.BLOCKED,
        "Command blocked by gateway rules.",
        0
      );
      return {
        success: false,
        output: "Command blocked by gateway rules.",
        costDeducted: 0,
        status: CommandStatus.BLOCKED
      };
    }

    // handle time based rules
    if (rule.startTime && rule.endTime) {
        const now = new Date();
        const currentHash = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        let isWithinWindow = false;
        if (rule.startTime <= rule.endTime) {
            isWithinWindow = currentHash >= rule.startTime && currentHash <= rule.endTime;
        } else {
            // overnight window
            isWithinWindow = currentHash >= rule.startTime || currentHash <= rule.endTime;
        }

        if (!isWithinWindow) {
            await this.logCommand(
                user.id,
                command,
                CommandStatus.BLOCKED,
                "Command blocked by time based rules.",
                0
            );
            return {
                success: false,
                output: "Command blocked by time based rules.",
                costDeducted: 0,
                status: CommandStatus.BLOCKED
            };
        }
    }

    // Handle REQUIRE_APPROVAL
    if (rule.action === RuleAction.REQUIRE_APPROVAL) {
        // Check for existing approved request
        const approvedRequest = await prisma.approvalRequest.findFirst({
            where: {
                userId: user.id,
                command: command,
                status: 'APPROVED'
            }
        });

        if (approvedRequest) {
            await prisma.approvalRequest.delete({ where: { id: approvedRequest.id } });
        } else {
            // check if pending exists to avoid duplicates
            const pendingRequest = await prisma.approvalRequest.findFirst({
                where: {
                    userId: user.id,
                    command: command,
                    status: 'PENDING'
                }
            });

            if (!pendingRequest) {
                await prisma.approvalRequest.create({
                    data: {
                        userId: user.id,
                        command: command,
                        status: 'PENDING'
                    }
                });
            }

            await this.logCommand(user.id, command, CommandStatus.BLOCKED, "Approval Required", 0);
            return {
                success: false,
                output: "Command requires approval. Request submitted.",
                costDeducted: 0,
                status: CommandStatus.BLOCKED // blocked until approval
            };
        }
    }

    if (user.credits < rule.cost) {
      await this.logCommand(
        user.id,
        command,
        CommandStatus.BLOCKED,
        "Insufficient credits",
        0
      );
      return {
        success: false,
        output: "Insufficient credits.",
        costDeducted: 0,
        status: CommandStatus.BLOCKED
      };
    }

    const output = "Output mocked, command ran successfully!";
    const status: CommandStatus = CommandStatus.ALLOWED;

    try {
      // deduct cost ONLY after success
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: rule.cost } }
      });
    } catch (error: any) {
      // log if credits could not be deducted
      console.error("Failed to deduct credits:", error);
      return {
        success: false,
        output: "System error: Failed to process credits",
        costDeducted: 0,
        status: CommandStatus.FAILED
      };
    }

    await this.logCommand(user.id, command, status, output, rule.cost);

    return {
      success: true,
      output,
      costDeducted: rule.cost,
      status
    };
  }

  private async logCommand(
    userId: number,
    command: string,
    status: CommandStatus,
    output: string,
    cost: number
  ) {
    // for use in real world scenario if command is executing
    // const truncatedOutput = output.length > 1000 ? output.substring(0, 500) + '...' : output;
    const truncatedOutput = output;

    await prisma.commandLog.create({
      data: {
        userId,
        command,
        status,
        output: truncatedOutput,
        cost
      }
    });
  }
}

export const commandService = new CommandService();
