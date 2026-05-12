import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BCRYPT_SALT_ROUNDS, OTP_EXPIRY_MINUTES } from '../common/constants/constants';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getOTPExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
    return expiry;
  }

  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, name } = registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const otp = this.generateOTP();
    const otpExpiry = this.getOTPExpiry();

    const user = await this.prismaService.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        verificationToken: otp,
        verificationTokenExpiry: otpExpiry,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    await this.emailService.sendVerificationEmail(user.email, user.name, otp);

    return {
      success: true,
      userId: user.id,
      email: user.email,
      message: 'Verification email sent',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prismaService.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      image: user.image,
      bio: user.bio,
    };

    return {
      success: true,
      token: this.jwtService.generateToken(payload),
      user: payload,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
  const user = await this.prismaService.user.findUnique({
    where: { id: verifyEmailDto.userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.emailVerified) {
    throw new BadRequestException('Email already verified');
  }

  if (user.verificationToken !== verifyEmailDto.otp) {
    throw new BadRequestException('Invalid OTP');
  }

  if (!user.verificationTokenExpiry || new Date() > user.verificationTokenExpiry) {
    throw new BadRequestException('OTP expired');
  }

  const updated = await this.prismaService.user.update({
    where: { id: verifyEmailDto.userId },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
    },
  });

  return updated;
}

  async resendVerification(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = this.generateOTP();
    const otpExpiry = this.getOTPExpiry();

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        verificationToken: otp,
        verificationTokenExpiry: otpExpiry,
      },
    });

    await this.emailService.sendResendOtpEmail(user.email, user.name, otp);

    return {
      success: true,
      message: 'Verification email sent',
    };
  }

  async logout() {
    return {
      success: true,
      message: 'Logged out successfully',
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
}
