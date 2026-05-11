import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private jwtService: NestJwtService) {}

  generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  generateTokenWithExpiry(payload: any, expiresIn: number): string {
    return this.jwtService.sign(payload, { expiresIn });
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
