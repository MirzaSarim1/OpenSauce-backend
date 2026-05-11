import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'Logout confirmation',
    example: true,
  })
  success?: boolean;
}
