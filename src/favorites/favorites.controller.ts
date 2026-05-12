import { Controller,Post,Get,Param,Query,UseGuards,ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Favorites')
@Controller()
export class FavoritesController {
    constructor(private favoritesService: FavoritesService) { }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('favorites/:recipeId')
    async toggle(
        @Param('recipeId') recipeId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.favoritesService.toggle(recipeId, user.id);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('favorites')
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
    async findUserFavorites(
        @CurrentUser() user: { id: string },
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 12,
    ) {
        return this.favoritesService.findUserFavorites(user.id, page, limit);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Get('recipes/:recipeId/favorites/check')
    async checkIfFavorited(
        @Param('recipeId') recipeId: string,
        @CurrentUser() user: { id: string },
    ) {
        return this.favoritesService.checkIfFavorited(recipeId, user.id);
    }

    @Public()
    @Get('recipes/:recipeId/favorites/count')
    async getCount(@Param('recipeId') recipeId: string) {
        return this.favoritesService.getCount(recipeId);
    }
}
