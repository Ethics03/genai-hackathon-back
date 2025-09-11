import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../auth/prisma.service';
import { TokenEncryptionService } from '../auth/token-encryption.service';

export interface GmailTokens {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
}

@Injectable()
export class GmailTokenService {
  private readonly logger = new Logger(GmailTokenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenEncryption: TokenEncryptionService,
  ) {}

  /**
   * Store Gmail tokens for a user (encrypted)
   */
  async storeTokens(userId: string, tokens: GmailTokens): Promise<void> {
    try {
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null;

      // Encrypt access token
      const accessTokenEncrypted = this.tokenEncryption.encryptToken(
        tokens.access_token,
      );

      // Encrypt refresh token if provided
      let refreshTokenEncrypted: {
        encrypted: string;
        iv: string;
        tag: string;
      } | null = null;
      if (tokens.refresh_token) {
        refreshTokenEncrypted = this.tokenEncryption.encryptToken(
          tokens.refresh_token,
        );
      }

      // Generate token hash for verification
      const tokenHash = this.tokenEncryption.hashToken(tokens.access_token);

      await this.prisma.gmailToken.upsert({
        where: { userId },
        update: {
          accessTokenEncrypted: accessTokenEncrypted.encrypted,
          accessTokenIv: accessTokenEncrypted.iv,
          accessTokenTag: accessTokenEncrypted.tag,
          refreshTokenEncrypted: refreshTokenEncrypted?.encrypted || null,
          refreshTokenIv: refreshTokenEncrypted?.iv || null,
          refreshTokenTag: refreshTokenEncrypted?.tag || null,
          tokenType: tokens.token_type || 'Bearer',
          scope: tokens.scope,
          expiresAt,
          tokenHash,
          lastUsedAt: new Date(),
          isActive: true,
        },
        create: {
          userId,
          accessTokenEncrypted: accessTokenEncrypted.encrypted,
          accessTokenIv: accessTokenEncrypted.iv,
          accessTokenTag: accessTokenEncrypted.tag,
          refreshTokenEncrypted: refreshTokenEncrypted?.encrypted || null,
          refreshTokenIv: refreshTokenEncrypted?.iv || null,
          refreshTokenTag: refreshTokenEncrypted?.tag || null,
          tokenType: tokens.token_type || 'Bearer',
          scope: tokens.scope,
          expiresAt,
          tokenHash,
          lastUsedAt: new Date(),
          isActive: true,
        },
      });

      this.logger.log(`Gmail tokens encrypted and stored for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to store Gmail tokens for user ${userId}:`,
        error,
      );
      throw new Error('Failed to store Gmail tokens');
    }
  }

  /**
   * Get valid Gmail tokens for a user (decrypted)
   */
  async getValidTokens(userId: string): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    try {
      const tokenRecord = await this.prisma.gmailToken.findUnique({
        where: { userId },
      });

      if (!tokenRecord || !tokenRecord.isActive) {
        throw new UnauthorizedException(
          `No active Gmail tokens found for user ${userId}`,
        );
      }

      // Decrypt access token
      const accessToken = this.tokenEncryption.decryptToken({
        encrypted: tokenRecord.accessTokenEncrypted,
        iv: tokenRecord.accessTokenIv,
        tag: tokenRecord.accessTokenTag,
      });

      // Check if token is expired
      if (tokenRecord.expiresAt && tokenRecord.expiresAt <= new Date()) {
        if (!tokenRecord.refreshTokenEncrypted) {
          throw new UnauthorizedException(
            `Gmail token expired for user ${userId} and no refresh token available`,
          );
        }

        // Decrypt refresh token
        const refreshToken = this.tokenEncryption.decryptToken({
          encrypted: tokenRecord.refreshTokenEncrypted,
          iv: tokenRecord.refreshTokenIv!,
          tag: tokenRecord.refreshTokenTag!,
        });

        // Return both tokens for refresh
        return { accessToken, refreshToken };
      }

      // Update last used timestamp
      await this.prisma.gmailToken.update({
        where: { id: tokenRecord.id },
        data: { lastUsedAt: new Date() },
      });

      // Decrypt refresh token if available
      let refreshToken: string | undefined;
      if (tokenRecord.refreshTokenEncrypted) {
        refreshToken = this.tokenEncryption.decryptToken({
          encrypted: tokenRecord.refreshTokenEncrypted,
          iv: tokenRecord.refreshTokenIv!,
          tag: tokenRecord.refreshTokenTag!,
        });
      }

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(
        `Failed to get valid tokens for user ${userId}:`,
        error,
      );
      throw new UnauthorizedException('Failed to retrieve Gmail tokens');
    }
  }

  /**
   * Update tokens after refresh
   */
  async updateTokens(userId: string, tokens: GmailTokens): Promise<void> {
    await this.storeTokens(userId, tokens);
    this.logger.log(`Gmail tokens updated for user ${userId}`);
  }

  /**
   * Check if user has valid Gmail tokens
   */
  async hasValidTokens(userId: string): Promise<boolean> {
    try {
      await this.getValidTokens(userId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deactivate user's Gmail tokens
   */
  async deactivateTokens(userId: string): Promise<void> {
    await this.prisma.gmailToken.update({
      where: { userId },
      data: { isActive: false },
    });
    this.logger.log(`Gmail tokens deactivated for user ${userId}`);
  }

  /**
   * Delete user's Gmail tokens
   */
  async deleteTokens(userId: string): Promise<void> {
    await this.prisma.gmailToken.delete({
      where: { userId },
    });
    this.logger.log(`Gmail tokens deleted for user ${userId}`);
  }

  /**
   * Get token metadata without decrypting
   */
  async getTokenMetadata(userId: string): Promise<{
    isActive: boolean;
    expiresAt: Date | null;
    lastUsedAt: Date | null;
    scope: string | null;
  } | null> {
    const tokenRecord = await this.prisma.gmailToken.findUnique({
      where: { userId },
      select: {
        isActive: true,
        expiresAt: true,
        lastUsedAt: true,
        scope: true,
      },
    });

    return tokenRecord;
  }
}
