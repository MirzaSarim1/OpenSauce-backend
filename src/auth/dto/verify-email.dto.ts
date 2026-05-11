import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'User ID from registration',
    example: 'cmp1f2xg50000h7m45r0g0e1s',
  })
  @IsString()
  userId!: string;

  @ApiProperty({
    description: '6-digit OTP from email',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp!: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'User ID',
    example: 'cmp1f2xg50000h7m45r0g0e1s',
  })
  @IsString()
  userId!: string;
}
