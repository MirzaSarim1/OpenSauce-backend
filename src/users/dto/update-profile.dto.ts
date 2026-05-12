import { IsEmail, IsString, IsOptional, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'User bio',
    example: 'I love cooking!',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    description: 'Remove profile image',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  removeImage?: boolean;
}
