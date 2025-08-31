import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const header = req.headers['authorization'];

    if (!header) throw new UnauthorizedException('No token provided');

    const token = header.split(' ')[1];
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data) {
      throw new UnauthorizedException('Invalid or Expired Token');
    }

    req.user = data.user;

    return true;
  }
}
