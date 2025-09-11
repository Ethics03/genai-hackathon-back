import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class TokenEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    // Get encryption key from environment
    const encryptionKey = this.configService.get<string>('TOKEN_ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('TOKEN_ENCRYPTION_KEY environment variable is required');
    }
    
    // Ensure key is 32 bytes for AES-256
    this.key = crypto.scryptSync(encryptionKey, 'gmail-token-salt', 32);
  }

  /**
   * Encrypt a token before storing in database
   */
  encryptToken(token: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    cipher.setAAD(Buffer.from('gmail-token-encryption', 'utf8'));
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt a token from database
   */
  decryptToken(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const { encrypted, iv, tag } = encryptedData;
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));
    decipher.setAAD(Buffer.from('gmail-token-encryption', 'utf8'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash a token for comparison (one-way)
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verify if a token matches the stored hash
   */
  verifyToken(token: string, hash: string): boolean {
    return this.hashToken(token) === hash;
  }
}