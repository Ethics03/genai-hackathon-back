import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GmailTokenService } from './gmail-token.service';
import { PrismaService } from '../auth/prisma.service';
import { TokenEncryptionService } from '../auth/token-encryption.service';

@Module({
  providers: [
    GmailService,
    GmailTokenService,
    PrismaService,
    TokenEncryptionService,
  ],
  exports: [GmailService, GmailTokenService],
})
export class EmailModule {}
