import { IsString, IsInt, IsEnum, IsOptional, Min, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Difficulty, Cuisine } from '@prisma/client';

export class UpdateRecipeDto {
  @ApiProperty({ example: 'Spaghetti Carbonara', required: false })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Classic Italian pasta...', required: false })
  @IsString()
  @MinLength(10)
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '1. Cook pasta\n2. Mix eggs...', required: false })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ example: 10, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  prepTime?: number;

  @ApiProperty({ example: 20, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  cookTime?: number;

  @ApiProperty({ example: 'EASY', enum: Difficulty, required: false })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiProperty({ example: 'ITALIAN', enum: Cuisine, required: false })
  @IsEnum(Cuisine)
  @IsOptional()
  cuisine?: Cuisine;

  @ApiProperty({ example: '[{"name":"Pasta","quantity":"400","unit":"g"}]', required: false })
  @IsString()
  @IsOptional()
  ingredients?: string;

  @ApiProperty({ example: 'Lunch,Dinner', required: false })
  @IsString()
  @IsOptional()
  categories?: string;

  @ApiProperty({ example: 'Vegetarian,Quick', required: false })
  @IsString()
  @IsOptional()
  tags?: string;
}
