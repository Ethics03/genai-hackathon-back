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

  @Post()
  @UseGuards(SupabaseGuard)
  async createProfile(
    @Req() req: any,
    @Body() body: createProfileDTO,
  ): Promise<{ message: string }> {
    const user = req.user;

    let userCheck = await this.prisma.users.findUnique({
      where: { email: user.email },
    });

    this.logger.log(`Creating profile for ${userCheck?.email} `);

    if (!userCheck) {
      await this.prisma.users.create({
        data: {
          email: user.email,
          name: user.name,
          username: user.username,
          bio: user.bio,
        },
      });
      return { message: `${user.userName} profile created successfully!` };
    }

    return { message: `${user.userName} already exists!` };
  }
}
