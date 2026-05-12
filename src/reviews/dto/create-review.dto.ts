import { IsInt, IsString, IsOptional, Min, Max, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateReviewDto {
    @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number;

    @ApiProperty({ example: 'Excellent recipe', required: false })
    @IsString()
    @MaxLength(500)
    @IsOptional()
    comment?: string;
}
