import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
@Injectable()
export class McpService implements OnApplicationBootstrap {
  private readonly logger = new Logger(McpService.name);
  private server: Server;
  private static initialized = false;

  private readonly emailSchema = z.object({
    to: z.string().email().describe('Recipient email address'),
    from: z.string().email().describe('Sender email address'),
    subject: z.string().describe('Subject of the email'),
    body: z.string().describe('Body of the email (plain text)'),
  });

  async onApplicationBootstrap() {
    if (McpService.initialized) {
      this.logger.warn('MCP service already initialized globally, skipping...');
      return;
    }
    McpService.initialized = true;
    this.server = new Server(
      {
        name: 'toolchain',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'send_sleep_report_gmail',
            description: 'Send weekly sleep report gmail',
            inputSchema: zodToJsonSchema(this.emailSchema, 'emailSchema'),
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'send_sleep_report_gmail':
          try {
            // TODO: Implementing actual email sending logic here
            this.logger.log(`Sending sleep report email to: ${args?.to}`);
            this.logger.log(`Subject: ${args?.subject}`);
            this.logger.log(`Body: ${args?.body}`);

            return {
              content: [
                {
                  type: 'text',
                  text: `Sleep report email sent successfully to ${args?.to}`,
                },
              ],
            };
          } catch (error) {
            this.logger.error('Failed to send sleep report email:', error);
            return {
              content: [
                {
                  type: 'text',
                  text: `Failed to send email: ${error.message}`,
                },
              ],
              isError: true,
            };
          }

        default:
          return {
            content: [
              {
                type: 'text',
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          };
      }
    });

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.log('MCP server connected via STDIO');
  }
}
