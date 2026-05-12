import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
    constructor(private recipesService: RecipesService) {}

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    async create(
        @CurrentUser() user: { id: string },
        @Body() createRecipeDto: CreateRecipeDto,
        @UploadedFile() file?: { buffer: Buffer; originalname: string }, 
    ) {
        return this.recipesService.create(user.id, createRecipeDto, file);
    }

    @Public()
    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
    @ApiQuery({ name: 'difficulty', required: false, type: String })
    @ApiQuery({ name: 'cuisine', required: false, type: String })
    @ApiQuery({ name: 'category', required: false, type: String })
    @ApiQuery({ name: 'tag', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'recent' })
    async findAll(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 12,
        @Query('difficulty') difficulty?: string,
        @Query('cuisine') cuisine?: string,
        @Query('category') category?: string,
        @Query('tag') tag?: string,
        @Query('search') search?: string,
        @Query('sortBy') sortBy: string = 'recent',
    ) {
        return this.recipesService.findAll(
        page,
        limit,
        difficulty,
        cuisine,
        category,
        tag,
        search,
        sortBy,
        );
    }

    @Public()
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.recipesService.findOne(id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    async update(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() updateRecipeDto: UpdateRecipeDto,
        @UploadedFile() file?: { buffer: Buffer; originalname: string },
    ) {
        return this.recipesService.update(id, user.id, updateRecipeDto, file);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.recipesService.delete(id, user.id);
    }
}
