import { IsString, Length, IsUUID } from 'class-validator';

export class VerifyEmailDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp!: string;
}

export class ResendVerificationDto {
  @IsUUID()
  userId!: string;
}
