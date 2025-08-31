import { Module } from '@nestjs/common';
import { SupabaseGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [SupabaseGuard, AuthService, PrismaService],
})
export class AuthModule {}
