import {
  Body,
  Controller,
  Get,
  Req,
  Res,
  Request,
  Logger,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { createProfileDTO } from './dto/auth.dto';
import { SupabaseGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(private prisma: PrismaService) {}

  @Post('createProfile')
  @UseGuards(SupabaseGuard)
  async createProfile(
    @Req() req: any,
    @Body() body: createProfileDTO,
  ): Promise<{ message: string }> {
    let userCheck = await this.prisma.users.findUnique({
      where: { email: body.email },
    });

    this.logger.log(`Creating profile for ${userCheck?.email} `);

    if (!userCheck) {
      await this.prisma.users.create({
        data: {
          email: body.email,
          name: body.name,
          username: body.username,
          bio: body.bio,
        },
      });
      return { message: `${body.username} profile created successfully!` };
    }

    return { message: `${body.username} already exists!` };
  }
}
