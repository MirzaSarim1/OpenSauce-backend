import { IsString, IsInt, IsEnum, IsOptional, Min, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Difficulty, Cuisine } from '@prisma/client';

export class CreateRecipeDto {
    @ApiProperty({ example: 'Spaghetti Carbonara'})
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title!: string;

    @ApiProperty({ example: 'Classic Italian pasta...'})
    @IsString()
    @MinLength(10)
    description!: string;

    @ApiProperty({ example: '1. Cook pasta\n 2. Mix eggs...'})
    @IsString()
    instructions!: string;

    @ApiProperty({ example: 10 })
    @IsInt()
    @Min(1)
    prepTime!: number;

    @ApiProperty({ example: 20 })
    @IsInt()
    @Min(1)
    cookTime!: number;  
    
    @ApiProperty({ example: 'EASY', enum: Difficulty })
    @IsEnum(Difficulty)
    @IsOptional()
    difficulty?: Difficulty = Difficulty.MEDIUM;

    @ApiProperty({ example: 'ITALIAN', enum: Cuisine })
    @IsEnum(Cuisine)
    @IsOptional()
    cuisine?: Cuisine;

    @ApiProperty({ example: '[{"name":"Pasta","quantity":"400","unit":"g"}]' })
    @IsString()
    ingredients!: string;

    @ApiProperty({ example: 'Lunch,Dinner' })
    @IsString()
    @IsOptional()
    categories?: string;

    @ApiProperty({ example: 'Vegetarian,Quick' })
    @IsString()
    @IsOptional()
    tags?: string;
}
