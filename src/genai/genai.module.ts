import { Module } from '@nestjs/common';
import { GenaiController } from './genai.controller';
import { GenaiService } from './genai.service';
import { PrismaService } from 'src/auth/prisma.service';
import { ConfigService } from '@nestjs/config';
import { McpService } from 'src/mcp/mcp.service';

@Module({
  controllers: [GenaiController],
  providers: [GenaiService, PrismaService, ConfigService, McpService],
})
export class GenaiModule {}
