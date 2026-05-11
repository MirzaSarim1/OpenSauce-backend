import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createJwtToken(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      image: user.image,
      bio: user.bio,
    };

    return {
      access_token: this.jwtService.generateToken(payload),
      user: payload,
    };
  }

  async validateUser(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        emailVerified: true,
      },
    });
  }
}
