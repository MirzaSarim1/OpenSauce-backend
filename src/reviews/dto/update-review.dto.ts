import { IsInt, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({ example: 'Updated comment', required: false })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  comment?: string;
}
